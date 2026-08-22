import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://iesjandula.es',
    integrations: [
        tailwind(),
        sitemap({
            // Excluir páginas de admin o privadas si las hubiera, y la de error
            filter: (page) =>
                !page.includes('/admin') &&
                !page.includes('/404') &&
                // Comodin para las noticias sin pagina propia todavia: no es
                // una pagina real, se rellena en el navegador.
                !page.includes('/noticias/ver'),
            // Cambiar frecuencia y prioridad por sección
            customPages: [],
            serialize(item) {
                if (item.url === 'https://iesjandula.es/') {
                    return { ...item, changefreq: 'daily',   priority: 1.0 };
                }
                if (item.url.includes('/oferta') || item.url.includes('/nuestro_centro')) {
                    return { ...item, changefreq: 'weekly',  priority: 0.9 };
                }
                return { ...item, changefreq: 'monthly', priority: 0.7 };
            },
        }),
    ],
});