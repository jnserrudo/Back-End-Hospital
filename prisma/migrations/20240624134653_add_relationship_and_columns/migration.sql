/*
  Warnings:

  - You are about to drop the column `apellido` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Paciente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Paciente` DROP COLUMN `apellido`,
    DROP COLUMN `nombre`,
    ADD COLUMN `diariosActividadFisica` VARCHAR(191) NULL,
    ADD COLUMN `diariosIngesta` VARCHAR(191) NULL,
    ADD COLUMN `fichaRegistro` VARCHAR(191) NULL,
    ADD COLUMN `fichaSalud` VARCHAR(191) NULL,
    ADD COLUMN `indicacionesPrescripciones` VARCHAR(191) NULL,
    ADD COLUMN `informes` VARCHAR(191) NULL,
    ADD COLUMN `legajo` VARCHAR(191) NULL,
    ADD COLUMN `registroFotografico` VARCHAR(191) NULL,
    ADD COLUMN `resultadosEstudios` VARCHAR(191) NULL,
    ADD COLUMN `seguimiento` VARCHAR(191) NULL;
