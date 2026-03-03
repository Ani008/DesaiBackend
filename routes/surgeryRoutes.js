const express = require("express");
const router = express.Router();

const { getAllSurgeries, deleteSurgeriesByProject } = require("../controllers/surgeryController");
const authMiddleware = require("../middleware/authMiddleware");

// GET all surgeries
router.get("/", authMiddleware, getAllSurgeries);

router.delete("/project/:projectId",authMiddleware,deleteSurgeriesByProject);


module.exports = router;
