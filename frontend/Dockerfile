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
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
