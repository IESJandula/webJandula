import { verifyToken } from '../plugins/firebase.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export default async function authRoutes(fastify) {
  fastify.post('/auth/login', async (request, reply) => {
    const { token } = request.body || {};
    if (!token) {
      return reply.status(400).send({ error: 'Token requerido' });
    }

    try {
      const decoded = await verifyToken(token);

      if (!decoded.email?.endsWith('@g.educaand.es')) {
        return reply.status(403).send({ error: 'Solo se permiten cuentas @g.educaand.es' });
      }

      const role = ADMIN_EMAILS.includes(decoded.email) ? 'admin' : 'profesor';

      return reply.send({
        email: decoded.email,
        nombre: decoded.name || decoded.email.split('@')[0],
        rol: role,
        uid: decoded.uid,
      });
    } catch {
      return reply.status(401).send({ error: 'Token inválido o expirado' });
    }
  });
}
