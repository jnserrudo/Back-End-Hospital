import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CalendarioModel {
  static getAll = async () => {
    try {
      const eventos = await prisma.eventoCalendario.findMany({
        where: { habilitado: 1 },
        include: { patologia: true },
        orderBy: { fecha: 'asc' },
      });
      return eventos;
    } catch (error) {
      return { err: error };
    }
  };

  static getByFecha = async (fechaInicio, fechaFin) => {
    try {
      const eventos = await prisma.eventoCalendario.findMany({
        where: {
          habilitado: 1,
          fecha: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
        include: { patologia: true },
        orderBy: { fecha: 'asc' },
      });
      return eventos;
    } catch (error) {
      return { err: error };
    }
  };

  static getById = async (id) => {
    try {
      const evento = await prisma.eventoCalendario.findFirst({
        where: { id: +id },
        include: { patologia: true },
      });
      return evento;
    } catch (error) {
      return { err: error };
    }
  };

  static add = async (dataEvento) => {
    try {
      console.log("🔵 [MODELO] Datos recibidos para crear evento:", dataEvento);
      
      // Convertir fecha a DateTime si viene solo como fecha
      const eventoData = { ...dataEvento };
      if (eventoData.fecha && typeof eventoData.fecha === 'string' && !eventoData.fecha.includes('T')) {
        // Si la fecha no tiene hora, agregar hora local (sin Z para evitar conversión UTC)
        eventoData.fecha = new Date(eventoData.fecha + 'T12:00:00');
        console.log("🔵 [MODELO] Fecha convertida a DateTime:", eventoData.fecha);
      } else if (eventoData.fecha) {
        eventoData.fecha = new Date(eventoData.fecha);
      }
      
      const newEvento = await prisma.eventoCalendario.create({
        data: eventoData,
      });
      
      console.log("🔵 [MODELO] Evento creado en BD:", newEvento);
      return newEvento;
    } catch (error) {
      console.error("🔴 [MODELO] Error en Prisma al crear evento:", error);
      return { err: error };
    }
  };

  static update = async (id, dataEvento) => {
    try {
      // Convertir fecha a DateTime si viene solo como fecha
      const eventoData = { ...dataEvento };
      if (eventoData.fecha && typeof eventoData.fecha === 'string' && !eventoData.fecha.includes('T')) {
        // Si la fecha no tiene hora, agregar hora local (sin Z para evitar conversión UTC)
        eventoData.fecha = new Date(eventoData.fecha + 'T12:00:00');
        console.log("🔵 [MODELO] Fecha convertida a DateTime:", eventoData.fecha);
      } else if (eventoData.fecha) {
        eventoData.fecha = new Date(eventoData.fecha);
      }
      
      const evento = await prisma.eventoCalendario.update({
        where: { id: +id },
        data: eventoData,
      });
      return evento;
    } catch (error) {
      return { err: error };
    }
  };

  static disable = async (id) => {
    try {
      const evento = await prisma.eventoCalendario.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return evento;
    } catch (error) {
      return { err: error };
    }
  };
}
