-- AlterTable
ALTER TABLE "Caja" ADD COLUMN     "cerrada" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CorteCaja" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fondoInicial" DECIMAL(65,30) NOT NULL,
    "totalVentas" DECIMAL(65,30) NOT NULL,
    "ingresos" DECIMAL(65,30) NOT NULL,
    "egresos" DECIMAL(65,30) NOT NULL,
    "totalEntregado" DECIMAL(65,30) NOT NULL,
    "usuarioId" INTEGER,

    CONSTRAINT "CorteCaja_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CorteCaja" ADD CONSTRAINT "CorteCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
