import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import validator from 'validator';
dotenv.config();

// Configuración de las credenciales de Gmail
const userGmail = 'nahugis6@gmail.com';
const passAppGmail = process.env.GMAIL_PASS;

// Configuración del transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userGmail,
    pass: passAppGmail,
  },
});

export const sendPasswordResetEmail = async (email, nuevaContrasena) => {
  
  try {
    if (!validator.isEmail(email)) {
      throw new Error('La dirección de correo electrónico no es válida');
    }

    const mailOptions = {
      from: userGmail,
      to: email,
      subject: 'Restablecimiento de Contraseña',
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
              <p>Su nueva contraseña es: <strong>${nuevaContrasena}</strong></p>
              <p>Utilice esta contraseña para iniciar sesión y restablecer su contraseña.</p>
              <a href="${process.env.PRODUCTION_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/" class="btn">Iniciar Sesión</a>
              <div class="footer">
                <p>&copy; 2024 Hospital Oñativia. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('info de enviar mail: ', info)
    if (info.rejected.length > 0) {
      console.log('Emails rejected: ' + info.rejected.join(', '));
      throw new Error('Se rechazo el envio');

    } else {
      console.log('Email sent: ' + info.response);
    }
    return info;
  } catch (error) {
    console.error('Error: ', error);
    return { err: error.message };
  }
};

export const sendAutoevaluacionEmail = async (profesionalEmail, pacienteNombre, tipoEvaluacion, respuestas, nombreEjercicio) => {
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
    console.log('info de enviar mail autoevaluacion: ', info);
    if (info.rejected.length > 0) {
      console.log('Emails rejected: ' + info.rejected.join(', '));
      throw new Error('Se rechazó el envío');
    }
    return info;
  } catch (error) {
    console.error('Error al enviar el correo de autoevaluación: ', error);
    return { err: error.message };
  }
};
