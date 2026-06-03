import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.info(`[email:dev] ${to} | ${subject} | ${text}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transport.sendMail({ from: process.env.SMTP_USER, to, subject, text });
}
