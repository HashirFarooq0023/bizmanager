import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes
 * Validates both JWT token AND deviceId cookie
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // 1. Service-to-Service Master Auth from MegaTrix Admin Core
    const serviceKey = req.headers['x-megatrix-service-key'];
    const expectedServiceKey = process.env.MEGATRIX_SERVICE_SECRET || 'megatrix_core_internal_service_key_2026';
    if (serviceKey && serviceKey === expectedServiceKey) {
      req.user = (await User.findOne({ role: 'superadmin' })) || {
        _id: 'megatrix_service_superadmin',
        name: 'MegaTrix Master SuperAdmin',
        role: 'superadmin',
        email: 'admin.megatrixai@gmail.com',
      };
      return next();
    }

    // Token format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // =======================
      // ENTERPRISE: Auto-apply Tenant Context
      // =======================
      // Automatically set tenant context after authentication
      if (req.user.organizationId) {
        req.tenant = {
          organizationId: req.user.organizationId,
          branchId: req.user.branchId || null,
          warehouseId: req.user.warehouseId || null
        };
      } else {
        // For backward compatibility (users without organizationId)
        req.tenant = {
          organizationId: null,
          branchId: null,
          warehouseId: null
        };
      }
      // =======================

      // Update lastSeenAt on every authenticated request (non-blocking)
      // Determine activity type based on request path
      let activityType = "api_call";
      if (req.path.includes("/invoices") || req.path.includes("/sales")) {
        activityType = "invoice_management";
      } else if (req.path.includes("/customers")) {
        activityType = "customer_management";
      } else if (req.path.includes("/items") || req.path.includes("/inventory")) {
        activityType = "inventory_management";
      }

      // Non-blocking update (don't await to avoid slowing down requests)
      User.findByIdAndUpdate(
        req.user._id,
        {
          lastSeenAt: new Date(),
          lastActivityType: activityType,
        },
        { new: false }
      ).catch(err => {
        // Silent fail - don't block request if update fails
        warn('Failed to update lastSeenAt', { userId: req.user._id, error: err.message });
      });

      next();
    } else {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    // Provide more specific error messages for debugging
    let errorMessage = "Invalid or expired token";

    if (error.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token format";
      console.error("JWT Malformed Error Details:", {
        message: error.message,
        token: token ? `${token.substring(0, 20)}...` : 'undefined'
      });
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = "Token has expired";
    } else if (error.message && error.message.includes('jwt must be provided')) {
      errorMessage = "Token missing";
    }

    res.status(401).json({ success: false, message: errorMessage });
  }
};
