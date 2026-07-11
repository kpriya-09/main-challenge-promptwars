import { withAuth, methodGuard } from '../_lib/auth.js';
import { getProfile, saveProfile } from '../_lib/storage.js';
import { geocodeCity } from '../_lib/weather.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['GET', 'PUT'])) return;

  if (req.method === 'GET') {
    const profile = await getProfile(req.user.id);
    res.status(200).json({ profile });
    return;
  }

  const incoming = req.body ?? {};
  if (typeof incoming !== 'object' || Array.isArray(incoming)) {
    res.status(400).json({ error: 'Profile payload must be an object' });
    return;
  }

  if (incoming.city) {
    try {
      const location = await geocodeCity(incoming.city, incoming.state, incoming.country);
      incoming.location = location;
    } catch (err) {
      console.error('Geocoding failed', err);
      incoming.location = null;
    }
  }

  const saved = await saveProfile(req.user.id, incoming);
  res.status(200).json({ profile: saved });
}

export default withAuth(handler);
