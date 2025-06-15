/*
  Warnings:

  - You are about to drop the column `varifiedAt` on the `VerificationCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VerificationCode" DROP COLUMN "varifiedAt",
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
