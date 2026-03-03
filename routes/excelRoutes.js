const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadExcel } = require("../controllers/excelController");

router.post(
  "/upload/:batchId",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  upload.single("file"),
  uploadExcel
);

module.exports = router;
