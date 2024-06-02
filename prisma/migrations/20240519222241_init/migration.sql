-- CreateTable
CREATE TABLE "Paciente" (
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domicilio" TEXT NOT NULL,
    "obraSocial" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "nroAfiliado" INTEGER NOT NULL,
    "telefono" INTEGER NOT NULL,
    "vacunas" TEXT,
    "app" TEXT,
    "afp" TEXT,
    "alergias" TEXT
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "evolucion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "pacienteDni" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Consulta_pacienteDni_fkey" FOREIGN KEY ("pacienteDni") REFERENCES "Paciente" ("dni") ON DELETE RESTRICT ON UPDATE CASCADE
);
