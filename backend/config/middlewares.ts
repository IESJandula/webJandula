export default [
    'strapi::errors',
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            origin: ['http://localhost:4321','http://webiesjandula.51.210.104.106.sslip.io'],// tu frontend (Astro)
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
