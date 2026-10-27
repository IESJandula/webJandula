/**
 * Envío de correo por SMTP.
 *
 * Patrón tomado de `vegaies/libs/mail` (MailService de NestJS), adaptado a este
 * backend en JavaScript plano. Igual que allí, la cuenta desde la que sale todo
 * es una sola y se configura con variables de entorno, compartida con el resto
 * de aplicaciones del centro:
 *
 *   SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM
 *
 * ## Que el correo falle no puede romper nada
 *
 * Los avisos acompañan a una operación ya terminada —una noticia guardada en
 * pendiente—, así que `enviar` no lanza nunca: registra el fallo y devuelve
 * `false`. Un SMTP caído no puede deshacer lo que ya está escrito en la base.
 *
 * ## Sin configurar, no envía y lo dice
 *
 * Sin `SMTP_HOST` el envío es un no-op con aviso en el log, que es lo que
 * permite levantar el entorno local sin servidor de correo.
 */

import { createTransport } from 'nodemailer';

const remitente = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? '';

const transporter = process.env.SMTP_HOST
  ? createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

// No hay remitente de respaldo a propósito (misma lección que en vegaies): una
// dirección inventada la rebota cualquier servidor, y peor es "enviado" falso
// que no enviar y que se vea por qué.
if (transporter && !remitente) {
  console.error(
    '[mail] Hay SMTP_HOST pero no SMTP_FROM (ni SMTP_USER): no se enviará ningún ' +
      'correo. Pon la dirección desde la que escribe la plataforma.'
  );
}

/** ¿Se puede enviar? Para no construir el HTML en balde. */
export function mailConfigurado() {
  return transporter !== null && remitente !== '';
}

/**
 * Envía un correo. Nunca lanza: devuelve `true` si ha salido.
 *
 * @param {object} correo
 * @param {string[]} correo.para       Destinatarios; se limpian y se quitan repetidos.
 * @param {string} correo.asunto
 * @param {string} correo.html
 * @param {string} [correo.responderA] A quién llega el "Responder" del aviso.
 *   El remitente es una cuenta de servicio que nadie lee: sin esto, contestar
 *   a un aviso es escribir al vacío.
 */
export async function enviarCorreo({ para, asunto, html, responderA }) {
  if (!mailConfigurado()) {
    console.warn(`[mail] SMTP no configurado — no se envía «${asunto}».`);
    return false;
  }

  const destinatarios = [...new Set(para.map((e) => e.trim()).filter(Boolean))];
  if (destinatarios.length === 0) {
    console.warn(`[mail] Sin destinatarios — no se envía «${asunto}».`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: remitente,
      to: destinatarios,
      subject: asunto,
      html,
      ...(responderA ? { replyTo: responderA } : {}),
    });
    console.log(`[mail] Correo enviado a ${destinatarios.join(', ')}: ${asunto}`);
    return true;
  } catch (err) {
    console.error(`[mail] Error enviando «${asunto}»: ${err.message}`);
    return false;
  }
}
