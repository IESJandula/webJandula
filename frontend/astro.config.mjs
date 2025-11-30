import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // <-- ¡DEBE ESTAR AQUÍ!

export default defineConfig({
    integrations: [
        tailwind({
        }),
    ],
});