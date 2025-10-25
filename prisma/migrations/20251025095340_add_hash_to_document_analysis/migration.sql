/*
  Warnings:

  - Added the required column `documentHash` to the `document_analyses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."document_analyses" ADD COLUMN     "documentHash" TEXT NOT NULL;
