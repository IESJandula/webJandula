/**
 * Plantilla de la tarjeta de noticia, en una sola pieza.
 *
 * Vive aqui y no dentro del .astro porque el mismo marcado se pinta en dos
 * momentos distintos: durante el build (CardNoticia.astro) y en el navegador,
 * cuando la web se pone al dia con el orden que hay ahora mismo en la API
 * (ver noticiasEnVivo.ts). Con dos copias del HTML, cualquier retoque de
 * diseño acabaria olvidandose en una de las dos.
 */

export interface NoticiaCardProps {
    id?: string;
    title: string;
    summary: string;
    date: string;
    image: string;
    link: string;
    variant?: 'default' | 'featured';
}

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Fecha en texto: mas legible que 2026-07-19 y mas propia de un periodico. */
export function fechaLegible(date: string): string {
    const fecha = new Date(date);
    return Number.isNaN(fecha.getTime())
        ? date
        : `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/**
 * El texto de las noticias lo escriben personas desde el panel, asi que aqui
 * se trata como texto y nunca como HTML: si un titular lleva "<" o comillas,
 * tiene que salir tal cual y no romper el marcado.
 */
function escapar(valor: unknown): string {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Tarjeta en clave editorial: manda la fotografia y debajo van fecha, titular
 * y entradilla. Sin etiquetas de categoria ni distintivos encima de la imagen:
 * ensuciaban la foto y competian con el titular.
 *
 * El span absoluto que hay dentro del enlace del titular cubre la tarjeta
 * entera, para poder pinchar en cualquier punto sin duplicar enlaces (que es
 * lo que molesta a quien navega con lector de pantalla).
 */
export function cardNoticiaHTML(props: NoticiaCardProps): string {
    const { title, summary, date, image, link, variant = 'default', id } = props;
    const destacada = variant === 'featured';

    return `
<article class="group relative flex h-full flex-col"${id ? ` data-noticia-id="${escapar(id)}"` : ''}>
    <div class="overflow-hidden rounded-2xl bg-slate-100">
        <img
            src="${escapar(image)}"
            alt=""
            class="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${destacada ? 'h-64 md:h-80' : 'h-52'}"
            loading="lazy"
            decoding="async"
        />
    </div>

    <div class="flex flex-1 flex-col pt-5">
        <time
            datetime="${escapar(date)}"
            class="text-xs font-medium uppercase tracking-[0.08em] text-slate-500 tabular-nums"
        >${escapar(fechaLegible(date))}</time>

        <h3
            class="mt-2 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-800 ${destacada ? 'text-2xl md:text-[1.75rem]' : 'text-lg'}"
            style="font-family: 'Newsreader', Georgia, serif; letter-spacing: -0.015em; text-wrap: balance;"
        >
            <a
                href="${escapar(link)}"
                class="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >${escapar(title)}<span class="absolute inset-0"></span></a>
        </h3>

        <p
            class="mt-3 flex-1 leading-relaxed text-slate-600 line-clamp-3 ${destacada ? 'text-base' : 'text-sm'}"
            style="text-wrap: pretty;"
        >${escapar(summary)}</p>

        <span
            class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors group-hover:text-blue-900"
            aria-hidden="true"
        >
            Leer noticia
            <svg
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
        </span>
    </div>
</article>`;
}
