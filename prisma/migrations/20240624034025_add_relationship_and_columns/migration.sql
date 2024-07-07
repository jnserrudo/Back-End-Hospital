/*
  Warnings:

  - A unique constraint covering the columns `[idUsuario]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `idUsuario` INTEGER NULL;

-- AlterTable
ALTER TABLE `Receta` ADD COLUMN `composicionNutricional` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `tipsSaludables` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `apellido` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `blanqueado` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `detalle` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `dni` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `email` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `usuario` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `Paciente_idUsuario_key` ON `Paciente`(`idUsuario`);

-- AddForeignKey
ALTER TABLE `Paciente` ADD CONSTRAINT `Paciente_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
