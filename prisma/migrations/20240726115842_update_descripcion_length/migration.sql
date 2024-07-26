-- AlterTable
ALTER TABLE `Ejercicio` MODIFY `descripcion` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Informacion` MODIFY `descripcion` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Patologia` MODIFY `descripcion` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Receta` MODIFY `ingredientes` TEXT NOT NULL,
    MODIFY `preparacion` TEXT NOT NULL;
