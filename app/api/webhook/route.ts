import { NextRequest, NextResponse } from "next/server";

// Disable bodyParser so we can manually read raw body if needed
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function readRawBody(req: NextRequest) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("utf8");
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await readRawBody(req);


    let json;
    try {
      json = JSON.parse(rawBody);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { status, order_id, remark1 } = json;


    if (status === "SUCCESS") {
      // TODO: update database order → success
      return NextResponse.json(
        { message: "Webhook received successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: `Invalid Status: ${status}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Invalid request method" },
    { status: 400 }
  );
}
