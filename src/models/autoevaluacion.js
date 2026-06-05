import { PrismaClient } from "@prisma/client";
import { sendAutoevaluacionEmail } from "../../procesoEmail.js";

const prisma = new PrismaClient();

export class AutoevaluacionModel {
  static create = async (data) => {
    try {
      const { idUsuario, pacienteId, profesionalId, ejercicioId, tipo, respuestas } = data;

      let resolvedPacienteId = pacienteId;
      if (idUsuario) {
        const paciente = await prisma.paciente.findUnique({
          where: { idUsuario: +idUsuario },
        });
        if (!paciente) {
          throw new Error("Paciente no encontrado para el usuario dado");
        }
        resolvedPacienteId = paciente.id;
      }

      const autoevaluacion = await prisma.autoevaluacion.create({
        data: {
          pacienteId: +resolvedPacienteId,
          profesionalId: profesionalId ? +profesionalId : null,
          ejercicioId: ejercicioId ? +ejercicioId : null,
          tipo: tipo,
          respuestas: typeof respuestas === 'string' ? respuestas : JSON.stringify(respuestas),
        },
        include: {
          paciente: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  apellido: true,
                },
              },
            },
          },
          ejercicio: {
            select: {
              nombre: true,
            },
          },
        },
      });

      if (profesionalId) {
        const profesional = await prisma.usuario.findUnique({
          where: { id: +profesionalId },
          select: { email: true },
        });

        if (profesional && profesional.email) {
          const pacienteNombre = `${autoevaluacion.paciente.usuario.nombre} ${autoevaluacion.paciente.usuario.apellido}`;
          const nombreEjercicio = autoevaluacion.ejercicio?.nombre || null;

          await sendAutoevaluacionEmail(
            profesional.email,
            pacienteNombre,
            tipo,
            respuestas,
            nombreEjercicio
          );
        }
      }

      return autoevaluacion;
    } catch (error) {
      console.error("Error en AutoevaluacionModel.create: ", error);
      return { err: error.message };
    }
  };

  static getAll = async (filters = {}) => {
    try {
      const { pacienteId, profesionalId, tipo } = filters;
      const where = {};
      if (pacienteId) where.pacienteId = +pacienteId;
      if (profesionalId) where.profesionalId = +profesionalId;
      if (tipo) where.tipo = tipo;

      const autoevaluaciones = await prisma.autoevaluacion.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          paciente: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  apellido: true,
                  dni: true,
                },
              },
            },
          },
          profesional: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          ejercicio: {
            select: {
              nombre: true,
            },
          },
        },
      });
      return autoevaluaciones;
    } catch (error) {
      return { err: error.message };
    }
  };
}
