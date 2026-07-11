import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { signToken, methodGuard } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = sql();
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await db`
    SELECT id, email, name, password_hash FROM mm_users WHERE email = ${normalizedEmail}
  `;
  const user = rows[0];
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  if (!user.password_hash) {
    res.status(401).json({ error: 'This account uses Google Sign-In. Continue with Google instead.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  await db`UPDATE mm_users SET last_login = now() WHERE id = ${user.id}`;

  const publicUser = { id: user.id, email: user.email, name: user.name };
  const token = signToken(publicUser);
  res.status(200).json({ token, user: publicUser });
}
