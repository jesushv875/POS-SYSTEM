/*
  Warnings:

  - You are about to alter the column `precio` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the `detalles_ventas` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `proveedorId` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "detalles_ventas" DROP CONSTRAINT "detalles_ventas_productoId_fkey";

-- DropForeignKey
ALTER TABLE "detalles_ventas" DROP CONSTRAINT "detalles_ventas_ventaId_fkey";

-- DropIndex
DROP INDEX "Categoria_nombre_key";

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "precio" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "proveedorId" SET NOT NULL;

-- DropTable
DROP TABLE "detalles_ventas";

-- CreateTable
CREATE TABLE "DetalleVenta" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,

    CONSTRAINT "DetalleVenta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
