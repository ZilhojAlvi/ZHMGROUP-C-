import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const APP_NAME = "SRMS";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!EMAIL_USER || !EMAIL_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
      family: 4, // force IPv4 to avoid Render's IPv6 timeout issue
    });
  }
  return transporter;
}

async function sendMail(to: string, subject: string, html: string, text: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // In local development without EMAIL_USER/EMAIL_PASSWORD configured, log
    // instead of throwing, so the auth flow is still testable end-to-end.
    console.warn(
      `[email] EMAIL_USER/EMAIL_PASSWORD not configured — printing email instead of sending.\nTo: ${to}\nSubject: ${subject}\n${text}`
    );
    return;
  }
  await t.sendMail({
    from: `"${APP_NAME}" <${EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendVerificationEmail(to: string, fname: string, token: string): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail(
    to,
    `Verify your ${APP_NAME} account`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Welcome to ${APP_NAME}, ${fname}!</h2>
      <p>Please confirm your email address to activate your account.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">Verify email</a></p>
      <p>Or copy this link into your browser:<br/>${link}</p>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>`,
    `Welcome to ${APP_NAME}, ${fname}! Verify your email: ${link} (expires in 24 hours)`
  );
}

export async function sendPasswordResetEmail(to: string, fname: string, token: string): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail(
    to,
    `Reset your ${APP_NAME} password`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Password reset requested</h2>
      <p>Hi ${fname}, we received a request to reset your password.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p>Or copy this link into your browser:<br/>${link}</p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
    </div>`,
    `Reset your password: ${link} (expires in 1 hour). If you didn't request this, ignore this email.`
  );
}
