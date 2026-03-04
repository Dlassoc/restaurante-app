-- CreateTable
CREATE TABLE "public"."Restaurante" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "id" SERIAL NOT NULL,
    "restauranteId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reserva" (
    "id" SERIAL NOT NULL,
    "restauranteId" INTEGER NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "personas" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reserva_restauranteId_fechaHora_idx" ON "public"."Reserva"("restauranteId", "fechaHora");

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_restauranteId_fkey" FOREIGN KEY ("restauranteId") REFERENCES "public"."Restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reserva" ADD CONSTRAINT "Reserva_restauranteId_fkey" FOREIGN KEY ("restauranteId") REFERENCES "public"."Restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
