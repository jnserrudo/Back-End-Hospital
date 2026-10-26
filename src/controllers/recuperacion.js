import { RecuperacionModel, MENSAJE_NEUTRO } from "../models/recuperacion.js";
import { handle } from "../utils/http.js";

export class RecuperacionController {
  // Siempre el mismo mensaje, exista o no la cuenta. El envío sigue en segundo plano.
  static solicitar = (req, res) => {
    const identificador = typeof req.body?.identificador === "string" ? req.body.identificador : "";
    if (!identificador.trim()) {
      const message = "Escribí tu usuario, tu email o tu DNI.";
      return res.status(400).json({ message, err: { message }, code: "DATO_FALTANTE" });
    }
    res.json({ ok: true, message: MENSAJE_NEUTRO });
    const ip = req.ip || req.socket?.remoteAddress;
    RecuperacionModel.solicitar(identificador, ip).catch((e) => console.error("[recuperar] Error:", e?.message || e));
  };

  static verificar = handle("No pudimos revisar el enlace", async (req, res) => {
    res.json(await RecuperacionModel.verificar(req.query.token));
  });

  static restablecer = handle("No pudimos guardar la contraseña nueva", async (req, res) => {
    const { token, newPassword } = req.body || {};
    res.json(await RecuperacionModel.restablecer(token, newPassword));
  });
}
