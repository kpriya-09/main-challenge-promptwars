import { withAuth, methodGuard } from './_lib/auth.js';
import { listPlans, listAdvisories } from './_lib/storage.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['GET'])) return;
  const limit = Math.min(Number(req.query?.limit) || 10, 50);
  const [plans, advisories] = await Promise.all([listPlans(req.user.id, limit), listAdvisories(req.user.id, limit)]);
  res.status(200).json({ plans, advisories });
}

export default withAuth(handler);
