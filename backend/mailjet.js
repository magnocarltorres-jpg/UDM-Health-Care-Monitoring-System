import { Buffer } from "node:buffer";
import { env } from "node:process";

const MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

const requiredEnvironmentVariables = [
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "MAILJET_SENDER_EMAIL",
  "MAILJET_ACCOUNT_CREATED_TEMPLATE_ID",
  "APP_LOGIN_URL",
];

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
  const templateId = Number(
    getRequiredEnvironmentVariable("MAILJET_ACCOUNT_CREATED_TEMPLATE_ID"),
  );

  if (!Number.isSafeInteger(templateId) || templateId <= 0) {
    throw new Error("MAILJET_ACCOUNT_CREATED_TEMPLATE_ID must be a positive integer.");
  }

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
        TemplateID: templateId,
        TemplateLanguage: true,
        Subject: "Your UDM CLINIC Staff Account",
        Variables: {
          fullName: escapeHtml(name.trim()),
          loginUrl: escapeHtml(getLoginUrl()),
          staffId: escapeHtml(staffId),
          role: escapeHtml(role),
          temporaryPassword: escapeHtml(temporaryPassword),
        },
      },
    ],
  };

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
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

  return {
    messageId: messageResult.To?.[0]?.MessageID ?? null,
  };
}

export function getMissingMailjetConfiguration() {
  return requiredEnvironmentVariables.filter(
    (name) => !env[name]?.trim(),
  );
}
