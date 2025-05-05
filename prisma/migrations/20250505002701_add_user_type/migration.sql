/*
  Warnings:

  - You are about to drop the column `createdById` on the `Property` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TENANT', 'OWNER');

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_createdById_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "createdById",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'TENANT';

-- CreateTable
CREATE TABLE "_PropertyTenants" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertyTenants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PropertyTenants_B_index" ON "_PropertyTenants"("B");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyTenants" ADD CONSTRAINT "_PropertyTenants_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyTenants" ADD CONSTRAINT "_PropertyTenants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
