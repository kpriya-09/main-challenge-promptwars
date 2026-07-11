import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { signToken, methodGuard } from '../_lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const { email, password, name } = req.body ?? {};
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const db = sql();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db`SELECT id FROM mm_users WHERE email = ${normalizedEmail}`;
  if (existing.length > 0) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rows = await db`
    INSERT INTO mm_users (email, password_hash, name)
    VALUES (${normalizedEmail}, ${passwordHash}, ${name.trim()})
    RETURNING id, email, name
  `;
  const user = rows[0];
  const token = signToken(user);

  res.status(201).json({ token, user });
}
