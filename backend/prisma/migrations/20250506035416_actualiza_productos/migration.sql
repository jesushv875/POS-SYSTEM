/*
  Warnings:

  - You are about to drop the column `stock` on the `Producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigoBarras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "stock",
ADD COLUMN     "ubicacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");
