/*
  Warnings:

  - Added the required column `description` to the `Script` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Script` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Script` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL;
