/*
  Warnings:

  - You are about to drop the column `creadtedBy` on the `batch` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `batch` DROP COLUMN `creadtedBy`,
    ADD COLUMN `createdBy` INTEGER NOT NULL;
