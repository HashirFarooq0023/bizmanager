import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

export const impersonateUser = async (req, res) => {
  try {
    const { targetUserId, adminActorId, adminEmail, spoofSessionId, appUrl } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required' });
    }

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const jti = crypto.randomBytes(16).toString("hex");

    // Generate rich JWT token containing all real user identity claims
    const token = jwt.sign(
      {
        id: user._id.toString(),
        _id: user._id.toString(),
        userId: user._id.toString(),
        name: user.name || 'Store Merchant',
        email: user.email || '',
        shopName: user.shopName || '',
        role: user.role || 'owner',
        organizationId: user.organizationId ? user.organizationId.toString() : null,
        isSpoof: true,
        isImpersonated: true,
        spoofSessionId: spoofSessionId || null,
        jti,
        iat: Math.floor(Date.now() / 1000),
        ctx: {
          ip: 'megatrix-admin-spoof',
          ua: 'MegaTrix Admin Core',
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Resolve target frontend portal URL dynamically: priority to requested appUrl, then origin, then FRONTEND_URL
    let frontendUrl = appUrl || req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    frontendUrl = frontendUrl.replace(/\/$/, '');

    const params = new URLSearchParams({
      token,
      spoof: 'true',
      sid: spoofSessionId || '',
      targetId: user._id.toString(),
      targetName: user.name || '',
      targetShop: user.shopName || '',
      targetEmail: user.email || '',
      targetRole: user.role || 'owner',
    });

    const portalUrl = `${frontendUrl}/impersonate?${params.toString()}`;

    return res.json({
      success: true,
      token,
      portalUrl,
      userInfo: {
        _id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('[Impersonate] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Impersonation failed: ' + error.message });
  }
};
