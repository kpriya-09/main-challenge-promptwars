import { withAuth, methodGuard } from './_lib/auth.js';
import { getProfile } from './_lib/storage.js';
import { getCurrentWeather, getForecast, deriveAlerts, summarizeWeather } from './_lib/weather.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['GET'])) return;

  const profile = await getProfile(req.user.id);
  if (!profile?.location) {
    res.status(400).json({ error: 'Complete your profile with a location first.' });
    return;
  }

  const { lat, lon } = profile.location;
  const [current, forecastList] = await Promise.all([getCurrentWeather(lat, lon), getForecast(lat, lon)]);
  const alerts = deriveAlerts(current, forecastList);
  const weather = summarizeWeather(current, forecastList);

  res.status(200).json({ weather, alerts });
}

export default withAuth(handler);
