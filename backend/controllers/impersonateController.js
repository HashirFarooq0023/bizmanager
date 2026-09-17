import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";

export const impersonateUser = async (req, res) => {
  try {
    const { targetUserId, adminActorId, adminEmail, spoofSessionId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required' });
    }

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // Generate a short-lived impersonation token (30 minutes)
    const token = generateToken(user._id, { ip: 'megatrix-admin-spoof', ua: 'MegaTrix Admin Core' });
    // Note: The token uses the standard JWT_EXPIRE. We rely on the frontend to enforce the 30-min window.

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const portalUrl = `${frontendUrl}/impersonate?token=${encodeURIComponent(token)}&spoof=true&sid=${encodeURIComponent(spoofSessionId || '')}`;

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
      },
    });
  } catch (error) {
    console.error('[Impersonate] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Impersonation failed: ' + error.message });
  }
};
