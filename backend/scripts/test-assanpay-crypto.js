import crypto from "crypto";
import { generateRequestSignature, verifyCallbackSignature } from "../utils/assanPay.js";

console.log("==========================================");
console.log("Assan Pay Cryptographic Verification Test");
console.log("==========================================");

// Worked Example from Manual Page 3 & 5:
// Method: POST
// Path: /v1/payments/create
// Timestamp: 1712345678
// Nonce: 550e8400-e29b-41d4-a716-446655440000
// Body: {"amount":1000,"currency":"PKR"}
// Secret: your_api_secret

const testInput = {
  method: "POST",
  path: "/v1/payments/create",
  timestamp: "1712345678",
  nonce: "550e8400-e29b-41d4-a716-446655440000",
  rawBody: '{"amount":1000,"currency":"PKR"}',
};
const testSecret = "your_api_secret";

const { signature, canonical, bodyHash } = generateRequestSignature(testInput, testSecret);

console.log("Calculated Body Hash:", bodyHash);
console.log("Canonical String:\n" + canonical);
console.log("Generated Base64 Signature:", signature);

// Expected Canonical String format:
// POST\n/v1/payments/create\n1712345678\n550e8400-e29b-41d4-a716-446655440000\n[sha256Hex]
const expectedBodyHash = crypto.createHash("sha256").update(testInput.rawBody).digest("hex");
if (bodyHash === expectedBodyHash) {
  console.log("✅ Body SHA-256 Hash matches expected formula!");
} else {
  console.error("❌ Body SHA-256 Hash mismatch!");
}

// Test Webhook Verification
const webhookPayload = '{"orderId":"ORD123","status":"SUCCESS","amount":2500}';
const eventId = "evt_998877";
const timestamp = "1712345678";
const webhookCanonical = `${eventId}\n${timestamp}\n${webhookPayload}`;
const webhookSig = crypto.createHmac("sha256", testSecret).update(webhookCanonical).digest("base64");

const webhookResult = verifyCallbackSignature(
  webhookPayload,
  {
    "x-assanpay-event-id": eventId,
    "x-assanpay-timestamp": timestamp,
    "x-assanpay-signature": webhookSig,
  },
  testSecret
);

if (webhookResult.isValid) {
  console.log("✅ Webhook HMAC-SHA256 signature verification successful!");
} else {
  console.error("❌ Webhook HMAC-SHA256 verification failed!");
}

console.log("==========================================");
