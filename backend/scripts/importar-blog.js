/**
 * Importa noticias del blog antiguo (WordPress en blogsaverroes) a la web nueva.
 *
 * Se ejecuta DENTRO del contenedor del backend y escribe directamente con
 * Prisma, para no tener que manejar credenciales de administrador.
 *
 *   # Ver qué haría, sin tocar nada (por defecto):
 *   node scripts/importar-blog.js
 *
 *   # Importar de verdad:
 *   node scripts/importar-blog.js --aplicar
 *
 * Qué hace:
 *  - Trae las N entradas más recientes del blog con su fecha original.
 *  - Descarga la imagen destacada y las del cuerpo a TU volumen de uploads,
 *    para que las noticias no dependan de que el blog antiguo siga en pie.
 *  - Traduce las categorías del blog a las de la web.
 *  - Publica solo las seleccionadas; el resto quedan en estado "pendiente"
 *    para revisarlas desde el panel.
 *  - Es idempotente: si una noticia ya existe (mismo título), la salta.
 */

import { prisma } from '../src/plugins/prisma.js';
import { saveImage } from '../src/services/upload.js';

const BLOG = 'https://blogsaverroes.juntadeandalucia.es/iesjandula/wp-json/wp/v2';
const CUANTAS = 25;
const APLICAR = process.argv.includes('--aplicar');

/** Entradas que salen publicadas. El resto entran como "pendiente". */
const IDS_A_PUBLICAR = new Set([
  2442, // Proyectos Etwinning Curso 25-26
  2431, // Reconocimientos Etwinning 2025
  2426, // Calendario Exámenes Septiembre 1º Bchto
  2419, // Libros de Texto Curso 2026/27
  2409, // Manuel Barbero, Premio Jaén
  2402, // Fallo del XXIV Concurso Matemático Thales
  2363, // IV Jornadas Nuevas Tecnologías y Empleo
  2303, // Andújar destina 7.000 € al Proyecto Eco-Jándula
  2323, // Prácticas Erasmus Talentum VI
  2308, // Prácticas Erasmus Jaén+ VIII
  2246, // Recepción de alumnado francés
]);

/** Categorías del blog -> categorías de la web, por orden de prioridad. */
const MAPA_CATEGORIAS = [
  ['Proyectos', ['erasmus', 'acredita', 'talentum', 'jaen+', 'vehiculolince', 'lince', 'thales', 'matematicas', 'etwinning']],
  ['Formación', ['formacion profesional', 'informatica', 'economia', 'empleabilidad']],
  ['Deportes', ['educacion fisica', 'deporte']],
  ['Cultura', ['biblioteca', 'lengua', 'musica', 'plastica', 'cultura clasica', 'latin', 'griego']],
];

function sinTildes(texto) {
  // NFD separa la letra de su tilde; el rango ̀-ͯ son esas tildes.
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function traducirCategoria(categoriasBlog) {
  const normalizadas = categoriasBlog.map(sinTildes);
  for (const [destino, claves] of MAPA_CATEGORIAS) {
    if (normalizadas.some((c) => claves.some((k) => c.includes(k)))) return destino;
  }
  return 'Centro';
}

function decodificarEntidades(texto) {
  const entidades = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'",
    '&#8217;': '’', '&#8216;': '‘', '&#8220;': '“', '&#8221;': '”',
    '&#8211;': '–', '&#8212;': '—', '&hellip;': '…', '&nbsp;': ' ',
  };
  return texto.replace(/&[#a-zA-Z0-9]+;/g, (e) => entidades[e] ?? e);
}

function aTextoPlano(html) {
  return decodificarEntidades(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

async function descargar(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Descarga una imagen del blog y la guarda en el volumen de uploads.
 * Devuelve la ruta relativa (/uploads/...) o null si no se pudo.
 */
async function traerImagen(url, registro) {
  try {
    const datos = await descargar(url);
    const { path } = await saveImage(datos, 'blog', 'noticias');
    registro.push(`      imagen guardada: ${path}`);
    return path;
  } catch (err) {
    registro.push(`      NO se pudo traer ${url.slice(0, 70)}: ${err.message}`);
    return null;
  }
}

/**
 * Limpia el HTML del cuerpo y sustituye las imágenes remotas por copias locales.
 *
 * Varias entradas del blog son publicaciones de Facebook pegadas tal cual, y
 * traen basura que hay que quitar: capas de <div>/<span> con clases ofuscadas,
 * y los emojis convertidos en imágenes alojadas en Facebook.
 */
async function prepararCuerpo(htmlOriginal, registro) {
  let html = htmlOriginal
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Los iframes (YouTube y similares) cargan contenido de terceros sin
  // consentimiento: se sustituyen por un enlace.
  html = html.replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/gi,
    (_, src) => `<p><a href="${src}" target="_blank" rel="noopener noreferrer">Ver contenido enlazado</a></p>`);

  // Los emojis venían como imágenes de Facebook. Se recupera el emoji real,
  // que está en el atributo alt, y así no se descargan 7 iconos por entrada.
  let emojis = 0;
  html = html.replace(/<img[^>]*>/gi, (etiqueta) => {
    const esEmoji = /emoji|\/emoji\.php/i.test(etiqueta);
    const anchura = parseInt(etiqueta.match(/width=["']?(\d+)/i)?.[1] ?? '999');
    if (!esEmoji && anchura > 24) return etiqueta;
    emojis++;
    return etiqueta.match(/alt=["']([^"']*)["']/i)?.[1] ?? '';
  });
  if (emojis) registro.push(`      ${emojis} emojis recuperados como texto (no se descargan)`);

  // Quita las capas y los atributos de presentación ajenos (clases de Facebook,
  // estilos en línea, ids...). La web ya da su propio estilo al cuerpo.
  html = html
    .replace(/<\/?(?:div|span|section)[^>]*>/gi, '')
    .replace(/\s(?:class|style|id|dir|srcset|sizes|data-[\w-]+)=["'][^"']*["']/gi, '');

  // Si no quedó ningún párrafo (típico de las publicaciones pegadas de
  // Facebook), se reconstruyen a partir de los saltos de línea.
  if (!/<(p|h[1-6]|ul|ol|blockquote)[ >]/i.test(html)) {
    const trozos = html
      .split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i)
      .map((t) => t.trim())
      .filter(Boolean);
    if (trozos.length) {
      html = trozos.map((t) => `<p>${t}</p>`).join('');
      registro.push(`      cuerpo sin párrafos: reconstruidos ${trozos.length}`);
    }
  }

  const urls = [...new Set([...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
  const locales = [];
  for (const url of urls) {
    if (!url.startsWith('http')) continue;
    const local = await traerImagen(url, registro);
    if (local) {
      html = html.split(url).join(local);
      locales.push(local);
    } else {
      // Varias fotos del blog estaban alojadas en Facebook y ya han caducado
      // (dan 403). Si no se pueden traer, se quita la etiqueta: dejarla
      // mostraría el icono de imagen rota en la web.
      const antes = html;
      html = html.replace(new RegExp(`<img[^>]*${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`, 'gi'), '');
      if (html !== antes) registro.push('      imagen no disponible: se retira del cuerpo');
    }
  }

  return {
    html: html.replace(/\s{2,}/g, ' ').trim(),
    imagenes: locales,
  };
}

async function main() {
  console.log(APLICAR
    ? '\n>>> MODO REAL: se van a escribir noticias en la base de datos.\n'
    : '\n>>> SIMULACION: no se escribe nada. Añade --aplicar para importar de verdad.\n');

  const res = await fetch(`${BLOG}/posts?per_page=${CUANTAS}&_embed=1`, {
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`El blog respondió HTTP ${res.status}`);
  const entradas = await res.json();

  const correoAutor = (process.env.ADMIN_EMAILS || 'web@iesjandula.es').split(',')[0].trim();
  let publicadas = 0, pendientes = 0, saltadas = 0, fallidas = 0;

  for (const entrada of entradas) {
    const registro = [];
    const titulo = decodificarEntidades(entrada.title.rendered.replace(/<[^>]*>/g, '')).trim();
    const estado = IDS_A_PUBLICAR.has(entrada.id) ? 'publicada' : 'pendiente';

    try {
      const yaExiste = await prisma.noticia.findFirst({ where: { titulo } });
      if (yaExiste) {
        console.log(`  [SALTADA]  ${titulo.slice(0, 60)}\n      ya existe (id ${yaExiste.id})`);
        saltadas++;
        continue;
      }

      const categorias = (entrada._embedded?.['wp:term'] ?? [])
        .flat()
        .filter((t) => t?.taxonomy === 'category')
        .map((t) => t.name);
      const categoria = traducirCategoria(categorias);

      const subtitulo = aTextoPlano(entrada.excerpt?.rendered ?? '').slice(0, 180);
      const urlDestacada = entrada._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;

      let portada = null;
      let cuerpo = '';
      if (APLICAR) {
        if (urlDestacada) portada = await traerImagen(urlDestacada, registro);
        const preparado = await prepararCuerpo(entrada.content.rendered, registro);
        cuerpo = preparado.html;
        if (!cuerpo) cuerpo = `<p>${subtitulo || titulo}</p>`;

        // Si la entrada no traía imagen destacada, sirve la primera del cuerpo:
        // así la tarjeta de la noticia no sale con la imagen genérica.
        if (!portada && preparado.imagenes.length > 0) {
          portada = preparado.imagenes[0];
          registro.push('      sin imagen destacada: se usa la primera del cuerpo');
        }

        await prisma.noticia.create({
          data: {
            titulo,
            subtitulo: subtitulo || null,
            cuerpo,
            categoria,
            portada,
            galeria: '[]',
            fecha: new Date(entrada.date),
            autor: 'IES Jándula',
            autorEmail: correoAutor,
            estado,
          },
        });
      }

      const marca = estado === 'publicada' ? '[PUBLICA] ' : '[pendiente]';
      console.log(`  ${marca} ${entrada.date.slice(0, 10)}  ${categoria.padEnd(10)} ${titulo.slice(0, 52)}`);
      registro.forEach((l) => console.log(l));
      estado === 'publicada' ? publicadas++ : pendientes++;
    } catch (err) {
      console.error(`  [ERROR]    ${titulo.slice(0, 60)}\n      ${err.message}`);
      fallidas++;
    }
  }

  console.log(`\n  Publicadas: ${publicadas}   Pendientes: ${pendientes}   Saltadas: ${saltadas}   Con error: ${fallidas}`);

  if (!APLICAR) {
    console.log('  (simulación: no se ha escrito nada ni se han descargado imágenes)');
    return;
  }

  // El script escribe directamente con Prisma, sin pasar por la API, así que
  // no se dispara el aviso de redespliegue que sí hace el panel. Se avisa aquí,
  // o las noticias importadas no aparecerían hasta la siguiente reconstrucción.
  if (publicadas === 0) return;

  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) {
    console.log('\n  DEPLOY_HOOK_URL no está configurada: lanza tú un despliegue');
    console.log('  desde Dokploy para que las noticias aparezcan en la web.');
    return;
  }

  try {
    const res = await fetch(hook, {
      method: process.env.DEPLOY_HOOK_METHOD || 'POST',
      signal: AbortSignal.timeout(20000),
    });
    console.log(res.ok
      ? '\n  Redespliegue solicitado. En unos minutos la web mostrará las noticias.'
      : `\n  El webhook respondió ${res.status}: lanza el despliegue a mano desde Dokploy.`);
  } catch (err) {
    console.log(`\n  No se pudo avisar al webhook (${err.message}). Lanza el despliegue a mano.`);
  }
}

main()
  .catch((err) => {
    console.error('\nLa importación se detuvo:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
