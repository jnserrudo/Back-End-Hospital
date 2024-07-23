import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import fs from "fs";

const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);
const prisma = new PrismaClient();
export class EjercicioModel {
  static getAll = async () => {
    try {
      const ejercicio = await prisma.ejercicio.findMany({
        where: {
          habilitado: 1,
        },
      });
      /* console.log(data)
            const ejercicios=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */ return ejercicio;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getEjerciciobyId = async (id) => {
    try {
      id = +id;
      const ejercicio = await prisma.ejercicio.findFirst({
        where: {
          id: id,
        },
      });
      return ejercicio;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  /* static updateEjercicio=async(id,ejercicioUpdated)=>{
        try {
            const ejercicio=await prisma.ejercicio.update({
                where:{
                    id:+id
                },
                data:ejercicioUpdated
            }) 
            return ejercicio    
        } catch (error) {
            return {
                err:error
            }
        }
        
    } */

  static updateEjercicio = async (id, ejercicioUpdated) => {
    try {
      const { idsPatologias, ...ejercicioData } = ejercicioUpdated;
      // Recupera la URL del video antiguo antes de actualizar
      const oldEjercicio = await prisma.ejercicio.findUnique({
        where: { id: +id },
      });
      // Inicia una transacción
      const result = await prisma.$transaction(async (prisma) => {
        // Actualiza el ejercicio
        const ejercicio = await prisma.ejercicio.update({
          where: {
            id: +id,
          },
          data: ejercicioData,
        });

        // Elimina las relaciones antiguas
        await prisma.patologiaEjercicio.deleteMany({
          where: {
            ejercicioId: +id,
          },
        });

        // Inserta las nuevas relaciones
        if (idsPatologias && idsPatologias.length > 0) {
          const relaciones = idsPatologias.map((patologiaId) => ({
            ejercicioId: +id,
            patologiaId,
          }));
          await prisma.patologiaEjercicio.createMany({
            data: relaciones,
          });
        }

        return ejercicio;
      });

      // Después de actualizar, elimina el archivo antiguo si hay una nueva URL
      if (
        ejercicioData.urlVideo &&
        oldEjercicio.urlVideo !== ejercicioData.urlVideo
      ) {
        const oldFilePath = join(
          dirnamex,
          "../uploads",
          basename(oldEjercicio.urlVideo)
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo antiguo: ${err}`);
          } else {
            console.log(`Archivo antiguo eliminado: ${oldFilePath}`);
          }
        });
      }
      return result;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static addEjercicio = async (dataEjercicio) => {
    try {
      const { idsPatologias, ...ejercicioData } = dataEjercicio;

      const newEjercicio = await prisma.ejercicio.create({
        data: {
          ...ejercicioData,
          patologia: {
            create:
              idsPatologias?.map((id) => ({
                patologia: {
                  connect: { id },
                },
              })) || [],
          },
        },
      });

      console.log("newEjercicio: ", newEjercicio);
      return newEjercicio;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToEjercicioAdd = async () => {
    try {
      console.log("get patologia to ejercicio add model");
      const ejercicio = await prisma.patologia.findMany();
      return ejercicio;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToEjercicioEdit = async (id) => {
    try {
      id = +id;

      // Obtener todas las patologías
      const todasLasPatologias = await prisma.patologia.findMany();

      // Obtener la ejercicio y las patologías asociadas
      const ejercicio = await prisma.ejercicio.findUnique({
        where: { id: id },
        include: {
          patologia: {
            include: {
              patologia: true,
            },
          },
        },
      });

      const patologiasAsociadas =
        ejercicio?.patologia.map((p) => p.patologia) || [];
      const patologiasAsociadasIds = new Set(
        patologiasAsociadas.map((p) => p.id)
      );

      const patologiasNoAsociadas = todasLasPatologias.filter(
        (p) => !patologiasAsociadasIds.has(p.id)
      );

      return { patologiasAsociadas, patologiasNoAsociadas };
    } catch (error) {
      return { err: error.message };
    }
  };

  static disable = async (id) => {
    try {
      const ejercicio = await prisma.ejercicio.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return ejercicio;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
