import { prisma } from '../plugins/prisma.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';

function formatNoticia(n) {
  return {
    id: String(n.id),
    documentId: String(n.id),
    titulo: n.titulo,
    subtitulo: n.subtitulo ?? '',
    cuerpo: n.cuerpo,
    categoria: n.categoria,
    fecha: n.fecha.toISOString().slice(0, 10),
    autor: n.autor,
    autorEmail: n.autorEmail,
    estado: n.estado,
    motivoRechazo: n.motivoRechazo ?? null,
    orden: n.orden,
    // Compatibilidad con api.ts de Astro: imagen como array de objetos con url
    imagen: n.portada ? [{ url: n.portada }] : [],
    galeria: (() => {
      try {
        return JSON.parse(n.galeria).map((url) => ({ url }));
      } catch {
        return [];
      }
    })(),
  };
}

export default async function noticiasRoutes(fastify) {
  // ── PÚBLICAS (consume Astro) ──────────────────────────────────────────────

  // GET /api/noticias?limit=10  → solo publicadas
  fastify.get('/api/noticias', async (request) => {
    const limit = Math.min(parseInt(request.query.limit ?? '50'), 200);
    const noticias = await prisma.noticia.findMany({
      where: { estado: 'publicada' },
      orderBy: [{ orden: 'asc' }, { fecha: 'desc' }],
      take: limit,
    });
    return { data: noticias.map(formatNoticia) };
  });

  // GET /api/noticias/:id  → detalle, solo publicada
  fastify.get('/api/noticias/:id', async (request, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

    const noticia = await prisma.noticia.findFirst({
      where: { id, estado: 'publicada' },
    });
    if (!noticia) return reply.status(404).send({ error: 'Noticia no encontrada' });

    return { data: formatNoticia(noticia) };
  });

  // ── PROFESOR (requiere auth) ──────────────────────────────────────────────

  // GET /api/noticias/mis  → noticias del profesor logueado
  fastify.get(
    '/api/noticias/mis',
    { preHandler: authenticate },
    async (request) => {
      const noticias = await prisma.noticia.findMany({
        where: { autorEmail: request.user.email },
        orderBy: { createdAt: 'desc' },
      });
      return { data: noticias.map(formatNoticia) };
    }
  );

  // POST /api/noticias  → crear noticia en estado pendiente
  fastify.post(
    '/api/noticias',
    { preHandler: authenticate },
    async (request, reply) => {
      const { titulo, subtitulo, cuerpo, categoria, portada, galeria } = request.body;

      if (!titulo?.trim() || !cuerpo?.trim()) {
        return reply.status(400).send({ error: 'Título y cuerpo son obligatorios' });
      }

      const noticia = await prisma.noticia.create({
        data: {
          titulo: titulo.trim(),
          subtitulo: subtitulo?.trim() ?? null,
          cuerpo: cuerpo.trim(),
          categoria: categoria ?? 'Centro',
          portada: portada ?? null,
          galeria: JSON.stringify(Array.isArray(galeria) ? galeria : []),
          autor: request.user.name,
          autorEmail: request.user.email,
          // Admin publica directamente, profesor queda pendiente de aprobación
          estado: request.user.role === 'admin' ? 'publicada' : 'pendiente',
        },
      });

      return reply.status(201).send({ data: formatNoticia(noticia) });
    }
  );

  // PUT /api/noticias/:id  → el autor puede editar si está pendiente/rechazada
  fastify.put(
    '/api/noticias/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const existing = await prisma.noticia.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: 'Noticia no encontrada' });

      const isOwner = existing.autorEmail === request.user.email;
      const isAdmin = request.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return reply.status(403).send({ error: 'Sin permisos para editar esta noticia' });
      }

      // Profesores solo pueden editar noticias pendientes o rechazadas
      if (!isAdmin && existing.estado === 'publicada') {
        return reply.status(403).send({ error: 'No puedes editar una noticia publicada' });
      }

      const { titulo, subtitulo, cuerpo, categoria, portada, galeria } = request.body;

      const updated = await prisma.noticia.update({
        where: { id },
        data: {
          ...(titulo && { titulo: titulo.trim() }),
          ...(subtitulo !== undefined && { subtitulo: subtitulo?.trim() ?? null }),
          ...(cuerpo && { cuerpo: cuerpo.trim() }),
          ...(categoria && { categoria }),
          ...(portada !== undefined && { portada }),
          ...(galeria !== undefined && {
            galeria: JSON.stringify(Array.isArray(galeria) ? galeria : []),
          }),
          // Si el profe edita una rechazada, vuelve a pendiente
          ...(!isAdmin && existing.estado === 'rechazada' && { estado: 'pendiente', motivoRechazo: null }),
        },
      });

      return reply.send({ data: formatNoticia(updated) });
    }
  );

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  // GET /api/admin/noticias  → todas las noticias con filtro opcional por estado
  fastify.get(
    '/api/admin/noticias',
    { preHandler: [authenticate, requireAdmin] },
    async (request) => {
      const { estado } = request.query;
      const noticias = await prisma.noticia.findMany({
        where: estado ? { estado } : undefined,
        orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
      });
      return { data: noticias.map(formatNoticia) };
    }
  );

  // POST /api/admin/noticias/:id/aprobar
  fastify.post(
    '/api/admin/noticias/:id/aprobar',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const noticia = await prisma.noticia.update({
        where: { id },
        data: { estado: 'publicada', motivoRechazo: null },
      });

      return reply.send({ data: formatNoticia(noticia) });
    }
  );

  // POST /api/admin/noticias/:id/rechazar
  fastify.post(
    '/api/admin/noticias/:id/rechazar',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const { motivo } = request.body || {};

      const noticia = await prisma.noticia.update({
        where: { id },
        data: {
          estado: 'rechazada',
          motivoRechazo: motivo?.trim() ?? 'Sin motivo especificado',
        },
      });

      return reply.send({ data: formatNoticia(noticia) });
    }
  );

  // POST /api/admin/noticias/:id/despublicar
  fastify.post(
    '/api/admin/noticias/:id/despublicar',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const noticia = await prisma.noticia.update({
        where: { id },
        data: { estado: 'pendiente' },
      });

      return reply.send({ data: formatNoticia(noticia) });
    }
  );

  // PUT /api/admin/noticias/orden  → reordenar noticias publicadas
  fastify.put(
    '/api/admin/noticias/orden',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const { ids } = request.body || {};
      if (!Array.isArray(ids)) {
        return reply.status(400).send({ error: 'Se esperaba un array de ids' });
      }

      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.noticia.update({
            where: { id: parseInt(id) },
            data: { orden: index },
          })
        )
      );

      return reply.send({ ok: true });
    }
  );

  // DELETE /api/admin/noticias/:id
  fastify.delete(
    '/api/admin/noticias/:id',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      await prisma.noticia.delete({ where: { id } });
      return reply.send({ ok: true });
    }
  );
}
