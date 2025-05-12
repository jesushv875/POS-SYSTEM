/*
  Warnings:

  - You are about to drop the column `existencias` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `stock` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Producto_codigoBarras_key";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "existencias",
DROP COLUMN "ubicacion",
ADD COLUMN     "stock" INTEGER NOT NULL;
