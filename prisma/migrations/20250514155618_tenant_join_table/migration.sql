/*
  Warnings:

  - You are about to drop the `_PropertyTenants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_PropertyTenants" DROP CONSTRAINT "_PropertyTenants_A_fkey";

-- DropForeignKey
ALTER TABLE "_PropertyTenants" DROP CONSTRAINT "_PropertyTenants_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "_PropertyTenants";

-- CreateTable
CREATE TABLE "PropertyTenant" (
    "propertyId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PropertyTenant_pkey" PRIMARY KEY ("propertyId","userId")
);

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyTenant" ADD CONSTRAINT "PropertyTenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyTenant" ADD CONSTRAINT "PropertyTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
