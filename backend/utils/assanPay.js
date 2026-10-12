import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * Assan Pay Cryptographic Client & API Gateway SDK
 * Implements HMAC-SHA256 signed request specifications per official manual.
 */

const getAssanPayConfig = () => {
  return {
    baseUrl: (process.env.ASSANPAY_BASE_URL || "https://lc-mrcs.assanpay.com").replace(/\/$/, ""),
    apiKey: process.env.ASSANPAY_API_KEY || "a84a4141-3902-4869-af4e-5e26b3a5a5fc",
    apiSecret: process.env.ASSANPAY_API_SECRET || "e789df1c-45d5-49d5-aabf-2e450de1868d",
    branchCode: process.env.ASSANPAY_BRANCH_CODE || "10067",
    callbackUrl: process.env.ASSANPAY_CALLBACK_URL || "https://bizmanager.megatrixai.com/api/subscriptions/webhook/assanpay",
    successUrl: process.env.ASSANPAY_SUCCESS_URL || "https://bizmanager.megatrixai.com/subscription/success",
    failedUrl: process.env.ASSANPAY_FAILED_URL || "https://bizmanager.megatrixai.com/subscription/failed",
    pendingUrl: process.env.ASSANPAY_PENDING_URL || "https://bizmanager.megatrixai.com/subscription/pending",
  };
};

/**
 * 1. Generate Request HMAC-SHA256 Signature
 * Formula:
 * bodyHash = SHA256(rawBody) [Hex]
 * canonical = METHOD + "\n" + PATH_WITH_QUERY + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + BODY_HASH
 * signature = Base64(HMAC-SHA256(canonical, API_SECRET))
 */
export const generateRequestSignature = (
  { method, path, timestamp, nonce, rawBody = "" },
  apiSecret
) => {
  const secret = apiSecret || getAssanPayConfig().apiSecret;
  const bodyString = typeof rawBody === "string" ? rawBody : (rawBody ? JSON.stringify(rawBody) : "");

  // Step 1: Body hash (SHA256 hex)
  const bodyHash = crypto.createHash("sha256").update(bodyString, "utf8").digest("hex");

  // Step 2: Canonical string
  const canonical = `${method.toUpperCase()}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;

  // Step 3: Signature (HMAC SHA256 -> Base64)
  const signature = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("base64");

  return { signature, canonical, bodyHash };
};

/**
 * Helper to build signed headers for any Assan Pay API request
 */
export const buildSignedHeaders = (method, path, body = "") => {
  const config = getAssanPayConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = uuidv4();
  const rawBody = typeof body === "string" ? body : (body ? JSON.stringify(body) : "");

  const { signature } = generateRequestSignature(
    {
      method,
      path,
      timestamp,
      nonce,
      rawBody,
    },
    config.apiSecret
  );

  return {
    "Content-Type": "application/json",
    "X-API-KEY": config.apiKey,
    "X-TIMESTAMP": String(timestamp),
    "X-NONCE": nonce,
    "X-SIGNATURE": signature,
  };
};

/**
 * 2. Create Hosted Checkout Session
 * Endpoint: POST /api/checkout/sessions
 */
export const createCheckoutSession = async ({
  orderId,
  amount,
  branchCode,
  paymentMethodName,
  customerContact,
  customerEmail,
  customerName,
  callbackUrl,
  successUrl,
  failedUrl,
  pendingUrl,
  expiresInSeconds = 600,
}) => {
  const config = getAssanPayConfig();
  const path = "/api/checkout/sessions";
  const url = `${config.baseUrl}${path}`;

  const payload = {
    orderId: String(orderId),
    amount: Number(amount),
    branchCode: branchCode || config.branchCode,
    customerContact: customerContact || "03000000000",
    customerEmail: customerEmail || "customer@example.com",
    customerName: customerName || "BizManager Merchant",
    callbackUrl: callbackUrl || config.callbackUrl,
    successUrl: successUrl || `${config.successUrl}?orderId=${encodeURIComponent(orderId)}`,
    failedUrl: failedUrl || `${config.failedUrl}?orderId=${encodeURIComponent(orderId)}`,
    pendingUrl: pendingUrl || `${config.pendingUrl}?orderId=${encodeURIComponent(orderId)}`,
    expiresInSeconds: Number(expiresInSeconds) || 600,
  };

  if (paymentMethodName) {
    payload.paymentMethodName = paymentMethodName;
  }

  const rawBody = JSON.stringify(payload);
  const headers = buildSignedHeaders("POST", path, rawBody);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: rawBody,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.errorCode || `HTTP ${response.status}: Failed to create checkout session`;
      const err = new Error(errorMsg);
      err.statusCode = response.status;
      err.details = data;
      throw err;
    }

    return {
      success: true,
      sessionId: data.sessionId,
      orderId: data.orderId || orderId,
      paymentId: data.paymentId,
      checkoutUrl: data.checkoutUrl,
      expiresAt: data.expiresAt,
      rawResponse: data,
    };
  } catch (error) {
    console.error("[AssanPay] Create Checkout Session Error:", error);
    throw error;
  }
};

/**
 * 3. Verify Incoming Webhook Signature
 * Formula per manual:
 * canonical = EVENT_ID + "\n" + TIMESTAMP + "\n" + RAW_BODY
 * signature = Base64(HMAC-SHA256(canonical, API_SECRET))
 */
export const verifyCallbackSignature = (rawBody, headers, apiSecret) => {
  const secret = apiSecret || getAssanPayConfig().apiSecret;
  if (!secret) throw new Error("Missing Assan Pay API secret");

  const eventId = headers["x-assanpay-event-id"] || headers["X-Assanpay-Event-Id"] || "";
  const timestamp = headers["x-assanpay-timestamp"] || headers["X-Assanpay-Timestamp"] || "";
  const receivedSignature = headers["x-assanpay-signature"] || headers["X-Assanpay-Signature"] || "";

  const bodyStr = typeof rawBody === "string" ? rawBody : (rawBody ? JSON.stringify(rawBody) : "");
  const canonical = `${eventId}\n${timestamp}\n${bodyStr}`;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest("base64");

  const isValid = generatedSignature === receivedSignature;

  return {
    isValid,
    canonical,
    generatedSignature,
    receivedSignature,
    eventId,
    timestamp,
  };
};

/**
 * 4. Status Inquiry API
 * Endpoint: GET /api/merchant/status-inquiry?type=payin&orderId={{orderId}}
 */
export const checkPaymentStatus = async (orderId) => {
  const config = getAssanPayConfig();
  const path = `/api/merchant/status-inquiry?type=payin&orderId=${encodeURIComponent(orderId)}`;
  const url = `${config.baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": config.apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || `Status inquiry failed with status ${response.status}`,
        rawResponse: data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[AssanPay] Check Payment Status Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 5. Balance Check API (Host-to-Host)
 * Endpoint: GET /api/merchant/balance/h2h
 */
export const getMerchantBalance = async () => {
  const config = getAssanPayConfig();
  const path = "/api/merchant/balance/h2h";
  const url = `${config.baseUrl}${path}`;

  const headers = buildSignedHeaders("GET", path, "");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || `Balance inquiry failed with status ${response.status}`,
        rawResponse: data,
      };
    }

    return {
      success: true,
      balance: data,
    };
  } catch (error) {
    console.error("[AssanPay] Get Merchant Balance Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getAssanPayConfig,
  generateRequestSignature,
  buildSignedHeaders,
  createCheckoutSession,
  verifyCallbackSignature,
  checkPaymentStatus,
  getMerchantBalance,
};
