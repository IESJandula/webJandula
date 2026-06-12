import { authenticate } from '../middlewares/auth.js';
import { saveImage } from '../services/upload.js';

export default async function uploadRoutes(fastify) {
  fastify.post(
    '/api/uploads',
    { preHandler: authenticate },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No se recibió ningún fichero' });
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Solo se permiten imágenes (jpg, png, webp, gif)' });
      }

      const chunks = [];
      for await (const chunk of data.file) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (buffer.length > 10 * 1024 * 1024) {
        return reply.status(400).send({ error: 'La imagen no puede superar 10 MB' });
      }

      const result = await saveImage(buffer, data.filename);
      return reply.send({ url: result.url, path: result.path });
    }
  );
}
