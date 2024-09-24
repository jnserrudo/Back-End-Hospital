import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class RecetaModel {
  static getAll = async () => {
    try {
      const recetas = await prisma.receta.findMany({
        where: {
          habilitado: 1,
        },
        include: {
          patologia: {
            // Incluir el array de PatologiaReceta
            include: {
              patologia: true, // Incluir la información de las Patologias
            },
          },
        },
      });
      return recetas;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
  static getRecetaFiltro = async (idsPatologias, idsCategorias) => {
    try {
      // Filtrar recetas habilitadas y por patologías/categorías seleccionadas
      const recetas = await prisma.receta.findMany({
        where: {
          habilitado: 1,
          OR: [
            idsPatologias.length > 0
              ? {
                  patologia: {
                    some: {
                      patologiaId: { in: idsPatologias },
                    },
                  },
                }
              : undefined,
            idsCategorias.length > 0
              ? {
                  categoria: {
                    some: {
                      categoriaId: { in: idsCategorias },
                    },
                  },
                }
              : undefined,
          ].filter(Boolean), // Filtra los undefined si no hay categorías o patologías seleccionadas
        },
      });

      // Obtener las categorías asociadas a cada receta
      const recetasConCategorias = await Promise.all(
        recetas.map(async (receta) => {
          const cat = await this.getCategoriaToRecetaEdit(receta.id);

          return {
            ...receta,
            categoriasAsociadas: cat?.categoriasAsociadas,
          };
        })
      );

      return recetasConCategorias;
    } catch (error) {
      return {
        err: error.message,
      };
    }
  };

  static getRecetabyId = async (id) => {
    try {
      id = +id;
      const receta = await prisma.receta.findMany({
        where: {
          id: id,
        },
      });
      return receta;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToRecetaAdd = async () => {
    try {
      console.log("get patologia to receta add model");
      const receta = await prisma.patologia.findMany();
      return receta;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getCategoriaToRecetaAdd = async () => {
    try {
      console.log("get CATEGORIA to receta add model");
      const categoria = await prisma.categoria.findMany({
        where: {
          tipo: 3,
        },
      });

      console.log("CATEGORIAS TO RECETA ADD: ", categoria);

      return categoria;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToRecetaEdit = async (id) => {
    try {
      id = +id;

      // Obtener todas las patologías
      const todasLasPatologias = await prisma.patologia.findMany();

      // Obtener la receta y las patologías asociadas
      const receta = await prisma.receta.findUnique({
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
        receta?.patologia.map((p) => p.patologia) || [];
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

  static getCategoriaToRecetaEdit = async (id) => {
    try {
      id = +id;

      // Obtener todas las patologías
      const todasLasCategorias = await prisma.categoria.findMany({
        where: {
          tipo: 3,
        },
      });

      // Obtener la receta y las patologías asociadas
      const receta = await prisma.receta.findUnique({
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
        receta?.categoria.map((p) => p.categoria) || [];
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

  static getRecetabyPatologia = async (idPatologia) => {
    try {
      idPatologia = +idPatologia;
      const recetas = await prisma.receta.findMany({
        where: {
          patologia: {
            some: {
              patologiaId: idPatologia,
            },
          },
        },
        include: {
          patologia: {
            include: {
              patologia: true,
            },
          },
        },
      });

      return recetas;
    } catch (error) {
      return { err: error };
    }
  };

  static getRecetabyPaciente = async (dni) => {
    try {
      // Buscar al usuario por su DNI
      const usuario = await prisma.usuario.findUnique({
        where: {
          dni: dni,
        },
      });

      if (!usuario) {
        return { err: "Usuario no encontrado" };
      }

      // Buscar al paciente asociado al usuario
      const paciente = await prisma.paciente.findUnique({
        where: {
          idUsuario: usuario.id,
        },
        include: {
          patologia: {
            include: {
              patologia: {
                include: {
                  recetas: {
                    include: {
                      receta: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!paciente) {
        return { err: "Paciente no encontrado" };
      }

      // Extraer las recetas relacionadas con las patologías
      const recetas = paciente.patologia.flatMap((p) =>
        p.patologia.recetas.map((r) => r.receta)
      );
      return recetas;
    } catch (error) {
      return {
        err: error.message,
      };
    }
  };

  /* static updateReceta = async (id, recetaUpdated) => {
    try {
      const receta = await prisma.receta.update({
        where: {
          id: +id,
        },
        data: recetaUpdated,
      });
      return receta;
    } catch (error) {
      return {
        err: error,
      };
    }
  }; */

  static updateReceta = async (id, recetaUpdated) => {
    try {
      const { idsPatologias, idsCategorias, ...recetaData } = recetaUpdated;

      // Inicia una transacción
      const result = await prisma.$transaction(async (prisma) => {
        // Actualiza la receta
        const receta = await prisma.receta.update({
          where: {
            id: +id,
          },
          data: recetaData,
        });

        // Si idsPatologias está presente y no está vacío
        if (idsPatologias && idsPatologias.length > 0) {
          // Elimina las relaciones antiguas
          await prisma.patologiaReceta.deleteMany({
            where: {
              recetaId: +id,
            },
          });

          // Inserta las nuevas relaciones
          const relaciones = idsPatologias.map((patologiaId) => ({
            recetaId: +id,
            patologiaId,
          }));
          await prisma.patologiaReceta.createMany({
            data: relaciones,
          });
        }
        // Si idsCategorias está presente y no está vacío
        if (idsCategorias && idsCategorias.length > 0) {
          // Elimina las relaciones antiguas con categorias
          await prisma.categoriaReceta.deleteMany({
            where: {
              recetaId: +id,
            },
          });

          // Inserta las nuevas relaciones con categorias
          const relacionesCategorias = idsCategorias.map((categoriaId) => ({
            recetaId: +id,
            categoriaId,
          }));

          await prisma.categoriaReceta.createMany({
            data: relacionesCategorias,
          });
        }

        return receta;
      });

      return result;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static addReceta = async (dataReceta) => {
    console.log("dataReceta: ", dataReceta);

    try {
      const {
        idsPatologias,
        idsCategorias,
        tipsSaludables,
        composicionNutricional,
        ...recetaData
      } = dataReceta;

      // Verifica y ajusta los valores de los campos opcionales
      const recetaDataAdjusted = {
        ...recetaData,
        tipsSaludables: tipsSaludables || null,
        composicionNutricional: composicionNutricional || null,
      };

      const newReceta = await prisma.receta.create({
        data: {
          ...recetaDataAdjusted,
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

      console.log("new receta agregada: ", newReceta);
      return newReceta;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static disable = async (id) => {
    try {
      const receta = await prisma.receta.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return receta;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
