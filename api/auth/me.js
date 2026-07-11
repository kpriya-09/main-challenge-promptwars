import { withAuth, methodGuard } from '../_lib/auth.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['GET'])) return;
  res.status(200).json({ user: req.user });
}

export default withAuth(handler);
