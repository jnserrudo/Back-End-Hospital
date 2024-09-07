import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import fs from "fs";

// Obtén el nombre del archivo y el directorio actual
const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);

const prisma = new PrismaClient();
export class InformacionModel {
  static getAll = async () => {
    try {
      const informacion = await prisma.informacion.findMany({
        where: {
          habilitado: 1,
        },
      });
      /* console.log(data)
            const informacions=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */
      // Usa Promise.all para esperar a que todas las promesas se resuelvan
      const infoConcategorias = await Promise.all(
        informacion.map(async (info) => {
          const cat = await this.getCategoriaToInformacionEdit(info.id);

          return{
            ...info,
            categoriasAsociadas:cat?.categoriasAsociadas
          }

        })
      );
      return infoConcategorias

    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getInformacionbyId = async (id) => {
    try {
      id = +id;
      const informacion = await prisma.informacion.findFirst({
        where: {
          id: id,
        },
      });
      return informacion;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  /* static updateInformacion=async(id,informacionUpdated)=>{
        try {
            const informacion=await prisma.informacion.update({
                where:{
                    id:+id
                },
                data:informacionUpdated
            }) 
            return informacion    
        } catch (error) {
            return {
                err:error
            }
        }
        
    } */

  static updateInformacion = async (id, informacionUpdated) => {
    try {
      const { idsPatologias, idsCategorias, ...informacionData } =
        informacionUpdated;

      const oldInformacion = await prisma.informacion.findUnique({
        where: { id: +id },
      });

      // Inicia una transacción
      const result = await prisma.$transaction(async (prisma) => {
        // Actualiza la información
        const informacion = await prisma.informacion.update({
          where: {
            id: +id,
          },
          data: informacionData,
        });

        // Si idsPatologias está presente y no está vacío
        if (idsPatologias && idsPatologias.length > 0) {
          // Elimina las relaciones antiguas
          await prisma.patologiaInformacion.deleteMany({
            where: {
              informacionId: +id,
            },
          });

          // Inserta las nuevas relaciones
          const relaciones = idsPatologias.map((patologiaId) => ({
            informacionId: +id,
            patologiaId,
          }));
          await prisma.patologiaInformacion.createMany({
            data: relaciones,
          });
        }

        // Si idsCategorias está presente y no está vacío
        if (idsCategorias && idsCategorias.length > 0) {
          // Elimina las relaciones antiguas con categorias
          await prisma.categoriaInformacion.deleteMany({
            where: {
              informacionId: +id,
            },
          });

          // Inserta las nuevas relaciones con categorias
          const relacionesCategorias = idsCategorias.map((categoriaId) => ({
            informacionId: +id,
            categoriaId,
          }));

          await prisma.categoriaInformacion.createMany({
            data: relacionesCategorias,
          });
        }

        return informacion;
      });

      // Después de actualizar, elimina el archivo antiguo si hay una nueva URL
      if (
        informacionData.urlVideo &&
        oldInformacion.urlVideo !== informacionData.urlVideo
      ) {
        const oldFilePath = join(
          dirnamex,
          "../uploads",
          basename(oldInformacion.urlVideo)
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

  static addInformacion = async (dataInformacion) => {
    try {
      const { idsPatologias, idsCategorias, ...informacionData } =
        dataInformacion;
      console.log(dataInformacion);
      const newInformacion = await prisma.informacion.create({
        data: {
          ...informacionData,
          patologia: {
            create:
              idsPatologias?.map((id) => ({
                patologia: {
                  connect: { id },
                },
              })) || [],
          },
          categoria: {
            create:
              idsCategorias?.map((id) => ({
                categoria: {
                  connect: { id },
                },
              })) || [],
          },
        },
      });

      console.log("newInformacion: ", newInformacion);
      return newInformacion;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToInformacionAdd = async () => {
    try {
      console.log("get patologia to informacion add model");
      const informacion = await prisma.patologia.findMany();
      return informacion;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToInformacionEdit = async (id) => {
    try {
      id = +id;

      // Obtener todas las patologías
      const todasLasPatologias = await prisma.patologia.findMany();

      // Obtener la informacion y las patologías asociadas
      const informacion = await prisma.informacion.findUnique({
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
        informacion?.patologia.map((p) => p.patologia) || [];
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

  static getCategoriaToInformacionAdd = async () => {
    try {
      console.log("get categoria to informacion add model");
      const categoria = await prisma.categoria.findMany({
        where: {
          tipo: 2,
        },
      });
      return categoria;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getCategoriaToInformacionEdit = async (id) => {
    try {
      id = +id;

      // Obtener todas las patologías
      const todasLasCategorias = await prisma.categoria.findMany({
        where: {
          tipo: 2,
        },
      });

      // Obtener la categoria y las categorias asociadas
      const informacion = await prisma.informacion.findUnique({
        where: { id: id },
        include: {
          categoria: {
            include: {
              categoria: true,
            },
          },
        },
      });

      const categoriasAsociadas =
        informacion?.categoria.map((p) => p.categoria) || [];
      const categoriasAsociadasIds = new Set(
        categoriasAsociadas.map((p) => p.id)
      );

      const categoriasNoAsociadas = todasLasCategorias.filter(
        (p) => !categoriasAsociadasIds.has(p.id)
      );

      return { categoriasAsociadas, categoriasNoAsociadas };
    } catch (error) {
      return { err: error.message };
    }
  };

  static disable = async (id) => {
    try {
      const informacion = await prisma.informacion.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return informacion;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
