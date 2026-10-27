/**
 * Avisos por correo del panel de noticias.
 *
 * Qué avisa y a quién:
 *
 * | Cuándo                                   | A quién                    |
 * |------------------------------------------|----------------------------|
 * | Un profesor guarda una noticia pendiente | Los admin (ADMIN_EMAILS)   |
 * | Un profesor corrige una rechazada        | Los admin (ADMIN_EMAILS)   |
 *
 * La cuenta desde la que sale el correo es la de servicio del centro, la misma
 * que usan agenda y guardias (ver `services/mail.js`).
 *
 * Igual que en `redespliegue.js`: que el correo falle no puede romper la
 * operación, que ya está terminada cuando llega aquí. Por eso todo aviso se
 * lanza en segundo plano y nunca espera la respuesta.
 */

import { enviarCorreo, mailConfigurado } from './mail.js';

/** A quién avisa el backend, del .env (mismos emails que en guardias). */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

/** Para los enlaces del correo. Es el origen del panel, ya configurado. */
const PANEL_URL = (process.env.PANEL_URL ?? 'http://localhost:5173').replace(
  /\/$/,
  ''
);

/**
 * Lanza un aviso en segundo plano. Si el SMTP no está configurado (local, o
 * todavía sin variables en Dokploy), simplemente no hace nada: la noticia ya
 * está guardada y no hay nada que avisar.
 *
 * @param {import('fastify').FastifyBaseLogger} log
 * @param {string} que    Texto corto para el log, p. ej. "noticia pendiente 12".
 * @param {object} correo Datos para `enviarCorreo`.
 */
function avisar(log, que, correo) {
  if (!mailConfigurado() || ADMIN_EMAILS.length === 0) return;

  log.info({ que }, 'Enviando aviso por correo');
  enviarCorreo(correo).catch((err) =>
    log.warn({ que, err: err.message }, 'No se pudo enviar el aviso por correo')
  );
}

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Recorta el cuerpo a un fragmento razonable para el correo. */
function fragmento(texto, max = 300) {
  const limpio = String(texto).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return limpio.length > max ? `${limpio.slice(0, max)}…` : limpio;
}

/**
 * Aviso de "hay una noticia pendiente de revisión". Sirve para los dos casos
 * que dejan una noticia en pendiente: recién creada por un profesor y
 * reenviada tras corregir una rechazada.
 *
 * @param {import('fastify').FastifyBaseLogger} log
 * @param {object} noticia  Fila de Prisma ya guardada.
 * @param {object} [opciones]
 * @param {boolean} [opciones.reenviada] true si vuelve a pendiente tras corrección.
 */
export function avisarNoticiaPendiente(log, noticia, { reenviada = false } = {}) {
  if (ADMIN_EMAILS.length === 0) return;

  const titulo = reenviada
    ? 'Noticia corregida y pendiente de revisión'
    : 'Nueva noticia pendiente de revisión';
  const intro = reenviada
    ? `<strong>${escapar(noticia.autor)}</strong> ha corregido su noticia `
    : `<strong>${escapar(noticia.autor)}</strong> ha enviado una noticia nueva `;
  const asunto = reenviada
    ? `[Noticias] Corregida y pendiente: ${noticia.titulo}`
    : `[Noticias] Nueva pendiente: ${noticia.titulo}`;

  avisar(log, `noticia pendiente ${noticia.id}`, {
    para: ADMIN_EMAILS,
    asunto,
    // Responder llega al autor, que es quien puede aclarar lo que sea.
    responderA: noticia.autorEmail,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#0f172a;line-height:1.5">
        <h2 style="margin:0 0 16px;font-size:20px">${titulo}</h2>
        <p style="margin:0 0 16px">
          ${intro}y está pendiente de que la apruebes o la rechaces.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px">
          <tr>
            <td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap">Título</td>
            <td style="padding:6px 0;font-weight:bold">${escapar(noticia.titulo)}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap">Autor</td>
            <td style="padding:6px 0">${escapar(noticia.autor)} (${escapar(noticia.autorEmail)})</td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap">Categoría</td>
            <td style="padding:6px 0">${escapar(noticia.categoria)}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">Cuerpo</td>
            <td style="padding:6px 0">${escapar(fragmento(noticia.cuerpo))}</td>
          </tr>
        </table>
        <p style="margin:0 0 20px">
          <a href="${PANEL_URL}/admin/noticias"
             style="display:inline-block;background:#0e5a8a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold">
            Revisar en el panel
          </a>
        </p>
        <p style="margin:0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;padding-top:12px">
          Panel de noticias del IES Jándula. Este aviso es automático: puedes
          responderlo y le llegará al autor de la noticia.
        </p>
      </div>`,
  });
}
