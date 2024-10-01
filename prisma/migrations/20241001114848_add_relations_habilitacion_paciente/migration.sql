-- CreateTable
CREATE TABLE `HabilitacionPaciente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `motivo` TEXT NOT NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo` VARCHAR(191) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `pacienteId` INTEGER NOT NULL,
    `habilitado` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HabilitacionPaciente` ADD CONSTRAINT `HabilitacionPaciente_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HabilitacionPaciente` ADD CONSTRAINT `HabilitacionPaciente_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `Paciente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
