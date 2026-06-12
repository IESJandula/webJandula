import { verifyToken } from '../plugins/firebase.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export async function authenticate(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token requerido' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await verifyToken(token);

    if (!decoded.email?.endsWith('@g.educaand.es')) {
      return reply.status(403).send({ error: 'Dominio no autorizado' });
    }

    request.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      role: ADMIN_EMAILS.includes(decoded.email) ? 'admin' : 'profesor',
    };
  } catch {
    return reply.status(401).send({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(request, reply, done) {
  if (request.user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Acceso restringido a administradores' });
  }
  done();
}
