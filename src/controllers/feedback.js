import { sendError, AppError } from "../utils/http.js";
import { FeedbackModel, FAQModel } from "../models/feedback.js";

// Tipos de comentario que acepta el formulario (valor → texto que se guarda en el mensaje).
const TIPOS_FEEDBACK = {
  sugerencia: "Sugerencia",
  consulta: "Consulta",
  problema: "Problema",
  felicitacion: "Felicitación",
  otro: "Otro",
};

export class FeedbackController {
  static getAll = async (req, res) => {
    const feedbacks = await FeedbackModel.getAll();
    if (!feedbacks?.err) {
      res.json(feedbacks);
    } else {
      sendError(res, feedbacks.err, "No pudimos cargar las sugerencias");
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const feedback = await FeedbackModel.getById(id);
    if (!feedback?.err) {
      res.json(feedback);
    } else {
      sendError(res, feedback.err, "No pudimos cargar la sugerencia");
    }
  };

  static add = async (req, res) => {
    const { mensaje, calificacion } = req.body || {};
    if (!mensaje || !String(mensaje).trim()) {
      return sendError(res, new AppError(400, "Escribí tu mensaje antes de enviarlo."), "No pudimos enviar tu mensaje");
    }
    // El email es opcional; si viene, tiene que ser válido para poder responder.
    const emailTxt = String(req.body?.email || "").trim();
    if (emailTxt && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTxt)) {
      return sendError(res, new AppError(400, "Revisá el email: parece incompleto. Si no querés que te respondan, dejalo vacío."), "No pudimos enviar tu mensaje");
    }
    // Si el formulario no trae nombre, usamos el de la sesión; el usuario siempre sale del token.
    const nombre = `${req.user.nombre || ""} ${req.user.apellido || ""}`.trim() || req.user.usuario;
    const newFeedback = await FeedbackModel.add({
      nombre: String(req.body?.nombre || nombre).slice(0, 180),
      email: emailTxt.slice(0, 180),
      usuario: req.user.usuario,
      mensaje: String(mensaje).trim(),
      calificacion,
      tipo: TIPOS_FEEDBACK[String(req.body?.tipo || "").toLowerCase()] || null,
    });
    if (!newFeedback?.err) {
      res.status(201).json(newFeedback);
    } else {
      sendError(res, newFeedback.err, "No pudimos enviar tu mensaje");
    }
  };

  static markAsRead = async (req, res) => {
    const { id } = req.params;
    const feedback = await FeedbackModel.markAsRead(id);
    if (!feedback?.err) {
      res.json(feedback);
    } else {
      sendError(res, feedback.err, "No pudimos marcar la sugerencia como leída");
    }
  };
}

export class FAQController {
  static getAll = async (req, res) => {
    const faqs = await FAQModel.getAll();
    if (!faqs?.err) {
      res.json(faqs);
    } else {
      sendError(res, faqs.err, "No pudimos cargar las preguntas frecuentes");
    }
  };

  static getByCategoria = async (req, res) => {
    const { categoria } = req.params;
    const faqs = await FAQModel.getByCategoria(categoria);
    if (!faqs?.err) {
      res.json(faqs);
    } else {
      sendError(res, faqs.err, "No pudimos cargar las preguntas frecuentes");
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const faq = await FAQModel.getById(id);
    if (!faq?.err) {
      res.json(faq);
    } else {
      sendError(res, faq.err, "No pudimos cargar la pregunta");
    }
  };

  static add = async (req, res) => {
    const newFAQ = await FAQModel.add(req.body);
    if (!newFAQ?.err) {
      res.json(newFAQ);
    } else {
      sendError(res, newFAQ.err, "No pudimos guardar la pregunta");
    }
  };

  static update = async (req, res) => {
    const { id } = req.params;
    const faq = await FAQModel.update(id, req.body);
    if (!faq?.err) {
      res.json(faq);
    } else {
      sendError(res, faq.err, "No pudimos guardar los cambios de la pregunta");
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    const result = await FAQModel.disable(id);
    if (!result?.err) {
      res.json(result);
    } else {
      sendError(res, result.err, "No pudimos deshabilitar la pregunta");
    }
  };
}
