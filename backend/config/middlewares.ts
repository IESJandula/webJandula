export default [
    'strapi::errors',
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            origin: ['http://localhost:4321'], // tu frontend (Astro)
            headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
            credentials: true,
        },
    },
    'strapi::security',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
