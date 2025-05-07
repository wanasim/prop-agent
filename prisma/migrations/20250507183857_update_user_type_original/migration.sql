/*
  Warnings:

  - You are about to drop the column `userTypee` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TENANT', 'OWNER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userTypee",
ADD COLUMN     "userType" "UserType";

-- DropEnum
DROP TYPE "UserTypee";
