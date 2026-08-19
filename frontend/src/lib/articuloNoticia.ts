/**
 * Piezas de la pagina de una noticia que se calculan igual en el build y en el
 * navegador.
 *
 * Existe porque la ficha de una noticia se pinta en dos momentos: durante el
 * build (ArticuloNoticia.astro) y despues en el navegador, cuando la pagina se
 * pone al dia con lo que hay ahora mismo en la API (articuloEnVivo.ts). Si cada
 * lado calculase la fecha o la entradilla a su manera, el texto bailaria al
 * refrescar.
 */

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Deja el texto comparable: sin etiquetas, sin entidades y en minusculas.
 *
 * El cuerpo guarda entidades HTML (&#8211;, &nbsp;) donde el extracto de
 * WordPress trae ya el caracter. Sin decodificarlas, las dos cadenas se
 * separaban en el primer guion largo y la comparacion fallaba.
 */
function normalizar(texto: string): string {
    return texto
        .replace(/<[^>]*>/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&(?:quot|ldquo|rdquo);/g, '"')
        .replace(/&(?:ndash|mdash);/g, '-')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[.…]+$/, '')
        .trim()
        .toLowerCase();
}

/**
 * Las noticias importadas del blog traen como subtitulo el extracto automatico
 * de WordPress, que son las primeras palabras del cuerpo. Mostrarlo como
 * entradilla hacia leer lo mismo dos veces seguidas, asi que se omite cuando
 * esta contenido al principio del texto.
 */
export function calcularEntradilla(summary: string | undefined, body: string | undefined): string {
    if (!summary) return '';

    // Se comparan las dos cadenas SIN espacios: en alguna entrada del blog la
    // imagen quedo insertada en mitad de una palabra ("Queremos expre<img>sar"),
    // y al quitar las etiquetas aparece un espacio que no esta en el extracto.
    const sinEspacios = (s: string) => normalizar(s).replace(/ /g, '');

    const resumen = sinEspacios(summary);
    if (resumen.length < 20) return '';

    // El extracto suele cortar a media palabra, asi que se descarta el final.
    const comparable = resumen.slice(0, Math.max(20, resumen.length - 10));

    return sinEspacios(body ?? '').startsWith(comparable) ? '' : summary;
}

function escapar(valor: unknown): string {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Una foto de la galeria. En HTML y no en un .astro porque la galeria tambien
 * se repinta en el navegador cuando se edita la noticia.
 */
export function figuraGaleriaHTML(src: string, titulo: string, indice: number): string {
    const alt = `Imagen ${indice + 1} de la noticia: ${titulo}`;
    return `<figure class="group relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm">
                    <button
                      class="gallery-image-trigger block w-full"
                      data-image="${escapar(src)}"
                      data-alt="${escapar(alt)}"
                      aria-label="Abrir imagen ${indice + 1} en grande"
                    >
                      <img
                        src="${escapar(src)}"
                        alt="${escapar(alt)}"
                        class="w-full h-56 object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <span class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors duration-300" aria-hidden="true">
                        <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white/90 p-2.5 shadow-md">
                          <svg class="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6m-3-3h6"/>
                          </svg>
                        </span>
                      </span>
                    </button>
                  </figure>`;
}
