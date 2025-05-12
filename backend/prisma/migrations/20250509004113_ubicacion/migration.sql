/*
  Warnings:

  - A unique constraint covering the columns `[codigoBarras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anaquel` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pasillo` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `piso` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "anaquel" TEXT NOT NULL,
ADD COLUMN     "pasillo" TEXT NOT NULL,
ADD COLUMN     "piso" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");
