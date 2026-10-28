import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";
import SystemSettings from "@/models/SystemSettings";
import { unstable_cache } from 'next/cache';

const ALLOWED_GAME_SLUGS = [
  "mobile-legends114",
  "mlbb-double332",
  "sgmy-mlbb893",
  "value-pass-ml838",
  // "magic-chess-gogo-india924",
  // "mlbb-indo42",
    "mlbb-russia46",
      "mobile-legends-united-states41",
  "mlbbglobal202",          // Global
  "mlbbtr112",
  "mlbbbr178",
  "mobile-legends-exclusive952",
  // "mlbb-russia953",
  "pubg-mobile138",
  // "genshin-impact265",
  // "honor-of-kings57",
  "wuthering-of-waves464",
  "where-winds-meet280",
  // "mlbb-smallphp980",
  "weeklymonthly-bundle646",
  "8ballpool498",
  "honor-of-kings57",
  "mobile-legends-philippines888",
       "mlbbph643",
       "flash-weekly621"
  
];

const getCachedGameBySlug = unstable_cache(
  async (slug) => {
    try {
      const res = await fetch(
        `https://game-off-ten.vercel.app/api/v1/game/${slug}`,
        {
          headers: { "x-api-key": process.env.API_SECRET_KEY },
          next: { revalidate: 60 }
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
  ['remote-game-slug'],
  { revalidate: 60 }
);

const getCachedSystemSettings = unstable_cache(
  async () => {
    try {
      await connectDB();
      const settings = await SystemSettings.findOne().lean();
      return {
        acceptingOrders: settings?.acceptingOrders !== false,
        notAcceptingOrdersMessage: settings?.notAcceptingOrdersMessage || "We are not taking orders right now. Please come back later."
      };
    } catch {
      return {
        acceptingOrders: true,
        notAcceptingOrdersMessage: "We are not taking orders right now. Please come back later."
      };
    }
  },
  ['system-settings-orders'],
  { revalidate: 60 }
);

const getCachedAllPricingConfigs = unstable_cache(
  async () => {
    await connectDB();
    return await PricingConfig.find({}).lean();
  },
  ['all-pricing-configs'],
  { revalidate: 60 }
);

/* ================= MEMBERSHIP CONFIG ================= */
const MEMBERSHIPS = {
  "silver-membership": {
    gameName: "Silver Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/silver-m.png",
    },
    gameDescription: "Unlock premium pricing and basic benefits.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "silver-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "silver-3m",
        sellingPrice: 299,
        dummyPrice: 1099,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
    ],
  },

  "reseller-membership": {
    gameName: "Reseller Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/reseller-m.png",
    },
    gameDescription: "Get reseller pricing, bulk access & dashboard.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "reseller-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "reseller-3m",
        sellingPrice: 299,
        dummyPrice: 1099,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
    ],
  },
};

/* ================= OTT CONFIG ================= */
const OTTS = {
  "youtube-premium": {
    gameName: "YouTube Premium",
    gameFrom: "Google",
    gameImageId: {
      image: "/ott/youtube.webp",
    },
    gameDescription: "Ad-free YouTube, background play, YouTube Music.",
    inputFieldOne: "Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "yt-1m",
        sellingPrice: 30,
        dummyPrice: 199,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/youtube.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "yt-3m",
        sellingPrice: 90,
        dummyPrice: 499,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/youtube.webp",
        },
      },
    ],
  },

  netflix: {
    gameName: "Netflix",
    gameFrom: "Netflix Inc.",
    gameImageId: {
      image: "/ott/netflix.webp",
    },
    gameDescription: "Movies & series streaming subscription.",
    inputFieldOne: "Account Email",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "nf-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/netflix.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "nf-3m",
        sellingPrice: 249,
        dummyPrice: 799,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/netflix.webp",
        },
      },
    ],
  },

  spotify: {
    gameName: "Spotify Premium",
    gameFrom: "Spotify",
    gameImageId: {
      image: "/ott/spotify.webp",
    },
    gameDescription: "Ad-free music streaming.",
    inputFieldOne: "Account Email",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "sp-1m",
        sellingPrice: 119,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/spotify.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "sp-3m",
        sellingPrice: 299,
        dummyPrice: 599,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/spotify.webp",
        },
      },
    ],
  },
};

/* ================= ROLE → PRICING (FIXED) ================= */
const resolvePricingRole = (role) => {
  if (["user", "member", "admin"].includes(role)) return role;
  return null; // owner → base price
};

/* ================= API ================= */
export async function GET(req, { params }) {
  const { slug } = await params;

  try {
    /* ===== STATIC PRODUCTS ===== */
    if (OTTS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...OTTS[slug] },
      });
    }

    if (MEMBERSHIPS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...MEMBERSHIPS[slug] },
      });
    }

    /* ===== OPTIONAL AUTH ===== */
    let userType = "user";
    const auth = req.headers.get("authorization");

    if (auth?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET
        );
        if (decoded?.userType) userType = decoded.userType;
      } catch { }
    }

    const pricingRole = resolvePricingRole(userType);

    /* ===== FETCH BASE GAME ===== */
    if (!ALLOWED_GAME_SLUGS.includes(slug)) {
      return NextResponse.json(
        { success: false, message: "Game not found or restricted" },
        { status: 404 }
      );
    }

    const [data, settings, allConfigs] = await Promise.all([
      getCachedGameBySlug(slug),
      getCachedSystemSettings(),
      getCachedAllPricingConfigs(),
    ]);

    if (!data?.data?.itemId) {
      return NextResponse.json(data || { success: false, message: "Game data unavailable" });
    }

    /* ===== ATTACH SYSTEM SETTINGS ===== */
    data.data.systemSettings = settings;

    let pricingConfig = null;
    if (pricingRole && allConfigs) {
      pricingConfig = allConfigs.find((c) => c.userType === pricingRole);
    }

    /* ===== APPLY PRICING & STOCK ===== */
    const gameSlug = data.data.gameSlug;

    // Check if the whole game is marked out of stock globally for all user types
    const isGameOOS = allConfigs.some((cfg) =>
      cfg?.gameOverrides?.some((o) => o.gameSlug === gameSlug && o.isOutOfStock)
    );

    if (isGameOOS) {
      data.data.gameAvailablity = false;
      data.data.isOutOfStock = true;
    }

    data.data.itemId = data.data.itemId.map((item) => {
      const basePrice = Number(item.sellingPrice);
      let finalPrice = basePrice;
      let itemOutOfStock = isGameOOS;

      // Check if item is out of stock globally across any config
      const isGlobalItemOOS = allConfigs.some((cfg) =>
        cfg?.overrides?.some((o) => o.gameSlug === gameSlug && o.itemSlug === item.itemSlug && o.isOutOfStock)
      );
      if (isGlobalItemOOS) {
        itemOutOfStock = true;
      }

      const override = pricingConfig?.overrides?.find(
        (o) =>
          o.gameSlug === gameSlug &&
          o.itemSlug === item.itemSlug
      );

      if (override) {
        if (override.isOutOfStock) {
          itemOutOfStock = true;
        }

        if (override.isOverride) {
          finalPrice = override.fixedPrice;
        } else {
          const slab = pricingConfig?.slabs?.find(
            (s) => basePrice >= s.min && basePrice < s.max
          );
          if (slab) {
            finalPrice = basePrice * (1 + slab.percent / 100);
          }
        }
      } else {
        const slab = pricingConfig?.slabs?.find(
          (s) => basePrice >= s.min && basePrice < s.max
        );
        if (slab) {
          finalPrice = basePrice * (1 + slab.percent / 100);
        }
      }

      return {
        ...item,
        sellingPrice: Math.ceil(finalPrice),
        itemAvailablity: !itemOutOfStock && item.itemAvailablity !== false,
        isOutOfStock: Boolean(itemOutOfStock || item.itemAvailablity === false),
      };
    });

    if (slug === "value-pass-ml838" || data?.data?.gameName?.toLowerCase() === "value pass ml") {
      data.data.gameImageId = {
        ...data?.data?.gameImageId,
        image: "https://busan-public.s3.ap-south-1.amazonaws.com/01da48b550c0da28227e73f9e00e1cc7-TimeLimitedSuperValuePass.png",
      };
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });
  } catch (err) {
    console.error("Game Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
