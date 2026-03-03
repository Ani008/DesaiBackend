const prisma = require("../config/db");
const fs = require("fs");
const path = require("path");




/* =========================
   Create Batch Controller
========================= */
exports.createBatch = async (req, res) => {
  console.log("📦 BATCH CONTROLLER HIT");

  try {
    const {
      projectId,
      batchDate,
      completedCount,
      incompleteCount = 0,
      createdBy,
    } = req.body;

    if (!projectId || !batchDate || completedCount == null) {
      return res.status(400).json({
        message: "projectId, batchDate and completedCount are required",
      });
    }

    // 1️⃣ Fetch project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    // 2️⃣ Block if project already completed
    if (project.status === "COMPLETED") {
      return res.status(400).json({
        error: "PROJECT_COMPLETED",
        message: "This project is already completed",
      });
    }

    // 3️⃣ Validate balance
    if (completedCount > project.balanceSurgery) {
      return res.status(400).json({
        message: "Completed count exceeds project balance",
      });
    }

    // 4️⃣ Create batch
    const batch = await prisma.batch.create({
      data: {
        projectId,
        batchDate: new Date(batchDate),
        completedCount,
        incompleteCount,
        createdBy,
        excelPath: "",
        zipPath: "",
      },
    });

    return res.status(201).json({
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    console.error("Batch creation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
    }); 
    return res.status(200).json(batches);
  } catch (error) {
    console.error("Get batches error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getBatchesByProject = async (req, res) => {
  try {
    const { projectId } = req.params; 
    const batches = await prisma.batch.findMany({
      where: { projectId: Number(projectId) },
      orderBy: { createdAt: "desc" },
    }); 
    return res.status(200).json(batches);
  } catch (error) {
    console.error("Get batches by project error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.downloadExcel = async (req, res) => {

  console.log("PARAMS:", req.params);

  try {
    const { batchId } = req.params;
    const batch = await prisma.batch.findUnique({
      where: {id: batchId}
    });
    if (!batch || !batch.excelPath) {
      return res.status(404).json({ message: "Excel file not found" });
    }
    const filePath = path.resolve(batch.excelPath);
    res.download(filePath);
  } catch (error) {
    console.error("Download excel error:", error);
    return res.status(500).json({ message: error.message });
  } 
};

exports.deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    // check batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { surgeries: true },
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // prevent delete if surgeries exist
    if (batch.surgeries.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete batch. Surgeries already exist for this batch.",
      });
    }

    await prisma.batch.delete({
      where: { id: batchId },
    });

    return res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Delete batch error:", error);
    return res.status(500).json({ message: "Failed to delete batch" });
  }
};
