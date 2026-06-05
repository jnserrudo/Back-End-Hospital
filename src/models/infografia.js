import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class InfografiaDietaModel {
  static getAll = async () => {
    try {
      const infografias = await prisma.infografiaDieta.findMany({
        where: {
          habilitado: 1,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return infografias;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getByCategoria = async (categoria) => {
    try {
      const infografias = await prisma.infografiaDieta.findMany({
        where: {
          habilitado: 1,
          categoria: categoria,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return infografias;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getById = async (id) => {
    try {
      const infografia = await prisma.infografiaDieta.findFirst({
        where: {
          id: +id,
        },
      });
      return infografia;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static add = async (dataInfografia) => {
    try {
      const newInfografia = await prisma.infografiaDieta.create({
        data: dataInfografia,
      });
      return newInfografia;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static update = async (id, dataInfografia) => {
    try {
      const infografia = await prisma.infografiaDieta.update({
        where: {
          id: +id,
        },
        data: dataInfografia,
      });
      return infografia;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static disable = async (id) => {
    try {
      const infografia = await prisma.infografiaDieta.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return infografia;
    } catch (error) {
      return {
        err: error,
      };
    }
  };
}
