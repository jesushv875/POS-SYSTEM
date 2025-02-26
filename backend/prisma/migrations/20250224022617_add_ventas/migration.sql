/*
  Warnings:

  - You are about to alter the column `precio` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "precio" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_ventas" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalles_ventas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_ventas" ADD CONSTRAINT "detalles_ventas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_ventas" ADD CONSTRAINT "detalles_ventas_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
