/*
  Warnings:

  - You are about to alter the column `nombre` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `Proveedor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `telefono` on the `Proveedor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[email]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "email" VARCHAR(100),
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "telefono" DROP NOT NULL,
ALTER COLUMN "telefono" SET DATA TYPE VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_email_key" ON "Proveedor"("email");
