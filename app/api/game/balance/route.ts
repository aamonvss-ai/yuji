import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    /* ================= AUTH ================= */
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.userType !== "owner") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    /* ================= FETCH ================= */
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api-service/balance?currency=USD`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    });

    const data = await resp.json();


    return NextResponse.json({ success: true, balance: data });
  } catch (error: any) {
    console.error("BALANCE CHECK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Error checking balance", error: error.message },
      { status: 500 }
    );
  }
}
