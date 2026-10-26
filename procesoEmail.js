import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import validator from 'validator';
dotenv.config();

// Configuración de las credenciales de Gmail
const userGmail = process.env.GMAIL_USER || 'nahugis6@gmail.com';
const passAppGmail = process.env.GMAIL_PASS;

// Configuración del transporter de Nodemailer
// Timeouts cortos: si el servidor de correo no responde, no dejamos la pantalla
// esperando 2 minutos (el valor por defecto de nodemailer).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userGmail,
    pass: passAppGmail,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Modo prueba (solo para entornos de test): no envía emails reales.
const modoPruebaEmail = () => process.env.EMAIL_MODO_PRUEBA === "true";

export const sendPasswordResetEmail = async (email, nuevaContrasena) => {
  if (modoPruebaEmail()) {
    console.log(`[email:modo-prueba] Se simuló el envío de la contraseña temporal a ${email}`);
    return { messageId: "modo-prueba" };
  }

  try {
    if (!validator.isEmail(email)) {
      throw new Error('La dirección de correo electrónico no es válida');
    }

    const mailOptions = {
      from: userGmail,
      to: email,
      subject: 'Tu contraseña temporal del Hospital Oñativia',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
              }
              h1 {
                color: #333;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 12px;
                color: #777;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #007BFF;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Hospital Oñativia</h2>
              <p>Tu contraseña temporal es: <strong>${nuevaContrasena}</strong></p>
              <p>Usala para ingresar a la app: apenas entres, te va a pedir que crees una contraseña nueva que solo sepas vos.</p>
              <p style="font-size:14px;color:#777;">Si no pediste este cambio, avisale al equipo del hospital.</p>
              <a href="${process.env.PRODUCTION_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/" class="btn">Ingresar a la app</a>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Hospital Oñativia. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('info de enviar mail: ', info)
    if (info.rejected.length > 0) {
      // console.log('Emails rejected: ' + info.rejected.join(', '));
      throw new Error('Se rechazo el envio');

    } else {
      // console.log('Email sent: ' + info.response);
    }
    return info;
  } catch (error) {
    console.error('Error: ', error);
    return { err: error.message };
  }
};

export const sendAutoevaluacionEmail = async (profesionalEmail, pacienteNombre, tipoEvaluacion, respuestas, nombreEjercicio) => {
  if (modoPruebaEmail()) {
    console.log(`[email:modo-prueba] Se simuló el aviso de autoevaluación a ${profesionalEmail}`);
    return { messageId: "modo-prueba" };
  }
  try {
    if (!validator.isEmail(profesionalEmail)) {
      throw new Error('La dirección de correo electrónico del profesional no es válida');
    }

    const formatRespuestas = (resp) => {
      try {
        const parsed = typeof resp === 'string' ? JSON.parse(resp) : resp;
        return Object.entries(parsed)
          .map(([key, value]) => {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
            return `<tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">${label}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${displayValue}</td>
            </tr>`;
          })
          .join('');
      } catch (e) {
        return `<tr><td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee;">${resp}</td></tr>`;
      }
    };

    const mailOptions = {
      from: userGmail,
      to: profesionalEmail,
      subject: `Nueva Autoevaluación - Paciente: ${pacienteNombre}`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
              .container { width: 100%; max-width: 600px; margin: 20px auto; padding: 25px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
              h2 { color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px; margin-top: 0; }
              .info-block { background-color: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #0284c7; margin-bottom: 20px; }
              .info-block p { margin: 5px 0; font-size: 14px; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reporte de Autoevaluación</h2>
              <div class="info-block">
                <p><strong>Paciente:</strong> ${pacienteNombre}</p>
                <p><strong>Tipo de Evaluación:</strong> ${tipoEvaluacion === 'general' ? 'General (Actividad Física / Deportes)' : 'Específica por Ejercicio'}</p>
                ${nombreEjercicio ? `<p><strong>Ejercicio Evaluado:</strong> ${nombreEjercicio}</p>` : ''}
                <p><strong>Fecha de Envío:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>A continuación se detallan las respuestas registradas por el paciente:</p>
              <table>
                ${formatRespuestas(respuestas)}
              </table>
              <div class="footer">
                <p>&copy; 2026 Hospital Oñativia. Reporte clínico automático.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('info de enviar mail autoevaluacion: ', info);
    if (info.rejected.length > 0) {
      // console.log('Emails rejected: ' + info.rejected.join(', '));
      throw new Error('Se rechazó el envío');
    }
    return info;
  } catch (error) {
    console.error('Error al enviar el correo de autoevaluación: ', error);
    return { err: error.message };
  }
};

const escaparHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Aviso al paciente: el equipo revisó su autoevaluación y le dejó una devolución.
export const sendDevolucionEmail = async (email, { pacienteNombre, profesionalNombre, devolucion, tipoTexto, fechaTexto }) => {
  if (modoPruebaEmail()) {
    console.log(`[email:modo-prueba] Se simuló el aviso de devolución a ${email}`);
    return { messageId: "modo-prueba" };
  }
  try {
    if (!validator.isEmail(email)) throw new Error("La dirección de correo electrónico del paciente no es válida");
    const url = process.env.PRODUCTION_URL || process.env.FRONTEND_URL || "http://localhost:3000";
    const info = await transporter.sendMail({
      from: userGmail,
      to: email,
      subject: "Tu profesional revisó tu autoevaluación",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:24px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:10px; padding:24px; color:#1f2937;">
            <h2 style="color:#0369a1; margin-top:0;">Hospital Dr. Arturo Oñativia</h2>
            <p>Hola ${escaparHtml(pacienteNombre)}:</p>
            <p><strong>${escaparHtml(profesionalNombre)}</strong> revisó tu ${escaparHtml(tipoTexto)} del ${escaparHtml(fechaTexto)} y te dejó esta devolución:</p>
            <blockquote style="margin:16px 0; padding:12px 16px; background:#f0f9ff; border-left:4px solid #0369a1; border-radius:6px; white-space:pre-line;">${escaparHtml(devolucion)}</blockquote>
            <p>También la podés ver en la app, en <strong>Ejercitarse › Mis autoevaluaciones</strong>.</p>
            <p style="font-size:14px; color:#6b7280;">Si tenés dolor de pecho, falta de aire o mareos fuertes, no esperes: andá a la guardia o llamá al 107.</p>
            <a href="${escaparHtml(url)}/" style="display:inline-block; margin-top:8px; padding:10px 18px; background:#0369a1; color:#fff; text-decoration:none; border-radius:6px;">Abrir la app</a>
            <p style="margin-top:24px; font-size:12px; color:#9ca3af;">Este es un mensaje automático; no hace falta que lo respondas.</p>
          </div>
        </div>`,
    });
    if (info.rejected?.length > 0) throw new Error("Se rechazó el envío");
    return info;
  } catch (error) {
    console.error("[email] Error al enviar la devolución:", error?.message || error);
    return { err: error.message };
  }
};

// Dirección pública del front (para armar enlaces). En el VPS: FRONT_URL=https://onativia.duckdns.org
export const urlFront = () => String(process.env.FRONT_URL || "http://localhost:3000").trim().replace(/\/+$/, "");

// "¿Olvidaste tu contraseña?": enlace de un solo uso para crear una contraseña nueva.
export const sendRecuperacionEmail = async (email, { nombre, usuario, enlace, minutos }) => {
  if (modoPruebaEmail()) {
    // Solo en modo prueba (entornos de test) dejamos el enlace en el log para poder probar el flujo.
    console.log(`[email:modo-prueba] Se simuló el email de recuperación a ${email}. Enlace: ${enlace}`);
    return { messageId: "modo-prueba" };
  }
  try {
    if (!validator.isEmail(email)) throw new Error("La dirección de correo electrónico no es válida");
    const info = await transporter.sendMail({
      from: userGmail,
      to: email,
      subject: "Creá tu nueva contraseña del Hospital Oñativia",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:24px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:10px; padding:24px; color:#1f2937;">
            <h2 style="color:#0369a1; margin-top:0;">Hospital Dr. Arturo Oñativia</h2>
            <p>Hola ${escaparHtml(nombre || "")}:</p>
            <p>Recibimos un pedido para restablecer la contraseña de tu cuenta. Tu usuario es <strong>${escaparHtml(usuario)}</strong>.</p>
            <p>Tocá el botón para crear una contraseña nueva. El enlace sirve <strong>una sola vez</strong> y vence en <strong>${minutos} minutos</strong>.</p>
            <p style="text-align:center; margin:24px 0;">
              <a href="${escaparHtml(enlace)}" style="display:inline-block; padding:12px 22px; background:#0369a1; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Crear contraseña nueva</a>
            </p>
            <p style="font-size:13px; color:#6b7280;">Si el botón no funciona, copiá y pegá esta dirección en el navegador:<br><span style="word-break:break-all;">${escaparHtml(enlace)}</span></p>
            <p style="font-size:14px; color:#6b7280;">Si no fuiste vos, ignorá este email: tu contraseña actual sigue funcionando.</p>
            <p style="margin-top:24px; font-size:12px; color:#9ca3af;">Este es un mensaje automático; no hace falta que lo respondas.</p>
          </div>
        </div>`,
    });
    if (info.rejected?.length > 0) throw new Error("Se rechazó el envío");
    return info;
  } catch (error) {
    console.error("[email] Error al enviar la recuperación:", error?.message || error);
    return { err: error.message };
  }
};
