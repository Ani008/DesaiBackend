const prisma = require("../config/db");
const jwt = require("jsonwebtoken");

const ADMIN_PASSWORD = "Admin@123";
const USER_PASSWORD = "User@123";

exports.login = async (req, res) => {
  try {
    const { role, password } = req.body;

    if (!role || !password) {
      return res.status(400).json({ message: "Role and password required" });
    }

    if (
      (role === "ADMIN" && password !== ADMIN_PASSWORD) ||
      (role === "USER" && password !== USER_PASSWORD)
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let user = await prisma.user.findFirst({ where: { role } });

    if (!user) {
      user = await prisma.user.create({
        data: { role, password }
      });
    }

    // 🔐 Create JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
