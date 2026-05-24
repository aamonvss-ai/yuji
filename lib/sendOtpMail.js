import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // 🔐 App Password
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

export async function sendOtpMail(email, otp) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
}
