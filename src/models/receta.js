import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class RecetaModel {
  static getAll = async () => {
    try {
      const recetas = await prisma.receta.findMany();
      /* console.log(data)
            const recetas=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */ return recetas;
    } catch (error) {
      return {
        err: error,
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
  }

  static getRecetabyPaciente = async (ndocu) => {
    try {
      ndocu = +ndocu;
      const receta = await prisma.receta.findFirst({
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

  static updateReceta = async (id, recetaUpdated) => {
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
  };

  static addReceta = async (dataReceta) => {
    console.log(dataReceta);

    try {
      const { idsPatologias, ...recetaData } = dataReceta;

      const newReceta = await prisma.receta.create({
        data: {
          ...recetaData,
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

      return newReceta;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
