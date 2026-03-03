-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('ADMIN', 'USER') NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectName` VARCHAR(191) NOT NULL,
    `projectCode` VARCHAR(191) NOT NULL,
    `receiptNo` INTEGER NOT NULL,
    `totalAmount` INTEGER NOT NULL,
    `perSurgeryAmount` INTEGER NOT NULL,
    `balanceSurgery` INTEGER NOT NULL,
    `totalSurgeries` INTEGER NOT NULL DEFAULT 0,
    `completedCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `submitted` ENUM('SUBMITTED', 'NOTSUBMITTED') NOT NULL DEFAULT 'NOTSUBMITTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Project_projectCode_key`(`projectCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Surgery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srNo` INTEGER NOT NULL,
    `mrdNo` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `operatedEye` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `sex` VARCHAR(191) NOT NULL,
    `dateOfSurgery` DATETIME(3) NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `surgeryName` VARCHAR(191) NOT NULL,
    `surgeryCategory` VARCHAR(191) NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `projectId` INTEGER NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Batch` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` INTEGER NOT NULL,
    `batchDate` DATETIME(3) NOT NULL,
    `completedCount` INTEGER NOT NULL,
    `incompleteCount` INTEGER NOT NULL,
    `excelPath` VARCHAR(191) NOT NULL,
    `zipPath` VARCHAR(191) NOT NULL,
    `creadtedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Surgery` ADD CONSTRAINT `Surgery_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Surgery` ADD CONSTRAINT `Surgery_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
