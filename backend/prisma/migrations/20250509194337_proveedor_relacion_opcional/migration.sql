-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_proveedorId_fkey";

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "proveedorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
