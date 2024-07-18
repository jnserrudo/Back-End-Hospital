-- AlterTable
ALTER TABLE `Ejercicio` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Informacion` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Paciente` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Patologia` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `PatologiaEjercicio` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `PatologiaInformacion` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `PatologiaPaciente` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `PatologiaReceta` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Receta` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Rol` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `habilitado` INTEGER NOT NULL DEFAULT 1;
