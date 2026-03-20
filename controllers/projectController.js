const prisma = require("../config/db");

exports.createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectCode,
      receiptNo,
      perSurgeryAmount,
      balanceSurgery,
    } = req.body;

    // ✅ Correct validation
    if (
      !projectName ||
      !projectCode ||
      !receiptNo ||
      perSurgeryAmount === undefined ||
      balanceSurgery === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (perSurgeryAmount <= 0 || balanceSurgery <= 0) {
      return res.status(400).json({
        message:
          "Per surgery amount and balance surgery must be greater than zero",
      });
    }

    // 🔢 NEW LOGIC
    const { totalAmount } = req.body;
    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than zero",
      });
    }

    const project = await prisma.project.create({
      data: {
        projectName,
        projectCode,
        receiptNo,
        perSurgeryAmount,
        balanceSurgery,
        totalAmount,
        status: "ACTIVE",
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Project code already exists",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { id: "desc" },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      projectName,
      projectCode,
      receiptNo,
      perSurgeryAmount,
      totalAmount,
      balanceSurgery, // this is actually the NEW TARGET from frontend
    } = req.body;

    const projectId = Number(id);

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than zero",
      });
    }

    if (perSurgeryAmount <= 0 || balanceSurgery < 0) {
      return res.status(400).json({
        message: "Invalid per surgery amount or balance surgery",
      });
    }

    // 🔥 Count existing surgeries
    const completedSurgeries = await prisma.surgery.count({
      where: { projectId: projectId },
    });

    // 🔥 Recalculate balance
    const newBalance = Math.max(balanceSurgery - completedSurgeries, 0);

    // 🔥 Determine status
    const status = newBalance === 0 ? "COMPLETED" : "ACTIVE";

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        projectName,
        projectCode,
        receiptNo,
        perSurgeryAmount,
        totalAmount,
        balanceSurgery: newBalance,
        status,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update project" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};

exports.updateSubmissionStatus = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // 👈 ADD THIS
    console.log("REQ PARAMS:", req.params);
    const { id } = req.params;
    const { submitted } = req.body; // SUBMITTED | NOT_SUBMITTED

    if (!["SUBMITTED", "NOTSUBMITTED"].includes(submitted)) {
      return res.status(400).json({ message: "Invalid submission status" });
    }

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: { submitted },
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update submission status" });
  }
};
