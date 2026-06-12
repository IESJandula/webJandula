import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

import { initFirebase } from './plugins/firebase.js';
import authRoutes from './routes/auth.js';
import noticiasRoutes from './routes/noticias.js';
import uploadRoutes from './routes/uploads.js';

const PORT = parseInt(process.env.PORT || '3001');
const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR || './uploads');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4321';
const PANEL_URL = process.env.PANEL_URL || 'http://localhost:5173';

mkdirSync(UPLOADS_DIR, { recursive: true });

initFirebase();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: [FRONTEND_URL, PANEL_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

await fastify.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 },
});

await fastify.register(staticFiles, {
  root: UPLOADS_DIR,
  prefix: '/uploads/',
});

await fastify.register(authRoutes);
await fastify.register(noticiasRoutes);
await fastify.register(uploadRoutes);

fastify.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 Backend IES Jándula escuchando en puerto ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
