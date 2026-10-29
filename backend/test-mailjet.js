import { Buffer } from "node:buffer";
import dotenv from "dotenv";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: join(dirname(fileURLToPath(import.meta.url)), ".env"),
});

const MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

async function testMailjet() {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  const senderName = process.env.MAILJET_SENDER_NAME;

  if (!apiKey || !secretKey || !senderEmail) {
    console.error(
      "Missing MAILJET_API_KEY, MAILJET_SECRET_KEY, or MAILJET_SENDER_EMAIL in backend/.env.",
    );
    process.exitCode = 1;
    return;
  }

  try {
    const response = await fetch(MAILJET_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: senderName || "UDM CLINIC",
            },
            To: [
              {
                Email: senderEmail,
                Name: "UDM Clinic Test",
              },
            ],
            Subject: "UDM CLINIC - Mailjet Connection Test",
            TextPart:
              "This is a test email confirming that UDM CLINIC is connecting to Mailjet.",
            HTMLPart:
              "<h2>UDM CLINIC</h2><p>Your Mailjet connection test was submitted.</p>",
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`Mailjet returned an invalid response (HTTP ${response.status}).`);
    }

    const message = result.Messages?.[0];

    if (!response.ok || message?.Status !== "success") {
      console.error(`Mailjet request failed (HTTP ${response.status}).`);
      console.error(JSON.stringify(result, null, 2));
      process.exitCode = 1;
      return;
    }

    console.log("Mailjet accepted the test email.");
    console.log(`Check ${senderEmail}'s inbox and spam folders.`);
  } catch (error) {
    console.error("Could not complete the Mailjet test:", error.message);
    process.exitCode = 1;
  }
}

await testMailjet();
