/*
  Warnings:

  - Added the required column `script_arguments` to the `Script` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "script_arguments" JSONB NOT NULL;
