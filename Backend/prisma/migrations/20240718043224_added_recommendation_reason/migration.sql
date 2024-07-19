/*
  Warnings:

  - Added the required column `reason` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "reason" TEXT NOT NULL;
