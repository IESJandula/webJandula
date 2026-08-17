/**
 * Redespliegue automático del frontend.
 *
 * ¿Por qué existe esto? El frontend es un sitio estático de Astro: las noticias
 * se piden a esta API *durante el build* y quedan incrustadas en el HTML. Sin
 * este aviso, un profesor publica una noticia, el panel dice "OK", y la web
 * pública sigue mostrando lo de antes hasta que alguien reconstruya a mano.
 *
 * Al llamar al webhook de despliegue de Dokploy, cada cambio que afecte a lo
 * que se ve en la web dispara una reconstrucción del frontend.
 *
 * Configuración (variables de entorno):
 *   DEPLOY_HOOK_URL      URL del webhook de despliegue del frontend en Dokploy.
 *                        Si está vacía, esto no hace nada (solo lo avisa en el log),
 *                        de modo que en local no se dispara ningún despliegue.
 *   DEPLOY_HOOK_METHOD   Método HTTP; por defecto POST.
 *   DEPLOY_DEBOUNCE_MS   Espera antes de disparar, en milisegundos (por defecto
 *                        60000). Sirve para que aprobar cinco noticias seguidas
 *                        genere UNA sola reconstrucción y no cinco.
 */

const URL_HOOK = process.env.DEPLOY_HOOK_URL || '';
const METODO = (process.env.DEPLOY_HOOK_METHOD || 'POST').toUpperCase();
const ESPERA_MS = parseInt(process.env.DEPLOY_DEBOUNCE_MS || '60000');

let temporizador = null;
let motivosPendientes = [];
let avisadoSinConfigurar = false;

async function dispararAhora(log) {
  const motivos = [...new Set(motivosPendientes)];
  motivosPendientes = [];
  temporizador = null;

  try {
    const controlador = new AbortController();
    const corte = setTimeout(() => controlador.abort(), 15000);

    const res = await fetch(URL_HOOK, {
      method: METODO,
      signal: controlador.signal,
    });
    clearTimeout(corte);

    if (res.ok) {
      log.info(
        { motivos, status: res.status },
        'Redespliegue del frontend solicitado correctamente'
      );
    } else {
      log.error(
        { motivos, status: res.status },
        'El webhook de despliegue respondió con error: la web publica NO se ha actualizado'
      );
    }
  } catch (err) {
    log.error(
      { motivos, err: err.message },
      'No se pudo avisar al webhook de despliegue: la web publica NO se ha actualizado'
    );
  }
}

/**
 * Pide una reconstrucción del frontend. No lanza excepciones nunca: si algo
 * falla, se registra en el log pero la petición del panel sigue su curso.
 *
 * @param {import('fastify').FastifyBaseLogger} log
 * @param {string} motivo  Texto corto para el log, p. ej. "noticia 12 aprobada".
 */
export function solicitarRedespliegue(log, motivo) {
  if (!URL_HOOK) {
    if (!avisadoSinConfigurar) {
      log.warn(
        'DEPLOY_HOOK_URL no está configurada: los cambios en noticias NO se publicarán ' +
          'en la web hasta que se reconstruya el frontend a mano.'
      );
      avisadoSinConfigurar = true;
    }
    return;
  }

  motivosPendientes.push(motivo);
  log.info({ motivo, esperaMs: ESPERA_MS }, 'Redespliegue del frontend programado');

  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    dispararAhora(log).catch(() => {});
  }, ESPERA_MS);
  // No mantener el proceso vivo solo por este temporizador
  if (typeof temporizador.unref === 'function') temporizador.unref();
}
