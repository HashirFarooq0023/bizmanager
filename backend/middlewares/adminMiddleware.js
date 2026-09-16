/**
 * Admin Authorization Middleware
 * Enforces that the authenticated user possesses SuperAdmin or Admin role.
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const role = req.user.role;
  if (role !== "superadmin" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: SuperAdmin credentials required",
    });
  }

  next();
};

export default { requireSuperAdmin };
