import { FeedbackModel, FAQModel } from "../models/feedback.js";

export class FeedbackController {
  static getAll = async (req, res) => {
    const feedbacks = await FeedbackModel.getAll();
    if (!feedbacks?.err) {
      res.json(feedbacks);
    } else {
      res.json({ message: "Feedbacks no encontrados" }).status(404);
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const feedback = await FeedbackModel.getById(id);
    if (!feedback?.err) {
      res.json(feedback);
    } else {
      res.json({ message: "Feedback no encontrado" }).status(404);
    }
  };

  static add = async (req, res) => {
    const newFeedback = await FeedbackModel.add(req.body);
    if (!newFeedback?.err) {
      res.json(newFeedback);
    } else {
      res.json({ message: "Error al crear el feedback" }).status(404);
    }
  };

  static markAsRead = async (req, res) => {
    const { id } = req.params;
    const feedback = await FeedbackModel.markAsRead(id);
    if (!feedback?.err) {
      res.json(feedback);
    } else {
      res.json({ message: "Error al marcar como leído" }).status(404);
    }
  };
}

export class FAQController {
  static getAll = async (req, res) => {
    const faqs = await FAQModel.getAll();
    if (!faqs?.err) {
      res.json(faqs);
    } else {
      res.json({ message: "FAQs no encontradas" }).status(404);
    }
  };

  static getByCategoria = async (req, res) => {
    const { categoria } = req.params;
    const faqs = await FAQModel.getByCategoria(categoria);
    if (!faqs?.err) {
      res.json(faqs);
    } else {
      res.json({ message: "FAQs no encontradas" }).status(404);
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const faq = await FAQModel.getById(id);
    if (!faq?.err) {
      res.json(faq);
    } else {
      res.json({ message: "FAQ no encontrada" }).status(404);
    }
  };

  static add = async (req, res) => {
    const newFAQ = await FAQModel.add(req.body);
    if (!newFAQ?.err) {
      res.json(newFAQ);
    } else {
      res.json({ message: "Error al crear la FAQ" }).status(404);
    }
  };

  static update = async (req, res) => {
    const { id } = req.params;
    const faq = await FAQModel.update(id, req.body);
    if (!faq?.err) {
      res.json(faq);
    } else {
      res.json({ message: "FAQ no encontrada" }).status(404);
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    const result = await FAQModel.disable(id);
    if (!result?.err) {
      res.json(result);
    } else {
      res.json({ message: "No se pudo inhabilitar la FAQ" }).status(404);
    }
  };
}
