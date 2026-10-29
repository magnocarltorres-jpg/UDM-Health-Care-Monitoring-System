import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { env } from "node:process";

const MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

const requiredEnvironmentVariables = [
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "MAILJET_SENDER_EMAIL",
  "APP_LOGIN_URL",
];

const accountCreatedTemplateUrl = new URL(
  "./email-templates/account-created.html",
  import.meta.url,
);

function getRequiredEnvironmentVariable(name) {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getLoginUrl() {
  const value = getRequiredEnvironmentVariable("APP_LOGIN_URL");
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("APP_LOGIN_URL must be a valid absolute URL.");
  }

  const isLocalHttp =
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(url.hostname);

  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("APP_LOGIN_URL must use HTTPS, except for localhost development.");
  }

  return url.toString();
}

export async function sendAccountCreatedEmail({
  to,
  name,
  temporaryPassword,
  staffId,
  role,
}) {
  if (typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    throw new Error("A valid recipient email address is required.");
  }

  if (typeof temporaryPassword !== "string" || temporaryPassword.length < 8) {
    throw new Error("A valid temporary password is required.");
  }

  const apiKey = getRequiredEnvironmentVariable("MAILJET_API_KEY");
  const apiSecret = getRequiredEnvironmentVariable("MAILJET_SECRET_KEY");
  const senderEmail = getRequiredEnvironmentVariable("MAILJET_SENDER_EMAIL");
  const loginUrl = getLoginUrl();
  const fullName = name.trim();
  const template = await readFile(accountCreatedTemplateUrl, "utf8");
  const variables = {
    fullName,
    loginUrl,
    staffId,
    role,
    temporaryPassword,
  };
  const html = template.replace(
    /\{\{var:([A-Za-z0-9_]+)\}\}/g,
    (placeholder, key) => {
      if (!Object.hasOwn(variables, key)) {
        throw new Error(`Unknown account email template variable: ${key}`);
      }

      return escapeHtml(variables[key]);
    },
  );

  const payload = {
    Messages: [
      {
        From: {
          Email: senderEmail,
          Name: env.MAILJET_SENDER_NAME?.trim() || "UDM CLINIC",
        },
        To: [
          {
            Email: to.trim(),
            Name: fullName,
          },
        ],
        Subject: "Your UDM CLINIC Staff Account",
        TextPart: [
          `Hello ${fullName},`,
          "",
          "Your UDM CLINIC staff account has been created.",
          "",
          `Role: ${role}`,
          `Staff ID: ${staffId}`,
          `Temporary Password: ${temporaryPassword}`,
          "",
          `Log in at: ${loginUrl}`,
          "You must change your password before accessing the clinic system.",
        ].join("\n"),
        HTMLPart: html,
      },
    ],
  };

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const messageResult = await sendMailjetPayload(payload, authorization);

  return {
    messageId: messageResult.To?.[0]?.MessageID ?? null,
  };
}

export async function sendPasswordResetEmail({
  to,
  name,
  temporaryPassword,
  staffId,
  role,
}) {
  if (typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    throw new Error("A valid recipient email address is required.");
  }

  if (typeof temporaryPassword !== "string" || temporaryPassword.length < 8) {
    throw new Error("A valid temporary password is required.");
  }

  const apiKey = getRequiredEnvironmentVariable("MAILJET_API_KEY");
  const apiSecret = getRequiredEnvironmentVariable("MAILJET_SECRET_KEY");
  const senderEmail = getRequiredEnvironmentVariable("MAILJET_SENDER_EMAIL");
  const loginUrl = getLoginUrl();
  const safeName = escapeHtml(name.trim());
  const safeStaffId = escapeHtml(staffId);
  const safeRole = escapeHtml(role);
  const safeTemporaryPassword = escapeHtml(temporaryPassword);
  const payload = {
    Messages: [
      {
        From: {
          Email: senderEmail,
          Name: env.MAILJET_SENDER_NAME?.trim() || "UDM CLINIC",
        },
        To: [
          {
            Email: to.trim(),
            Name: name.trim(),
          },
        ],
        Subject: "Your UDM CLINIC Password Has Been Reset",
        TextPart: [
          `Hello ${name.trim()},`,
          "",
          "An administrator reset your UDM CLINIC staff account password.",
          "",
          `Name: ${name.trim()}`,
          `Role: ${role}`,
          `Staff ID: ${staffId}`,
          `Temporary Password: ${temporaryPassword}`,
          "",
          `Log in at: ${loginUrl}`,
          "You must change your password at your next login.",
          "If you did not request this change, contact your clinic administrator.",
        ].join("\n"),
        HTMLPart: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your UDM CLINIC Password Has Been Reset</title></head>
  <body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#202124;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
      <div style="padding:28px 32px;background:#176b59;color:#ffffff;text-align:center;">
        <img src="https://raw.githubusercontent.com/magnocarltorres-jpg/UDM-Health-Care-Monitoring-System/main/public/clinic.png" alt="UDM Clinic logo" width="88" height="88" style="display:block;width:88px;height:88px;margin:0 auto 18px;border:0;border-radius:50%;background:#ffffff;">
        <h1 style="margin:0;font-size:24px;">Password Reset</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;">Hello ${safeName},</p>
        <p style="margin:0 0 20px;line-height:1.6;">An administrator reset your UDM CLINIC staff account password.</p>
        <div style="margin:0 0 24px;padding:18px 20px;background:#f4f6f8;border-radius:6px;">
          <p style="margin:0 0 10px;font-weight:bold;">ACCOUNT DETAILS</p>
          <p style="margin:0 0 8px;">Name: ${safeName}</p>
          <p style="margin:0 0 8px;">Role: ${safeRole}</p>
          <p style="margin:0 0 8px;">Staff ID: <strong>${safeStaffId}</strong></p>
          <p style="margin:0;">Temporary Password: <strong>${safeTemporaryPassword}</strong></p>
        </div>
        <p style="margin:0 0 24px;line-height:1.6;">Log in with the temporary password and change it at your next login.</p>
        <p style="margin:0 0 28px;"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:13px 22px;background:#176b59;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Log in to the clinic system</a></p>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#5f6368;">If you did not request this change, contact your clinic administrator immediately.</p>
        <p style="margin:24px 0 0;font-size:12px;font-weight:bold;color:#176b59;">UDM CLINIC</p>
      </div>
    </div>
  </body>
</html>`,
      },
    ],
  };
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const messageResult = await sendMailjetPayload(payload, authorization);

  return {
    messageId: messageResult.To?.[0]?.MessageID ?? null,
  };
}

async function sendMailjetPayload(payload, authorization) {
  const response = await fetch(MAILJET_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(`Mailjet returned an invalid response (HTTP ${response.status}).`);
  }

  const messageResult = result?.Messages?.[0];
  const mailjetErrors = messageResult?.Errors
    ?.map((item) => item.ErrorMessage)
    .filter(Boolean)
    .join("; ");

  if (!response.ok || messageResult?.Status !== "success") {
    throw new Error(
      `Mailjet could not send the notification: ${
        mailjetErrors || `HTTP ${response.status}`
      }`,
    );
  }

  return messageResult;
}

export function getMissingMailjetConfiguration() {
  return requiredEnvironmentVariables.filter(
    (name) => !env[name]?.trim(),
  );
}
