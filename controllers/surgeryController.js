const prisma = require("../config/db");

/**
 * GET ALL SURGERIES
 */
exports.getAllSurgeries = async (req, res) => {
  try {
    const surgeries = await prisma.surgery.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(surgeries);
  } catch (error) {
    console.error("Get surgeries error:", error);
    res.status(500).json({ message: "Failed to fetch surgeries" });
  }
};


exports.deleteSurgeriesByProject = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    // ✅ TRANSACTION = consistency guaranteed
    await prisma.$transaction(async (tx) => {

      // 1️⃣ Delete all surgeries for this project
      const result = await tx.surgery.deleteMany({
        where: { projectId },
      });

      // 2️⃣ Fetch project
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // 3️⃣ Count remaining surgeries (should be 0)
      const completedSurgeries = await tx.surgery.count({
        where: { projectId },
      });

      // 4️⃣ Calculate planned surgeries
      const totalPlannedSurgeries = Math.floor(
        project.totalAmount / project.perSurgeryAmount
      );

      // 5️⃣ Calculate new balance
      const newBalance = Math.max(
        totalPlannedSurgeries - completedSurgeries,
        0
      );

      // 6️⃣ Update project state
      await tx.project.update({
        where: { id: projectId },
        data: {
          balanceSurgery: newBalance,
          status: newBalance === 0 ? "COMPLETED" : "ACTIVE",
        },
      });

      // 🔍 TEMP DEBUG LOG (remove later)
      console.log({
        projectId,
        deletedSurgeries: result.count,
        completedSurgeries,
        totalPlannedSurgeries,
        newBalance,
      });
    });

    res.json({
      message: "All surgeries deleted and project updated",
    });

  } catch (error) {
    console.error("Delete surgeries error:", error);
    res.status(500).json({ message: "Failed to delete surgeries" });
  }
};
