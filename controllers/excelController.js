const XLSX = require("xlsx");
const prisma = require("../config/db");

/* =========================
   Helper: Parse Excel Date
========================= */
const parseExcelDate = (value) => {
  if (!value) return null;

  // Case 1: Excel numeric date
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  // Case 2: String date (DD-MM-YYYY)
  if (typeof value === "string") {
    const parts = value.trim().split("-");
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);
      if (!day || !month || !year) return null;
      return new Date(year, month - 1, day);
    }
  }

  return null;
};

/* =========================
   Upload Excel Controller
========================= */
exports.uploadExcel = async (req, res) => {
  console.log("🔥 EXCEL CONTROLLER HIT");

  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    // 1️⃣ Read Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (rawData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // 2️⃣ TRANSACTION (CRITICAL)
    await prisma.$transaction(async (tx) => {
      // 🔑 Fetch Batch + Project
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
        include: { project: true },
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      // 🔒 Prevent re-upload
      if (batch.excelPath) {
        throw new Error("Excel already uploaded for this batch");
      }

      // 🔒 Block if project already completed
      if (batch.project.status === "COMPLETED") {
        throw new Error(
          "PROJECT_COMPLETED: This project is already completed"
        );
      }

      // 3️⃣ Validate Excel row count
      if (rawData.length !== batch.completedCount) {
        throw new Error(
          "Excel rows do not match batch completed count"
        );
      }

      // 4️⃣ Map Excel → Surgery rows
      const formattedData = rawData.map((row) => ({
        srNo: Number(row["Sr No"]),
        mrdNo: String(row["MRD No"]),
        patientName: row["Patient Name"],
        address: row["Address"] || null,
        operatedEye: row["Operated Eye"],
        age: Number(row["Age"]),
        sex: row["Sex"],

        dateOfSurgery: parseExcelDate(row["Date of Surgery"]),

        contactNo: String(row["Contact No"]),
        surgeryName: row["Surgery Name"],
        donorName: row["Donor Name"],
        surgeryCategory: row["Surgery Category"] || null,

        // 🔑 Derived from Batch
        batchId: batch.id,
        projectId: batch.projectId,
      }));

      // 5️⃣ Insert surgeries
      await tx.surgery.createMany({
        data: formattedData,
        skipDuplicates: true,
      });

      const uploadedCount = formattedData.length;

      // 6️⃣ Update project balance
      const remainingBalance =
        batch.project.balanceSurgery - uploadedCount;

      await tx.project.update({
        where: { id: batch.projectId },
        data: {
          balanceSurgery: remainingBalance,
          status: remainingBalance === 0 ? "COMPLETED" : "ACTIVE",
        },
      });

      // 7️⃣ Save Excel path to batch
      await tx.batch.update({
        where: { id: batch.id },
        data: {
          excelPath: req.file.path,
        },
      });
    });

    return res.status(200).json({
      message: "Excel uploaded successfully",
      insertedRecords: rawData.length,
    });
  } catch (error) {
    console.error("Excel upload error:", error);

    // Friendly error for frontend
    if (error.message.startsWith("PROJECT_COMPLETED")) {
      return res.status(400).json({
        error: "PROJECT_COMPLETED",
        message: "This project is completed. No further uploads allowed.",
      });
    }

    return res.status(400).json({ message: error.message });
  }
};
