/**
 * Importa noticias del blog antiguo (WordPress en blogsaverroes) a la web nueva.
 *
 * ¿Por qué en dos fases? El servidor de la Junta no acepta conexiones desde la
 * IP del VPS: desde el contenedor, blogsaverroes.juntadeandalucia.es:443 agota
 * el tiempo de espera (UND_ERR_CONNECT_TIMEOUT), aunque el contenedor sí tiene
 * salida a internet. Así que la descarga se hace desde una máquina con acceso
 * (un PC normal) y el resultado viaja en el repositorio.
 *
 *   FASE 1 — en tu PC, con acceso al blog:
 *     node scripts/importar-blog.js --descargar
 *   Deja el contenido en backend/importacion/ (manifiesto + imágenes ya
 *   convertidas a webp). Se commitea y se despliega.
 *
 *   FASE 2 — dentro del contenedor del backend:
 *     node scripts/importar-blog.js --aplicar
 *   Lee backend/importacion/, copia las imágenes al volumen de uploads, crea
 *   las noticias y avisa al webhook de despliegue.
 *
 *   Sin argumentos hace una simulación de la fase 1 (no escribe nada).
 *
 * Es idempotente: en la fase 2 se saltan las noticias cuyo título ya exista.
 */

import { readFile, writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { prisma } from '../src/plugins/prisma.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CARPETA = resolve(AQUI, '..', 'importacion');
const MANIFIESTO = join(CARPETA, 'manifiesto.json');
const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR || './uploads');

const BLOG = 'https://blogsaverroes.juntadeandalucia.es/iesjandula/wp-json/wp/v2';
const CUANTAS = 25;
const MAX_ANCHURA = 1920;

const DESCARGAR = process.argv.includes('--descargar');
const APLICAR = process.argv.includes('--aplicar');
// Rehace el cuerpo y la portada de las noticias que YA existen, a partir del
// manifiesto. Sirve para recuperar una noticia que se estropeo al editarla.
const RESTAURAR = process.argv.includes('--restaurar');

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

// ─────────────────────────── FASE 1: DESCARGA ───────────────────────────

/**
 * Descarga una imagen, la convierte a webp y la guarda en importacion/imagenes.
 * Devuelve { ruta, fichero } con la ruta definitiva que tendrá en la web.
 */
async function traerImagen(url, indice, registro) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const datos = Buffer.from(await res.arrayBuffer());

    const webp = await sharp(datos)
      .resize({ width: MAX_ANCHURA, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const ahora = new Date();
    const carpetaFecha = `${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    const nombre = `blog-${indice}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const ruta = `/uploads/noticias/${carpetaFecha}/${nombre}`;

    await mkdir(join(CARPETA, 'imagenes'), { recursive: true });
    await writeFile(join(CARPETA, 'imagenes', nombre), webp);

    registro.push(`      imagen ${nombre} (${(webp.length / 1024).toFixed(0)} KB)`);
    return { ruta, fichero: `imagenes/${nombre}` };
  } catch (err) {
    registro.push(`      NO disponible: ${url.slice(0, 62)} (${err.message})`);
    return null;
  }
}

/**
 * Limpia el HTML del cuerpo y sustituye las imágenes remotas por las locales.
 *
 * Varias entradas son publicaciones de Facebook pegadas tal cual, y traen
 * basura: capas de div/span con clases ofuscadas, y los emojis convertidos en
 * imágenes alojadas en Facebook.
 */
async function prepararCuerpo(htmlOriginal, indice, imagenes, registro) {
  let html = htmlOriginal
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Los iframes cargan terceros sin consentimiento: se dejan como enlace.
  html = html.replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/gi,
    (_, src) => `<p><a href="${src}" target="_blank" rel="noopener noreferrer">Ver contenido enlazado</a></p>`);

  // Emojis que venían como imagen de Facebook: se recupera el emoji del alt.
  let emojis = 0;
  html = html.replace(/<img[^>]*>/gi, (etiqueta) => {
    const esEmoji = /emoji/i.test(etiqueta);
    const anchura = parseInt(etiqueta.match(/width=["']?(\d+)/i)?.[1] ?? '999');
    if (!esEmoji && anchura > 24) return etiqueta;
    emojis++;
    return etiqueta.match(/alt=["']([^"']*)["']/i)?.[1] ?? '';
  });
  if (emojis) registro.push(`      ${emojis} emojis recuperados como texto`);

  // En las tablas, el color de fondo y la alineacion SI son contenido: los
  // horarios de examenes del centro los usan para distinguir bloques. Se
  // apartan antes de la limpieza general y se devuelven despues.
  html = html.replace(/<(td|th|tr)([^>]*)>/gi, (etiqueta, nombre, atributos) => {
    const estilo = atributos.match(/style=["']([^"']*)["']/i)?.[1] ?? '';
    const conservar = estilo
      .split(';')
      .map((d) => d.trim())
      .filter((d) => /^(background-color|text-align)\s*:/i.test(d));
    const resto = atributos.replace(/\s*style=["'][^"']*["']/i, '');
    return conservar.length
      ? `<${nombre}${resto} estiloconservado="${conservar.join('; ')}">`
      : `<${nombre}${resto}>`;
  });

  // Fuera capas y atributos de presentación ajenos: la web pone su estilo.
  html = html
    .replace(/<\/?(?:div|span|section)[^>]*>/gi, '')
    .replace(/\s(?:class|style|id|dir|srcset|sizes|data-[\w-]+)=["'][^"']*["']/gi, '');

  // Devolver el estilo apartado de las celdas.
  html = html.replace(/estiloconservado="([^"]*)"/gi, 'style="$1"');

  // Si no quedó ningún párrafo (típico de lo pegado de Facebook), se rehacen.
  if (!/<(p|h[1-6]|ul|ol|blockquote)[ >]/i.test(html)) {
    const trozos = html.split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i).map((t) => t.trim()).filter(Boolean);
    if (trozos.length) {
      html = trozos.map((t) => `<p>${t}</p>`).join('');
      registro.push(`      cuerpo sin párrafos: reconstruidos ${trozos.length}`);
    }
  }

  const urls = [...new Set([...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
  const rutas = [];
  for (const url of urls) {
    if (!url.startsWith('http')) continue;
    const guardada = await traerImagen(url, indice, registro);
    if (guardada) {
      html = html.split(url).join(guardada.ruta);
      imagenes[guardada.ruta] = guardada.fichero;
      rutas.push(guardada.ruta);
    } else {
      // Las fotos alojadas en Facebook ya han caducado (403). Si no se pueden
      // traer se quita la etiqueta: dejarla mostraría una imagen rota.
      const escapada = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const antes = html;
      html = html.replace(new RegExp(`<img[^>]*${escapada}[^>]*>`, 'gi'), '');
      if (html !== antes) registro.push('      imagen caducada: se retira del cuerpo');
    }
  }

  return { html: html.replace(/\s{2,}/g, ' ').trim(), rutas };
}

async function fase1Descargar(simulacion) {
  console.log(simulacion
    ? '\n>>> SIMULACION de la descarga: no se escribe nada.\n'
    : '\n>>> FASE 1: descargando del blog antiguo a backend/importacion/\n');

  const res = await fetch(`${BLOG}/posts?per_page=${CUANTAS}&_embed=1`, {
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`El blog respondió HTTP ${res.status}`);
  const entradas = await res.json();

  const imagenes = {};
  const noticias = [];

  for (const [i, entrada] of entradas.entries()) {
    const registro = [];
    const titulo = decodificarEntidades(entrada.title.rendered.replace(/<[^>]*>/g, '')).trim();
    const estado = IDS_A_PUBLICAR.has(entrada.id) ? 'publicada' : 'pendiente';
    const categorias = (entrada._embedded?.['wp:term'] ?? []).flat()
      .filter((t) => t?.taxonomy === 'category').map((t) => t.name);
    const categoria = traducirCategoria(categorias);
    const subtitulo = aTextoPlano(entrada.excerpt?.rendered ?? '').slice(0, 180);

    let portada = null;
    let cuerpo = '';

    if (!simulacion) {
      const urlDestacada = entrada._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
      if (urlDestacada) {
        const dest = await traerImagen(urlDestacada, i, registro);
        if (dest) {
          portada = dest.ruta;
          imagenes[dest.ruta] = dest.fichero;
        }
      }

      const preparado = await prepararCuerpo(entrada.content.rendered, i, imagenes, registro);
      cuerpo = preparado.html || `<p>${subtitulo || titulo}</p>`;

      // Sin imagen destacada, sirve la primera del cuerpo: así la tarjeta no
      // sale con la imagen genérica del centro.
      if (!portada && preparado.rutas.length > 0) {
        portada = preparado.rutas[0];
        registro.push('      sin destacada: se usa la primera del cuerpo');
      }

      noticias.push({ titulo, subtitulo: subtitulo || null, cuerpo, categoria, portada, fecha: entrada.date, estado });
    }

    console.log(`  ${estado === 'publicada' ? '[PUBLICA] ' : '[pendiente]'} ${entrada.date.slice(0, 10)}  ${categoria.padEnd(10)} ${titulo.slice(0, 50)}`);
    registro.forEach((l) => console.log(l));
  }

  if (simulacion) {
    console.log('\n  (simulación: añade --descargar para bajar el contenido de verdad)');
    return;
  }

  await mkdir(CARPETA, { recursive: true });
  await writeFile(MANIFIESTO, JSON.stringify({
    generado: new Date().toISOString(),
    origen: BLOG,
    noticias,
    imagenes,
  }, null, 2), 'utf-8');

  const publicadas = noticias.filter((n) => n.estado === 'publicada').length;
  console.log(`\n  Manifiesto: ${noticias.length} noticias (${publicadas} publicadas) y ${Object.keys(imagenes).length} imágenes`);
  console.log(`  Guardado en backend/importacion/`);
  console.log('  Siguiente paso: commit, push, desplegar, y dentro del contenedor:');
  console.log('    node scripts/importar-blog.js --aplicar');
}

// ─────────────────────────── FASE 2: APLICAR ───────────────────────────

const cabecera = (t) => String.fromCharCode(10) + '  ' + t;

async function fase2Aplicar() {
  if (!existsSync(MANIFIESTO)) {
    throw new Error(
      `No existe ${MANIFIESTO}.\n` +
      'Primero hay que ejecutar la fase 1 en una máquina con acceso al blog:\n' +
      '  node scripts/importar-blog.js --descargar',
    );
  }

  const manifiesto = JSON.parse(await readFile(MANIFIESTO, 'utf-8'));
  console.log(`\n>>> FASE 2: aplicando el manifiesto del ${manifiesto.generado.slice(0, 16).replace('T', ' ')}\n`);

  // Copiar las imágenes al volumen de uploads.
  let copiadas = 0;
  for (const [ruta, fichero] of Object.entries(manifiesto.imagenes)) {
    const origen = join(CARPETA, fichero);
    const destino = join(UPLOADS_DIR, ruta.replace(/^\/uploads\//, ''));
    await mkdir(dirname(destino), { recursive: true });
    await copyFile(origen, destino);
    copiadas++;
  }
  console.log(`  ${copiadas} imágenes copiadas a ${UPLOADS_DIR}\n`);

  const correoAutor = (process.env.ADMIN_EMAILS || 'web@iesjandula.es').split(',')[0].trim();
  let publicadas = 0, pendientes = 0, saltadas = 0, restauradas = 0;

  for (const n of manifiesto.noticias) {
    const yaExiste = await prisma.noticia.findFirst({ where: { titulo: n.titulo } });

    if (yaExiste && RESTAURAR) {
      // Se rehacen solo cuerpo, subtitulo y portada. El estado, el anclaje y la
      // fecha son decisiones del centro y no se tocan.
      await prisma.noticia.update({
        where: { id: yaExiste.id },
        data: { cuerpo: n.cuerpo, subtitulo: n.subtitulo, portada: n.portada },
      });
      console.log(`  [RESTAURADA] ${n.titulo.slice(0, 50)}  (id ${yaExiste.id})`);
      restauradas++;
      continue;
    }

    if (yaExiste) {
      console.log(`  [SALTADA]   ${n.titulo.slice(0, 52)}  (ya existe, id ${yaExiste.id})`);
      saltadas++;
      continue;
    }

    await prisma.noticia.create({
      data: {
        titulo: n.titulo,
        subtitulo: n.subtitulo,
        cuerpo: n.cuerpo,
        categoria: n.categoria,
        portada: n.portada,
        galeria: '[]',
        fecha: new Date(n.fecha),
        autor: 'IES Jándula',
        autorEmail: correoAutor,
        estado: n.estado,
      },
    });

    console.log(`  ${n.estado === 'publicada' ? '[PUBLICA] ' : '[pendiente]'} ${n.fecha.slice(0, 10)}  ${n.categoria.padEnd(10)} ${n.titulo.slice(0, 46)}`);
    n.estado === 'publicada' ? publicadas++ : pendientes++;
  }

  console.log(`\n  Publicadas: ${publicadas}   Pendientes: ${pendientes}   Saltadas: ${saltadas}   Restauradas: ${restauradas}`);

  if (publicadas === 0 && restauradas === 0) return;

  // Este script escribe con Prisma sin pasar por la API, así que no se dispara
  // el aviso de redespliegue que sí hace el panel. Se avisa aquí.
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) {
    console.log('\n  DEPLOY_HOOK_URL no está configurada: lanza el despliegue a mano');
    console.log('  desde Dokploy para que las noticias salgan en la web.');
    return;
  }

  try {
    // Dokploy compara la rama que llega en el cuerpo con la que tiene
    // configurada; sin cuerpo responde "Branch Not Match" y no despliega.
    const rama = process.env.DEPLOY_HOOK_BRANCH || 'main';
    const res = await fetch(hook, {
      method: process.env.DEPLOY_HOOK_METHOD || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'refs/heads/' + rama }),
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      console.log(cabecera('Redespliegue solicitado. En unos minutos la web mostrara las noticias.'));
    } else {
      const detalle = await res.text().catch(() => '');
      console.log(cabecera('El webhook respondio ' + res.status + ': ' + detalle.slice(0, 90)));
      console.log('  Lanza el despliegue a mano desde Dokploy.');
    }
  } catch (err) {
    console.log(`\n  No se pudo avisar al webhook (${err.message}). Lanza el despliegue a mano.`);
  }
}

// ─────────────────────────────── ARRANQUE ───────────────────────────────

const tarea = APLICAR ? fase2Aplicar() : fase1Descargar(!DESCARGAR);

tarea
  .catch((err) => {
    console.error('\nLa importación se detuvo:', err.message);
    if (err.cause?.code) console.error('Causa:', err.cause.code);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
