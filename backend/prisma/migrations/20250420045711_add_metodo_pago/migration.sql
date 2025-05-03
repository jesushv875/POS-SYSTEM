-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "metodoPago" TEXT,
ADD COLUMN     "pagoEfectivo" DECIMAL(65,30),
ADD COLUMN     "pagoTarjeta" DECIMAL(65,30);
