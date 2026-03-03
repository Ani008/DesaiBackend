const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const userRole = req.user.role.toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());

    

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
