-- CreateEnum
CREATE TYPE "public"."MachineCategory" AS ENUM ('Console', 'PC_L', 'PC_R');

-- CreateEnum
CREATE TYPE "public"."MachineStatus" AS ENUM ('online', 'offline');

-- CreateTable
CREATE TABLE "public"."machine_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specifications" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "lounge_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rate_by_players" (
    "id" TEXT NOT NULL,
    "noOfPlayers" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "machineTypeId" TEXT NOT NULL,

    CONSTRAINT "rate_by_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."machines" (
    "id" TEXT NOT NULL,
    "machine_type_id" TEXT NOT NULL,
    "category" "public"."MachineCategory" NOT NULL,
    "serial_number" TEXT NOT NULL,
    "status" "public"."MachineStatus" NOT NULL DEFAULT 'online',
    "lounge_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machines_serial_number_key" ON "public"."machines"("serial_number");

-- AddForeignKey
ALTER TABLE "public"."machine_types" ADD CONSTRAINT "machine_types_lounge_id_fkey" FOREIGN KEY ("lounge_id") REFERENCES "public"."lounges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rate_by_players" ADD CONSTRAINT "rate_by_players_machineTypeId_fkey" FOREIGN KEY ("machineTypeId") REFERENCES "public"."machine_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."machines" ADD CONSTRAINT "machines_machine_type_id_fkey" FOREIGN KEY ("machine_type_id") REFERENCES "public"."machine_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."machines" ADD CONSTRAINT "machines_lounge_id_fkey" FOREIGN KEY ("lounge_id") REFERENCES "public"."lounges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
