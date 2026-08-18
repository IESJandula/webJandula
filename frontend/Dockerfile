FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
# Valvula de escape para el PRIMER despliegue de un dominio nuevo: permite
# construir aunque la API todavia no sea accesible. Ver src/lib/api.ts.
ARG PERMITIR_BUILD_SIN_NOTICIAS
ENV PERMITIR_BUILD_SIN_NOTICIAS=$PERMITIR_BUILD_SIN_NOTICIAS

# Rompe la cache de Docker cuando cambian las noticias.
#
# Este sitio es estatico: "pnpm build" incrusta en el HTML las noticias que lee
# de la API. Pero Docker decide si reutiliza una capa mirando solo los FICHEROS
# del contexto, y esos no cambian al publicar una noticia. Sin esta linea,
# publicar desde el panel lanzaba el despliegue y Docker reutilizaba el
# frontend antiguo: la noticia nunca llegaba a la web.
#
# ADD contra una URL usa las cabeceras ETag y Last-Modified de la respuesta
# como clave de cache (comprobado: el cuerpo NO se tiene en cuenta, solo esas
# cabeceras). El endpoint /api/noticias las emite a partir de una firma de las
# noticias publicadas, asi que esta capa se invalida justo cuando cambian, y
# entonces obliga a repetir el "pnpm build" de abajo.
#
# OJO: si estrenas un dominio y la API todavia no responde, comenta esta linea
# para el primer despliegue (ver PERMITIR_BUILD_SIN_NOTICIAS mas arriba).
ADD ${PUBLIC_API_URL}/api/noticias?limit=200 /tmp/noticias-version.json

RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
