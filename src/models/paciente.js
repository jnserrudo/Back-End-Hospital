import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class PacienteModel {
  static getAll = async () => {
    try {
      const pacientes = await prisma.paciente.findMany({
        /*  where: {
                  habilitado: 0
                }, */
        include: {
          usuario: {
            select: {
              dni: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
      return pacientes;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPacientebyDni = async (dni) => {
    try {
      dni = +dni;
      const paciente = await prisma.paciente.findFirst({
        where: {
          dni: dni,
        },
      });
      return paciente;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPacientebyId = async (id) => {
    try {
      console.log(id);
      const paciente = await prisma.paciente.findFirst({
        where: {
          id: +id,
        },
        include: {
          usuario: {
            select: {
              dni: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });
      return paciente;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static HabilitarPaciente = async (pacienteId, usuarioId, motivo) => {
    try {
      console.log(pacienteId, usuarioId, motivo);
      const paciente = await prisma.paciente.update({
        where: {
          id: +pacienteId,
        },
        data: {
          habilitado: 1, // El campo habilitado se actualiza a 1
        },
      });

      // Registrar en el historial
      const historial = await prisma.habilitacionPaciente.create({
        data: {
          motivo,
          tipo: "habilitacion",
          usuarioId:+usuarioId,
          pacienteId:+pacienteId,
        },
      });

      console.log("historial: ", historial);
      return paciente;
    } catch (error) {
      console.log(error)
      return {
        err: error,
      };
    }
  };

  static DeshabilitarPaciente = async (pacienteId, usuarioId, motivo) => {
    try {
      console.log(pacienteId, usuarioId, motivo);

      const paciente = await prisma.paciente.update({
        where: {
          id: +pacienteId,
        },
        data: {
          habilitado: 0, // El campo habilitado se actualiza a 1
        },
      });

      // Registrar en el historial
      const historial = await prisma.habilitacionPaciente.create({
        data: {
          motivo,
          tipo: "deshabilitacion",
          usuarioId:+usuarioId,
          pacienteId:+pacienteId,
        },
      });
      console.log("historial: ", historial);

      return paciente;
    } catch (error) {
      console.log(error)
      return {
        err: error,
      };
    }
  };

  static getInformacionxPaciente = async (idUsuario) => {
    try {
      idUsuario = +idUsuario;

      // Obtener el paciente a partir del idUsuario
      const paciente = await prisma.paciente.findUnique({
        where: {
          idUsuario: idUsuario,
        },
        include: {
          patologia: {
            include: {
              patologia: {
                include: {
                  informacion: {
                    include: {
                      informacion: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!paciente) {
        throw new Error("Paciente no encontrado");
      }

      // Extraer las informaciones relacionadas con las patologías del paciente
      const informaciones = paciente.patologia
        .flatMap((patologiaPaciente) => patologiaPaciente.patologia.informacion)
        .map((patologiaInformacion) => patologiaInformacion.informacion);

      //VAMOS A CAMBIAR LOS FILTROS, AHORA SE MOSTRARAN TODAS, SIN IMPORTAR LAS PATOLOGIAS, SIMPLEMENTE
      //LLAMARAN AL GETALL

      return informaciones;
    } catch (error) {
      return {
        err: error.message,
      };
    }
  };

  static getEjerciciosxPaciente = async (idUsuario) => {
    try {
      idUsuario = +idUsuario;

      // Obtener el paciente a partir del idUsuario
      const paciente = await prisma.paciente.findFirst({
        where: {
          idUsuario: idUsuario,
        },
        include: {
          patologia: {
            include: {
              patologia: {
                include: {
                  ejercicio: {
                    include: {
                      ejercicio: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!paciente) {
        throw new Error("Paciente no encontrado");
      }

      // Extraer los ejercicios relacionados con las patologías del paciente
      const ejercicios = paciente.patologia
        .flatMap((patologiaPaciente) => patologiaPaciente.patologia.ejercicio)
        .map((patologiaEjercicio) => patologiaEjercicio.ejercicio);

      return ejercicios;
    } catch (error) {
      return {
        err: error.message,
      };
    }
  };

  static updatePaciente = async (dni, pacienteUpdated) => {
    try {
      const paciente = await prisma.paciente.update({
        where: {
          dni: +dni,
        },
        data: pacienteUpdated,
      });
      return paciente;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static addPaciente = async (dataPaciente) => {
    try {
      const newPaciente = await prisma.paciente.create({
        data: dataPaciente,
      });

      return newPaciente;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
  static disable = async (id) => {
    try {
      const paciente = await prisma.paciente.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return paciente;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
