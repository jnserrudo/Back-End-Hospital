/*
  Warnings:

  - You are about to drop the column `url` on the `Informacion` table. All the data in the column will be lost.
  - Added the required column `urlVideo` to the `Ejercicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcion` to the `Informacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlVideo` to the `Informacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ejercicio` ADD COLUMN `urlVideo` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Informacion` DROP COLUMN `url`,
    ADD COLUMN `descripcion` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlVideo` VARCHAR(191) NOT NULL;
