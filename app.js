const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const excelRoutes = require("./routes/excelRoutes");
const surgeryRoutes = require("./routes/surgeryRoutes");
const apiLimiter = require("./middleware/rateLimiter");
const healthRoutes = require("./routes/healthRoutes");
const batchRoutes = require("./routes/batchRoutes");


const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://desaieyehospital.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true
}));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.get("/ping", (req, res) => {
  res.status(200).json({ ok: true });
});

/* ✅ Rate limiter BEFORE protected routes */
app.use("/api", (req, res, next) => {
  if(req.method === "OPTIONS") return next();
  apiLimiter(req, res, next);
});



const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


/* ✅ API routes */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/surgeries", surgeryRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/batches", batchRoutes);


module.exports = app;
