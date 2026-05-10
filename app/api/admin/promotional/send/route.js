import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PromotionalCampaign from "@/models/PromotionalCampaign";

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.userId);

    if (!admin || admin.userType !== "owner") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { subject, header, message, bannerUrl, recipients } = await req.json();

    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 📩 Setup Transporters
    const transporters = [
      {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      {
        user: process.env.GMAIL_USER1,
        pass: process.env.GMAIL_APP_PASSWORD1,
      },
    ].filter(acc => acc.user && acc.pass).map(acc => 
      nodemailer.createTransport({
        service: "gmail",
        auth: { user: acc.user, pass: acc.pass },
      })
    );

    if (transporters.length === 0) {
      return NextResponse.json({ success: false, message: "Email configuration missing" }, { status: 500 });
    }

    // 📊 Create Campaign record
    const campaign = await PromotionalCampaign.create({
      subject,
      header,
      message,
      bannerUrl,
      recipientsCount: recipients.length,
      status: "processing",
      sentBy: admin.username,
    });

    let successCount = 0;
    let errorCount = 0;
    const logs = [];

    // 🚀 Start sending in background (but we wait for it to finish for simple implementation)
    // For large lists, this should be a background job.
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const transporterIndex = i % transporters.length;
      const transporter = transporters[transporterIndex];
      const senderEmail = i % transporters.length === 0 ? process.env.GMAIL_USER : process.env.GMAIL_USER1;

      try {
        await transporter.sendMail({
          from: `"${header || "Promotion"}" <${senderEmail}>`,
          to: recipient.email,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
              ${bannerUrl ? `<img src="${bannerUrl}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" alt="Promo Banner" />` : ""}
              <h1 style="color: #333; margin-top: 0;">${header || subject}</h1>
              <div style="color: #555; line-height: 1.6; font-size: 16px;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999; text-align: center;">
                You are receiving this because you are a registered user of ${process.env.NEXT_PUBLIC_BRAND_NAME || "our platform"}.
              </p>
            </div>
          `,
        });
        successCount++;
        logs.push({ email: recipient.email, status: "success" });
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err);
        errorCount++;
        logs.push({ email: recipient.email, status: "error", error: err.message });
      }
    }

    // 🏁 Update Campaign
    campaign.successCount = successCount;
    campaign.errorCount = errorCount;
    campaign.status = "completed";
    campaign.logs = logs;
    await campaign.save();

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} emails, ${errorCount} failed.`,
      campaignId: campaign._id,
    });

  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
