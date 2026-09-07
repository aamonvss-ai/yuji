import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PwaStat from "@/models/PwaStat";

function parseDevice(userAgent = "") {
  const ua = userAgent.toLowerCase();
  let platform = "Other";
  let browser = "Other";

  if (/android/.test(ua)) platform = "Android";
  else if (/iphone|ipad|ipod/.test(ua)) platform = "iOS";
  else if (/windows/.test(ua)) platform = "Windows";
  else if (/macintosh|mac os x/.test(ua)) platform = "macOS";
  else if (/linux/.test(ua)) platform = "Linux";

  if (/samsungbrowser/.test(ua)) browser = "Samsung Internet";
  else if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\//.test(ua) || /opera/.test(ua)) browser = "Opera";
  else if (/chrome|crios/.test(ua)) browser = "Chrome";
  else if (/safari/.test(ua) && !/chrome|crios/.test(ua)) browser = "Safari";
  else if (/firefox|fxios/.test(ua)) browser = "Firefox";

  return { platform, browser };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventType, userId, userName } = body;

    const allowedEvents = [
      "prompt_shown",
      "install_accepted",
      "install_dismissed",
      "app_installed",
      "standalone_session"
    ];

    if (!eventType || !allowedEvents.includes(eventType)) {
      return NextResponse.json({ success: false, message: "Invalid event type" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    const { platform, browser } = parseDevice(userAgent);

    await connectDB();

    await PwaStat.create({
      eventType,
      platform,
      browser,
      userAgent: userAgent.slice(0, 300),
      userId: userId || null,
      userName: userName || null,
      ip
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PWA TRACKING ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
