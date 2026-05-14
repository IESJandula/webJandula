export default [
    'strapi::errors',
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            origin: ['http://localhost:4321', 'http://webiesjandula.51.210.104.106.sslip.io'],
            headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
            credentials: true,
        },
    },
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'http:', 'https:'],
                    'img-src': ["'self'", 'data:', 'blob:', 'strapiwebjandula.51.210.104.106.sslip.io'],
                    'media-src': ["'self'", 'data:', 'blob:', 'strapiwebjandula.51.210.104.106.sslip.io'],
                    upgradeInsecureRequests: null, // IMPORTANTE: Esto evita que Strapi intente forzar HTTPS
                },
            },
        },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];