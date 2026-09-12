import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const configured = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = configured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      disableFileAccess: true,
      disableUrlAccess: true,
    })
  : null;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#20242c;max-width:640px;margin:auto">
      <h1 style="font-size:24px">${escapeHtml(title)}</h1>
      <div>${body}</div>
      <p style="color:#667085;font-size:13px;margin-top:28px">FreelanceHub sends this notification for important account, order, and payment updates.</p>
    </div>
  `;
}

const emailLog = [];
export function getEmailLog() {
  return emailLog;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!configured) {
    console.warn(`[mail skipped] ${subject} -> ${to}`);
    emailLog.unshift({ to, subject, html, text, createdAt: new Date() });
    if (emailLog.length > 50) emailLog.pop();
    return { skipped: true };
  }

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  });
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to FreelanceHub",
    html: shell(
      "Welcome to FreelanceHub",
      `<p>Hi ${escapeHtml(user.name)}, your account is ready. You can now hire talent, sell services, and use protected milestone payments.</p>`,
    ),
    text: `Hi ${user.name}, your FreelanceHub account is ready.`,
  });
}

export async function sendLoginEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "New FreelanceHub login",
    html: shell(
      "New login detected",
      `<p>Hi ${escapeHtml(user.name)}, your FreelanceHub account was just used to sign in.</p><p>If this was not you, reset your password immediately.</p>`,
    ),
    text: `Hi ${user.name}, your FreelanceHub account was just used to sign in.`,
  });
}

export async function sendOrderEmail({ user, subject, title, message }) {
  return sendEmail({
    to: user.email,
    subject,
    html: shell(title, `<p>${escapeHtml(message)}</p>`),
    text: message,
  });
}

export async function sendPaymentReceiptEmail({ user, amount, transactionId, type = "Wallet Top-Up", description = "Escrow Deposit Ledger Top-Up", date = new Date() }) {
  const dateStr = new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const amountFormatted = `₹${Number(amount).toLocaleString('en-IN')}`;

  const receiptHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 28px; color: #ffffff; text-align: left;">
        <div style="font-size: 22px; font-weight: 800; color: #c084fc; letter-spacing: -0.5px;">FreelanceHub</div>
        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Official Escrow Transaction Receipt</div>
      </div>

      <!-- Success Badge Bar -->
      <div style="background: #f0fdf4; border-bottom: 1px solid #dcfce7; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 13px; font-weight: 700; color: #166534;">STATUS: PAYMENT SUCCESSFUL</span>
        <span style="font-size: 11px; background: #dcfce7; color: #15803d; font-weight: 700; padding: 4px 10px; border-radius: 999px;">SETTLED & ESCROW LOCKED</span>
      </div>

      <!-- Body Details -->
      <div style="padding: 28px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hi <strong>${escapeHtml(user.name)}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">Thank you for your payment. Your funds have been securely processed and credited to your FreelanceHub ledger balance.</p>

        <!-- Receipt Table Card -->
        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 12px 16px; font-size: 12px; color: #475569; text-transform: uppercase; font-weight: 700;">Description</th>
              <th style="padding: 12px 16px; font-size: 12px; color: #475569; text-transform: uppercase; font-weight: 700; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #0f172a;">
                ${escapeHtml(description)}
                <div style="font-size: 12px; font-weight: 400; color: #64748b; margin-top: 4px;">Type: ${escapeHtml(type)}</div>
              </td>
              <td style="padding: 14px 16px; font-size: 16px; font-weight: 750; color: #0f172a; text-align: right;">${amountFormatted}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 16px; font-size: 13px; color: #64748b;">Processing Fee (0.00%)</td>
              <td style="padding: 10px 16px; font-size: 13px; color: #166534; font-weight: 600; text-align: right;">₹0.00 (FREE)</td>
            </tr>
            <tr style="background: #f1f5f9;">
              <td style="padding: 14px 16px; font-size: 14px; font-weight: 800; color: #0f172a;">Total Paid</td>
              <td style="padding: 14px 16px; font-size: 18px; font-weight: 800; color: #7e22ce; text-align: right;">${amountFormatted}</td>
            </tr>
          </tbody>
        </table>

        <!-- Transaction Meta -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #64748b;">
          <tr>
            <td style="padding: 6px 0;">Transaction ID:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(String(transactionId))}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Date & Time:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Payment Account:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${escapeHtml(user.email)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        This is an electronically generated receipt verified by FreelanceHub Escrow Gateway.<br/>
        For support or billing inquiries, please contact support@freelancehub.com
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Payment Receipt: ${amountFormatted} (${type})`,
    html: receiptHtml,
    text: `Payment Receipt\nTransaction ID: ${transactionId}\nAmount: ${amountFormatted}\nType: ${type}\nDate: ${dateStr}\nAccount: ${user.email}`,
  });
}
