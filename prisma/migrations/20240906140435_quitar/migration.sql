/*
  Warnings:

  - You are about to drop the column `patologiaId` on the `CategoriaEjercicio` table. All the data in the column will be lost.
  - You are about to drop the column `patologiaId` on the `CategoriaInformacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CategoriaEjercicio` DROP COLUMN `patologiaId`;

-- AlterTable
ALTER TABLE `CategoriaInformacion` DROP COLUMN `patologiaId`;
