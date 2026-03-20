const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { createBatch } = require("../controllers/batchController");
const { uploadZip } = require("../controllers/zipController");
const { getBatches } = require("../controllers/batchController");
const { getBatchesByProject } = require("../controllers/batchController");
const { downloadExcel } = require("../controllers/batchController");
const { downloadZip } = require("../controllers/zipController");

const { deleteBatch } = require("../controllers/batchController");
const { getBatchAnalytics } = require("../controllers/batchController");



router.post(
  "/create",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  createBatch
);

router.post(
  "/upload-zip/:batchId",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  upload.single("file"),
  uploadZip
);

router.get(
  "/:batchId/download-excel",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  downloadExcel
)

router.get(
  "/:batchId/download-zip",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  downloadZip
);

router.get(
  "/project/:projectId",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  getBatchesByProject
);

router.delete(
  "/:batchId",
  authMiddleware,
  roleMiddleware("ADMIN", "USER"),
  deleteBatch
);

router.get("/analytics", getBatchAnalytics);


module.exports = router;
