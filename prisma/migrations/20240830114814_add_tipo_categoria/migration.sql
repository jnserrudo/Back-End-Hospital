/*
  Warnings:

  - Added the required column `tipo` to the `Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Categoria` ADD COLUMN `tipo` INTEGER NOT NULL;
