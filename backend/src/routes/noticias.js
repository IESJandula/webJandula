import { prisma } from '../plugins/prisma.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { solicitarRedespliegue } from '../services/redespliegue.js';

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
    fijada: n.fijada,
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
  fastify.get('/api/noticias', async (request, reply) => {
    const limit = Math.min(parseInt(request.query.limit ?? '50'), 200);
    const noticias = await prisma.noticia.findMany({
      where: { estado: 'publicada' },
      // Ancladas primero (en su propio orden), y el resto por fecha descendente.
      orderBy: [{ fijada: 'desc' }, { orden: 'asc' }, { fecha: 'desc' }],
      take: limit,
    });

    // ETag y Last-Modified: los usa el Dockerfile del frontend para saber si
    // tiene que reconstruir la web.
    //
    // La web es estática y las noticias se incrustan durante el build, pero
    // Docker decide si reutiliza una capa mirando solo los ficheros del
    // repositorio, que no cambian al publicar una noticia. Con estas cabeceras,
    // el "ADD" del Dockerfile invalida la capa justo cuando cambian las
    // noticias, y no antes. Comprobado que BuildKit atiende a las dos.
    const masReciente = noticias.reduce(
      (max, n) => (n.updatedAt > max ? n.updatedAt : max),
      new Date(0)
    );
    // Se incluyen los ids además de la fecha: así borrar una noticia también
    // cambia la firma, aunque no exista ninguna fecha de modificación nueva.
    const firma = `${noticias.length}-${masReciente.getTime()}-${noticias.map((n) => n.id).join('.')}`;

    reply
      .header('ETag', `"${Buffer.from(firma).toString('base64url').slice(0, 32)}"`)
      .header('Last-Modified', masReciente.toUTCString());

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

      if (noticia.estado === 'publicada') {
        solicitarRedespliegue(fastify.log, `noticia ${noticia.id} creada y publicada`);
      }

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

      if (existing.estado === 'publicada' || updated.estado === 'publicada') {
        solicitarRedespliegue(fastify.log, `noticia ${updated.id} editada`);
      }

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
        // Mismo orden que la web pública, para que el panel muestre lo que se ve.
        orderBy: [{ fijada: 'desc' }, { orden: 'asc' }, { fecha: 'desc' }],
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

      solicitarRedespliegue(fastify.log, `noticia ${noticia.id} aprobada`);

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

      const previa = await prisma.noticia.findUnique({ where: { id } });

      const noticia = await prisma.noticia.update({
        where: { id },
        data: {
          estado: 'rechazada',
          motivoRechazo: motivo?.trim() ?? 'Sin motivo especificado',
        },
      });

      if (previa?.estado === 'publicada') {
        solicitarRedespliegue(fastify.log, `noticia ${noticia.id} rechazada estando publicada`);
      }

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

      solicitarRedespliegue(fastify.log, `noticia ${noticia.id} despublicada`);

      return reply.send({ data: formatNoticia(noticia) });
    }
  );

  // POST /api/admin/noticias/:id/anclar  → la sube al principio de la web pública
  fastify.post(
    '/api/admin/noticias/:id/anclar',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const noticia = await prisma.noticia.findUnique({ where: { id } });
      if (!noticia) return reply.status(404).send({ error: 'Noticia no encontrada' });
      if (noticia.fijada) return reply.send({ data: formatNoticia(noticia) });

      // Se coloca al final de las ya ancladas; desde el panel se puede reordenar.
      const ultima = await prisma.noticia.findFirst({
        where: { fijada: true },
        orderBy: { orden: 'desc' },
        select: { orden: true },
      });

      const actualizada = await prisma.noticia.update({
        where: { id },
        data: { fijada: true, orden: (ultima?.orden ?? -1) + 1 },
      });

      solicitarRedespliegue(fastify.log, `noticia ${id} anclada`);

      return reply.send({ data: formatNoticia(actualizada) });
    }
  );

  // POST /api/admin/noticias/:id/desanclar  → vuelve a ordenarse por fecha
  fastify.post(
    '/api/admin/noticias/:id/desanclar',
    { preHandler: [authenticate, requireAdmin] },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) return reply.status(400).send({ error: 'ID inválido' });

      const noticia = await prisma.noticia.findUnique({ where: { id } });
      if (!noticia) return reply.status(404).send({ error: 'Noticia no encontrada' });

      // orden vuelve a 0: las no ancladas se ordenan solo por fecha.
      const actualizada = await prisma.noticia.update({
        where: { id },
        data: { fijada: false, orden: 0 },
      });

      if (noticia.fijada) {
        solicitarRedespliegue(fastify.log, `noticia ${id} desanclada`);
      }

      return reply.send({ data: formatNoticia(actualizada) });
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

      // "orden" solo tiene sentido entre las ancladas: se numeran 0,1,2... según
      // la posición en la que llegan, y a las no ancladas se les fuerza 0 para
      // que sigan ordenándose por fecha.
      const numericos = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));
      const registros = await prisma.noticia.findMany({
        where: { id: { in: numericos } },
        select: { id: true, fijada: true },
      });
      const esFijada = new Map(registros.map((r) => [r.id, r.fijada]));

      let posicion = 0;
      const cambios = numericos.map((id) => {
        const orden = esFijada.get(id) ? posicion++ : 0;
        return prisma.noticia.update({ where: { id }, data: { orden } });
      });

      await prisma.$transaction(cambios);

      solicitarRedespliegue(fastify.log, 'orden de las noticias ancladas cambiado');

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

      const previa = await prisma.noticia.findUnique({ where: { id } });
      await prisma.noticia.delete({ where: { id } });

      if (previa?.estado === 'publicada') {
        solicitarRedespliegue(fastify.log, `noticia ${id} eliminada`);
      }

      return reply.send({ ok: true });
    }
  );
}
