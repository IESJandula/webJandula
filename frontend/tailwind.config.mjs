/** @type {import('tailwindcss').Config} */
export default {
    content: [
        // Rutas críticas: Le decimos a Tailwind que revise todos estos archivos
        './src/**/*.{astro,html,js,jsx,ts,tsx}',
        './src/pages/**/*.{astro,html}',
        './src/components/**/*.{astro,html,js,jsx,ts,tsx}',
        './src/layouts/**/*.{astro,html}',
    ],
    theme: {
        extend: {
            colors: {
                // Paleta IES Jándula
                'jandula-green': '#A3CC2A',
                'jandula-blue': '#1D829B',
            },        },
    },
    plugins: [],
}