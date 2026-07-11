import { OAuth2Client } from 'google-auth-library';
import { sql } from '../_lib/db.js';
import { signToken, methodGuard } from '../_lib/auth.js';
import { config } from '../_lib/config.js';

let client = null;
function getClient() {
  if (!client) {
    client = new OAuth2Client(config.googleClientId);
  }
  return client;
}

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const { credential } = req.body ?? {};
  if (!credential) {
    res.status(400).json({ error: 'Missing Google credential' });
    return;
  }

  let payload;
  try {
    const oauthClient = getClient();
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed', err);
    res.status(401).json({ error: 'Invalid Google credential' });
    return;
  }

  if (!payload?.email || !payload.email_verified) {
    res.status(401).json({ error: 'Google account email is not verified' });
    return;
  }

  const db = sql();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const name = payload.name || normalizedEmail.split('@')[0];

  const existing = await db`
    SELECT id, email, name FROM mm_users WHERE google_sub = ${payload.sub} OR email = ${normalizedEmail}
  `;

  let user;
  if (existing.length > 0) {
    const rows = await db`
      UPDATE mm_users SET google_sub = ${payload.sub}, last_login = now()
      WHERE id = ${existing[0].id}
      RETURNING id, email, name
    `;
    user = rows[0];
  } else {
    const rows = await db`
      INSERT INTO mm_users (email, name, google_sub, last_login)
      VALUES (${normalizedEmail}, ${name}, ${payload.sub}, now())
      RETURNING id, email, name
    `;
    user = rows[0];
  }

  const token = signToken(user);
  res.status(200).json({ token, user });
}
