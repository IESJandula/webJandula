/**
 * Pone al dia la ficha de una noticia sin reconstruir la web.
 *
 * La pagina que sirve el servidor es la que se construyo en el ultimo build:
 * si despues se edita la noticia, se cambia la foto o se anade una imagen a la
 * galeria, el visitante veria lo antiguo. Esto pregunta a la API por esa
 * noticia al abrirla y sustituye solo las piezas marcadas con data-articulo.
 *
 * Cubre los tres casos:
 *  - editada: se actualizan titulo, fecha, autor, entradilla, foto, cuerpo y galeria.
 *  - nueva:   la pagina /noticias/<id> todavia no existe, asi que nginx sirve
 *             /noticias/ver, que llega vacia y se rellena aqui.
 *  - borrada: la API responde 404 y se enseña el aviso de "no disponible".
 *
 * Si la API no contesta no se toca nada: se queda lo que trajo el build, que
 * es contenido valido.
 */
import { getNoticiaById } from './api';
import { formatearFecha, calcularEntradilla, figuraGaleriaHTML } from './articuloNoticia';

function pieza(nombre: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-articulo="${nombre}"]`);
}

function texto(nombre: string, valor: string): void {
    const el = pieza(nombre);
    if (el) el.textContent = valor;
}

/** Muestra u oculta una pieza que solo aparece cuando tiene contenido. */
function visible(el: HTMLElement | null, mostrar: boolean): void {
    el?.classList.toggle('hidden', !mostrar);
}

/**
 * El id de la noticia sale de la URL (/noticias/21), no del HTML: la pagina de
 * reserva vale para cualquier noticia y llega sin id.
 */
function idDeLaUrl(): string {
    const partes = window.location.pathname.split('/').filter(Boolean);
    const i = partes.indexOf('noticias');
    return i >= 0 ? (partes[i + 1] ?? '') : '';
}

export async function refrescarArticulo(): Promise<void> {
    const id = idDeLaUrl();
    if (!id) return;

    const articulo = document.getElementById('articulo-noticia');
    const noDisponible = document.getElementById('articulo-no-disponible');

    // La pagina de reserva llega sin datos: si la API falla, no hay nada
    // construido que conservar y hay que avisar.
    const esReserva = !articulo?.getAttribute('data-noticia-id');

    let noticia;
    try {
        noticia = await getNoticiaById(id);
    } catch {
        if (esReserva) visible(noDisponible, true);
        return;
    }

    if (!noticia) {
        // Borrada o despublicada: la pagina construida sigue existiendo en el
        // servidor, asi que hay que avisar de que ya no esta.
        visible(articulo, false);
        visible(noDisponible, true);
        return;
    }

    texto('titulo', noticia.title);
    texto('autor', noticia.author);

    const fecha = pieza('fecha');
    if (fecha) {
        fecha.setAttribute('datetime', noticia.date);
        fecha.textContent = formatearFecha(noticia.date);
    }

    const entradilla = calcularEntradilla(noticia.summary, noticia.body);
    const entradillaEl = pieza('entradilla');
    if (entradillaEl) {
        entradillaEl.textContent = entradilla;
        visible(entradillaEl, Boolean(entradilla));
    }

    const portada = pieza('portada') as HTMLImageElement | null;
    if (portada && noticia.image) {
        portada.src = noticia.image;
        portada.alt = `Fotografia de la noticia: ${noticia.title}`;
    }

    // El cuerpo llega como HTML desde la API, igual que en el build.
    const cuerpo = pieza('cuerpo');
    if (cuerpo) cuerpo.innerHTML = noticia.body ?? '';

    const cartel = pieza('cartel');
    if (cartel) {
        const boton = cartel.querySelector('.gallery-image-trigger');
        const img = cartel.querySelector('img');
        if (noticia.poster && boton && img instanceof HTMLImageElement) {
            const alt = `Cartel del evento: ${noticia.title}`;
            boton.setAttribute('data-image', noticia.poster);
            boton.setAttribute('data-alt', alt);
            img.src = noticia.poster;
            img.alt = alt;
        }
        visible(cartel, Boolean(noticia.poster));
    }

    const galeria = pieza('galeria');
    const fotos = noticia.gallery ?? [];
    if (galeria) {
        galeria.innerHTML = fotos
            .map((src, i) => figuraGaleriaHTML(src, noticia.title, i))
            .join('');
    }
    visible(pieza('galeria-seccion'), fotos.length > 0);

    // La pagina de reserva llega oculta hasta tener algo que enseñar.
    visible(noDisponible, false);
    visible(articulo, true);
    document.title = `${noticia.title} | IES Jándula`;
}
