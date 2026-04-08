// Checks whether the logged-in user has one of the allowed roles
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Authentication is required",
      });
    }

    // Keep protected actions limited to the right user types
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default roleMiddleware;