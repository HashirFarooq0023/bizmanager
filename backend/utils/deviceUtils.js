import crypto from "crypto";
import { info, warn, error } from "./logger.js";

/**
 * Generate a cryptographically secure device ID
 * @returns {string} 64-character hex string (32 bytes)
 */
export const generateDeviceId = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * Detect if running in production environment
 * Checks multiple indicators since NODE_ENV may not be set on all platforms
 */
const isProductionEnvironment = () => {
    // Explicit NODE_ENV check
    if (process.env.NODE_ENV === "production") return true;

    // Check for Render.com environment
    if (process.env.RENDER) return true;

    // Check for other common production indicators
    if (process.env.RAILWAY_ENVIRONMENT) return true;
    if (process.env.VERCEL) return true;
    if (process.env.HEROKU) return true;

    return false;
};

/**
 * Determine sameSite cookie setting based on environment
 * - If COOKIE_SAME_SITE env var is set, use that value ("none", "lax", or "strict")
 * - Production default: "none" (required for cross-domain deployments like Render)
 * - Development default: "strict" (most secure for localhost)
 * 
 * IMPORTANT: 
 * - Use "none" for cross-domain (frontend and backend on different domains)
 * - Use "lax" for same-domain (frontend and backend on same domain)
 * - "none" requires secure: true (HTTPS)
 */
const getSameSiteSetting = () => {
    if (process.env.COOKIE_SAME_SITE) {
        return process.env.COOKIE_SAME_SITE;
    }
    const isProduction = isProductionEnvironment();
    // Default to "none" for production (cross-domain deployments)
    // Override with COOKIE_SAME_SITE=lax if using same-domain deployment
    return isProduction ? "none" : "strict";
};

/**
 * Set secure deviceId cookie
 * @param {object} res - Express response object
 * @param {string} deviceId - Device identifier
 */
export const setDeviceIdCookie = (res, deviceId) => {
    const isProduction = isProductionEnvironment();
    const sameSite = getSameSiteSetting();

    // CRITICAL: Validate COOKIE_SECRET is set
    if (!process.env.COOKIE_SECRET) {
        error('❌ CRITICAL: COOKIE_SECRET environment variable is not set!');
        throw new Error('COOKIE_SECRET must be configured for signed cookies');
    }

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite, // Flexible: "lax" (default), "none" (cross-origin), or "strict"
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        signed: true,
        path: '/', // Explicitly set path to root
    };

    // Safely attempt signed cookie, fall back to unsigned if cookieParser secret isn't available
    try {
        res.cookie("deviceId", deviceId, cookieOptions);
    } catch (cookieErr) {
        warn("Signed cookie failed, using standard cookie:", cookieErr.message);
        res.cookie("deviceId", deviceId, { ...cookieOptions, signed: false });
    }

    // Production logging for diagnostics (protect sensitive data)
    if (isProduction) {
        info('🍪 [PRODUCTION] Set deviceId cookie', {
            deviceIdPrefix: deviceId.substring(0, 8) + '...',
            sameSite,
            secure: isProduction,
            httpOnly: true,
            maxAge: '7 days',
            hasCookieSecret: !!process.env.COOKIE_SECRET
        });
    } else {
        // Debug log in development
        info('🍪 Set deviceId cookie', {
            deviceId: deviceId.substring(0, 8) + '...',
            sameSite,
            secure: isProduction
        });
    }
};

/**
 * Clear deviceId cookie
 * @param {object} res - Express response object
 */
export const clearDeviceIdCookie = (res) => {
    const isProduction = isProductionEnvironment();
    const sameSite = getSameSiteSetting();

    const clearOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        signed: true,
        path: '/',
    };

    try {
        res.clearCookie("deviceId", clearOptions);
    } catch {
        res.clearCookie("deviceId", { ...clearOptions, signed: false });
    }
};

/**
 * Get deviceId from signed or plain cookie
 * @param {object} req - Express request object
 * @returns {string|null} Device ID or null if not present/invalid
 */
export const getDeviceIdFromCookie = (req) => {
    const deviceId = req.signedCookies?.deviceId || req.cookies?.deviceId || null;
    const isProduction = isProductionEnvironment();

    // Production logging for diagnostics
    if (isProduction && !deviceId) {
        warn('⚠️  [PRODUCTION] deviceId cookie not found', {
            hasSignedCookies: !!req.signedCookies,
            signedCookiesKeys: req.signedCookies ? Object.keys(req.signedCookies) : [],
            hasCookies: !!req.cookies,
            cookiesKeys: req.cookies ? Object.keys(req.cookies) : [],
            hasCookieSecret: !!process.env.COOKIE_SECRET
        });
    }

    return deviceId;
};
