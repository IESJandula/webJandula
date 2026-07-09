FROM node:22-alpine

# Prisma necesita OpenSSL para sus motores (schema-engine, query-engine).
# node:22-alpine no lo trae por defecto y falla al detectar la versión.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
# DATABASE_URL provisional: prisma generate no se conecta a la BD, solo necesita
# la variable definida para no fallar al parsear el schema.
ENV DATABASE_URL="file:./generate-placeholder.db"
RUN npx prisma generate

COPY src ./src

# El volumen se monta en /data (uploads + sqlite), y persiste entre despliegues
ENV UPLOADS_DIR=/data/uploads
ENV DATABASE_URL=file:/data/jandula-noticias.db
ENV NODE_ENV=production

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
