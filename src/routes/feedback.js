import express from "express";
import { FeedbackController, FAQController } from "../controllers/feedback.js";

export const feedbackRouter = express.Router();
export const faqRouter = express.Router();

// Rutas de Feedback
feedbackRouter.get('/', FeedbackController.getAll);
feedbackRouter.get('/:id', FeedbackController.getById);
feedbackRouter.post('/', FeedbackController.add);
feedbackRouter.put('/marcar-leido/:id', FeedbackController.markAsRead);

// Rutas de FAQ
faqRouter.get('/', FAQController.getAll);
faqRouter.get('/categoria/:categoria', FAQController.getByCategoria);
faqRouter.get('/:id', FAQController.getById);
faqRouter.post('/', FAQController.add);
faqRouter.put('/:id', FAQController.update);
faqRouter.put('/inhabilitar/:id', FAQController.disable);
