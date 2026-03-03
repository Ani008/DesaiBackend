const prisma = require("../config/db");
const fs = require("fs");
const path = require("path");

/* =========================
   Upload ZIP Controller
========================= */
exports.uploadZip = async (req, res) => {
  console.log("📦 ZIP CONTROLLER HIT");

  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ZIP file is required" });
    }

    // Only allow .zip
    if (!req.file.originalname.endsWith(".zip")) {
      return res.status(400).json({ message: "Only ZIP files are allowed" });
    }

    // TRANSACTION
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch batch
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      // 2️⃣ Prevent re-upload
      if (batch.zipPath) {
        throw new Error("ZIP already uploaded for this batch");
      }

      // 3️⃣ Save ZIP path
      await tx.batch.update({
        where: { id: batchId },
        data: {
          zipPath: req.file.path,
        },
      });
    });

    return res.status(200).json({
      message: "ZIP uploaded successfully",
    });
  } catch (error) {
    console.error("ZIP upload error:", error);
    return res.status(400).json({ message: error.message });
  }
};

exports.downloadZip = async (req, res) => {
  console.log("📦 DOWNLOAD ZIP CONTROLLER HIT");

  console.log("PARAMS:", req.params);

  try {
    const { batchId } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { id: batchId }
    });
    if (!batch || !batch.zipPath) {
      return res.status(404).json({ message: "ZIP file not found" });
    }
    const filePath = path.resolve(batch.zipPath);
    res.download(filePath);
  } catch (error) {
    console.error("Download ZIP error:", error);
    return res.status(500).json({ message: error.message });
  }
};