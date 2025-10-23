-- CreateTable
CREATE TABLE "public"."UploadSecret" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "urlExpires" INTEGER NOT NULL DEFAULT 300,

    CONSTRAINT "UploadSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Highlight" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "storageObjectId" TEXT NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadSecret_secret_key" ON "public"."UploadSecret"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "UploadSecret_userId_key" ON "public"."UploadSecret"("userId");

-- AddForeignKey
ALTER TABLE "public"."UploadSecret" ADD CONSTRAINT "UploadSecret_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
