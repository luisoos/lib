/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Conversation";

-- CreateTable
CREATE TABLE "public"."document_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storage_object_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "entities" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "keywords" TEXT[],
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_analyses_user_id_idx" ON "public"."document_analyses"("user_id");

-- CreateIndex
CREATE INDEX "document_analyses_storage_object_id_idx" ON "public"."document_analyses"("storage_object_id");

-- AddForeignKey
ALTER TABLE "public"."document_analyses" ADD CONSTRAINT "document_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
