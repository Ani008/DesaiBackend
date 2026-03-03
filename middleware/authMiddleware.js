const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("---- AUTH MIDDLEWARE HIT ----");

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("❌ No Authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("Using JWT_SECRET length:", process.env.JWT_SECRET?.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token verified. Decoded:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};


