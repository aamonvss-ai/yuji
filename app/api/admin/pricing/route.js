import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

/* ================= AUTH HELPERS ================= */
const requireOwner = (req) => {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "owner") {
      return { error: "Forbidden", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

const requireAdminMemberOwner = (req) => {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // owner, admin, member can VIEW pricing
    if (!["owner", "admin", "member"].includes(decoded.userType)) {
      return { error: "Forbidden", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

/* =================================================
   GET → Fetch pricing (SEPARATE FOR ALL ROLES)
   ================================================= */
export async function GET(req) {
  try {
    await connectDB();

    const authCheck = requireAdminMemberOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType");

    if (!userType) {
      return NextResponse.json(
        { success: false, message: "userType is required" },
        { status: 400 }
      );
    }

    if (!["user", "member", "admin"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Invalid userType" },
        { status: 400 }
      );
    }

    const pricing = await PricingConfig.findOne({
      userType,
    }).lean();

    // Collect all gameOverrides across all roles so stock is always globally synchronized
    const allConfigs = await PricingConfig.find({}).lean();
    const mergedGameOverridesMap = new Map();
    for (const go of pricing?.gameOverrides || []) {
      if (go?.gameSlug) mergedGameOverridesMap.set(go.gameSlug, go);
    }
    for (const cfg of allConfigs) {
      for (const go of cfg?.gameOverrides || []) {
        if (go?.gameSlug) {
          if (!mergedGameOverridesMap.has(go.gameSlug) || go.isOutOfStock) {
            mergedGameOverridesMap.set(go.gameSlug, go);
          }
        }
      }
    }
    const finalGameOverrides = Array.from(mergedGameOverridesMap.values());

    return NextResponse.json({
      success: true,
      data: {
        slabs: pricing?.slabs || [],
        overrides: pricing?.overrides || [],
        gameOverrides: finalGameOverrides,
      },
    });
  } catch (err) {
    console.error("GET pricing error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* =================================================
   PATCH → Save pricing
   OWNER sets pricing for user / member / admin
   ================================================= */
export async function PATCH(req) {
  try {
    await connectDB();

    const authCheck = requireOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await req.json();

    /* ================= DIRECT TOGGLE STOCK ACTION ================= */
    if (body.action === "toggle-game-stock") {
      const { gameSlug, isOutOfStock } = body;
      if (!gameSlug) {
        return NextResponse.json({ success: false, message: "gameSlug is required" }, { status: 400 });
      }

      // Update across ALL PricingConfig roles so out-of-stock applies to ALL user types (even owner)
      const allRoles = ["user", "member", "admin", "owner"];
      for (const role of allRoles) {
        let cfg = await PricingConfig.findOne({ userType: role });
        if (!cfg) {
          cfg = new PricingConfig({ userType: role, slabs: [], overrides: [], gameOverrides: [] });
        }
        let list = cfg.gameOverrides || [];
        const existingIdx = list.findIndex((o) => o.gameSlug === gameSlug);
        if (existingIdx > -1) {
          list[existingIdx].isOutOfStock = Boolean(isOutOfStock);
        } else {
          list.push({ gameSlug, isOutOfStock: Boolean(isOutOfStock) });
        }
        cfg.gameOverrides = list;
        await cfg.save();
      }

      return NextResponse.json({
        success: true,
        message: `Stock for ${gameSlug} updated to ${isOutOfStock ? "OFF" : "ON"} for all user types`,
      });
    }

    let { userType, slabs = [], overrides = [], gameOverrides = [] } = body;

    if (!userType) {
      return NextResponse.json(
        { success: false, message: "userType is required" },
        { status: 400 }
      );
    }

    userType = userType.trim().toLowerCase();

    const validRoles = ["user", "member", "admin", "owner"];
    if (!validRoles.includes(userType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role: ${userType}. Supported roles are ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    /* ================= VALIDATE SLABS ================= */
    for (const s of slabs) {
      if (
        typeof s.min !== "number" ||
        typeof s.max !== "number" ||
        typeof s.percent !== "number"
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid slab format: min, max, and percent must be numbers" },
          { status: 400 }
        );
      }
    }

    /* ================= VALIDATE OVERRIDES ================= */
    for (const o of overrides) {
      if (
        !o.gameSlug ||
        !o.itemSlug ||
        typeof o.fixedPrice !== "number" ||
        o.fixedPrice < 0
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid override format: gameSlug, itemSlug, and valid fixedPrice are required" },
          { status: 400 }
        );
      }
    }

    /* ================= LOAD EXISTING ================= */
    let existing = await PricingConfig.findOne({ userType });

    if (!existing) {
      existing = new PricingConfig({ userType, slabs: [], overrides: [] });
    }

    /* ================= MERGE OVERRIDES ================= */
    // key = gameSlug::itemSlug
    const overrideMap = new Map();

    // keep existing overrides
    for (const o of existing.overrides || []) {
      if (o.gameSlug && o.itemSlug) {
        overrideMap.set(`${o.gameSlug}::${o.itemSlug}`, o);
      }
    }

    // apply incoming overrides (replace or add)
    for (const o of overrides) {
      overrideMap.set(`${o.gameSlug}::${o.itemSlug}`, {
        gameSlug: o.gameSlug,
        itemSlug: o.itemSlug,
        fixedPrice: o.fixedPrice,
        isOverride: o.isOverride ?? false,
        isOutOfStock: o.isOutOfStock ?? false,
      });
    }

    const mergedOverrides = Array.from(overrideMap.values());

    /* ================= SAVE ================= */
    existing.slabs = slabs;
    existing.overrides = mergedOverrides;
    if (Array.isArray(gameOverrides)) {
      existing.gameOverrides = gameOverrides;
    }

    try {
      await existing.save();

      // Ensure game stock overrides are universally applied to ALL user types (user, member, admin, owner)
      if (Array.isArray(gameOverrides) && gameOverrides.length > 0) {
        await PricingConfig.updateMany({}, { $set: { gameOverrides } });
      }
    } catch (saveError) {
      console.error(`Database save error for userType ${userType}:`, saveError);
      return NextResponse.json(
        { success: false, message: saveError.message || "Database save failed" },
        { status: 400 } // Likely a validation or constraint error
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pricing for ${userType} updated successfully`,
      data: existing,
    });
  } catch (err) {
    console.error("PATCH pricing error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
