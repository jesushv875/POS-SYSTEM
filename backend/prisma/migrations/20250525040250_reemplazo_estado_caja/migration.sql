/*
  Warnings:

  - You are about to drop the column `cerrada` on the `Caja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Caja" DROP COLUMN "cerrada",
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT false;
