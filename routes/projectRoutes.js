const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  updateSubmissionStatus
} = require("../controllers/projectController");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createProject
);

router.get(
  "/",
  authMiddleware,
  getProjects
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteProject
);

router.patch(
  "/:id/submission",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateSubmissionStatus
);

module.exports = router;
