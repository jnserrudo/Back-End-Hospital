import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class FeedbackModel {
  static getAll = async () => {
    try {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return feedbacks;
    } catch (error) {
      return { err: error };
    }
  };

  static getById = async (id) => {
    try {
      const feedback = await prisma.feedback.findFirst({
        where: { id: +id },
      });
      return feedback;
    } catch (error) {
      return { err: error };
    }
  };

  static add = async (dataFeedback) => {
    try {
      const newFeedback = await prisma.feedback.create({
        data: dataFeedback,
      });
      return newFeedback;
    } catch (error) {
      return { err: error };
    }
  };

  static markAsRead = async (id) => {
    try {
      const feedback = await prisma.feedback.update({
        where: { id: +id },
        data: { leido: 1 },
      });
      return feedback;
    } catch (error) {
      return { err: error };
    }
  };
}

export class FAQModel {
  static getAll = async () => {
    try {
      const faqs = await prisma.fAQ.findMany({
        where: { habilitado: 1 },
        orderBy: { orden: 'asc' },
      });
      return faqs;
    } catch (error) {
      return { err: error };
    }
  };

  static getByCategoria = async (categoria) => {
    try {
      const faqs = await prisma.fAQ.findMany({
        where: {
          habilitado: 1,
          categoria: categoria,
        },
        orderBy: { orden: 'asc' },
      });
      return faqs;
    } catch (error) {
      return { err: error };
    }
  };

  static getById = async (id) => {
    try {
      const faq = await prisma.fAQ.findFirst({
        where: { id: +id },
      });
      return faq;
    } catch (error) {
      return { err: error };
    }
  };

  static add = async (dataFAQ) => {
    try {
      const newFAQ = await prisma.fAQ.create({
        data: dataFAQ,
      });
      return newFAQ;
    } catch (error) {
      return { err: error };
    }
  };

  static update = async (id, dataFAQ) => {
    try {
      const faq = await prisma.fAQ.update({
        where: { id: +id },
        data: dataFAQ,
      });
      return faq;
    } catch (error) {
      return { err: error };
    }
  };

  static disable = async (id) => {
    try {
      const faq = await prisma.fAQ.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return faq;
    } catch (error) {
      return { err: error };
    }
  };
}
