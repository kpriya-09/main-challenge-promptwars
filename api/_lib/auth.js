import jwt from 'jsonwebtoken';
import { config } from './config.js';

const TOKEN_TTL = '7d';

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, config.jwtSecret, {
    expiresIn: TOKEN_TTL
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

/**
 * Wraps a Vercel serverless handler so it only runs for authenticated
 * requests, attaching the decoded user as req.user.
 */
export function withAuth(handler) {
  return async (req, res) => {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    return handler(req, res);
  };
}

export function methodGuard(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}
