/*
  Warnings:

  - The `ubicacion` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "existencias" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "ubicacion",
ADD COLUMN     "ubicacion" JSONB;
