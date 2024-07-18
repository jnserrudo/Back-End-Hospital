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
              <a href="http://195.200.0.39/" class="btn">Iniciar Sesión</a>
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
