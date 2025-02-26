-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "categoriaId" INTEGER,
ADD COLUMN     "codigoBarras" TEXT,
ADD COLUMN     "imagenUrl" TEXT,
ADD COLUMN     "stockMinimo" INTEGER;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
