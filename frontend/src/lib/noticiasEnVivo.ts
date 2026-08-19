/**
 * Pone al dia las noticias ya pintadas, sin reconstruir la web.
 *
 * La web es estatica: las noticias se incrustan en el HTML durante el build,
 * asi que el orden que ve el visitante es el que habia en ese momento. Cuando
 * alguien reordena las noticias en el panel, el backend pide una
 * reconstruccion, pero tarda unos minutos.
 *
 * Esto cubre ese hueco: al abrir la pagina se pregunta a la API como estan las
 * noticias AHORA y, solo si no coincide con lo que hay pintado, se vuelven a
 * pintar las tarjetas. Si la API no contesta no pasa nada: se queda lo que
 * trajo el build, que es contenido valido.
 *
 * El HTML del build se mantiene tal cual (lo necesitan los buscadores y evita
 * que la portada aparezca vacia un instante); esto solo lo corrige despues.
 */
import { getNoticias } from './api';
import { cardNoticiaHTML } from './cardNoticia';
import type { NoticiaCard } from './api';

export interface ZonaNoticias {
    /** Contenedor cuyas tarjetas se sustituyen. */
    el: HTMLElement | null;
    /** Trozo de la lista que le toca a esta zona. */
    desde: number;
    hasta?: number;
    variant?: 'default' | 'featured';
    /** Para zonas que envuelven cada tarjeta (p. ej. los datos del buscador). */
    envolver?: (noticia: NoticiaCard, html: string) => string;
}

function idsPintados(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('[data-noticia-id]')).map(
        (nodo) => nodo.getAttribute('data-noticia-id') ?? ''
    );
}

/**
 * @returns true si ha cambiado algo, para que quien llame pueda reengancharse
 *          (el buscador de /noticias, por ejemplo, guarda una lista de nodos).
 */
export async function refrescarNoticias(
    zonas: ZonaNoticias[],
    opciones: { limite?: number } = {}
): Promise<boolean> {
    let noticias: NoticiaCard[];
    try {
        noticias = await getNoticias(opciones.limite ?? 24);
    } catch {
        // Sin conexion con la API se deja lo que trajo el build.
        return false;
    }
    if (noticias.length === 0) return false;

    let algoCambio = false;

    for (const zona of zonas) {
        if (!zona.el) continue;

        const trozo = noticias.slice(zona.desde, zona.hasta);
        const esperados = trozo.map((n) => n.id);
        const actuales = idsPintados(zona.el);

        // Repintar solo lo que haga falta: si el build ya estaba al dia, el
        // visitante no ve ningun salto.
        if (esperados.length === actuales.length && esperados.every((id, i) => id === actuales[i])) {
            continue;
        }

        zona.el.innerHTML = trozo
            .map((noticia) => {
                const html = cardNoticiaHTML({ ...noticia, variant: zona.variant });
                return zona.envolver ? zona.envolver(noticia, html) : html;
            })
            .join('');
        algoCambio = true;
    }

    return algoCambio;
}
