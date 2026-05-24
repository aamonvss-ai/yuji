import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      pool: {
        maxConnections: 1,
        maxMessages: Infinity,
        rateDelta: 1000,
        rateLimit: 5,
      },
    });
  }
  return transporter;
}

export async function sendAuthOtpMail(email, otp) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Authentication OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Login Verification</h2>
        <p style="color: #555; font-size: 16px; text-align: center;">Here is your One-Time Password (OTP) to securely sign in or register:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
          <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #111;">${otp}</h1>
        </div>
        <p style="color: #555; font-size: 14px; text-align: center;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;" />
        <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this email, you can safely ignore it.</p>
      </div>
    `,
  });
}
