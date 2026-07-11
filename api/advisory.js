import { withAuth, methodGuard } from './_lib/auth.js';
import { getProfile } from './_lib/storage.js';
import { geocodeCity, getCurrentWeather, getForecast, deriveAlerts, summarizeWeather } from './_lib/weather.js';
import { generateTravelAdvisory } from './_lib/gemini.js';
import { saveAdvisory } from './_lib/storage.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const { destinationCity, destinationState, destinationCountry, travelDate, mode, notes } = req.body ?? {};
  if (!destinationCity) {
    res.status(400).json({ error: 'Destination city is required' });
    return;
  }

  const profile = await getProfile(req.user.id);

  let weather;
  try {
    const { lat, lon, name, country } = await geocodeCity(destinationCity, destinationState, destinationCountry);
    const [current, forecastList] = await Promise.all([getCurrentWeather(lat, lon), getForecast(lat, lon)]);
    const alerts = deriveAlerts(current, forecastList);
    weather = { ...summarizeWeather(current, forecastList), alerts, resolvedName: name, resolvedCountry: country };
  } catch (err) {
    console.error('Destination weather lookup failed', err);
    res.status(502).json({ error: `Could not fetch weather for "${destinationCity}". Check the spelling and try again.` });
    return;
  }

  const trip = { destinationCity, destinationState, destinationCountry, travelDate, mode, notes };

  let advisory;
  try {
    advisory = await generateTravelAdvisory(profile ?? {}, trip, weather, profile?.language);
  } catch (err) {
    console.error('Gemini advisory generation failed', err);
    res.status(502).json({ error: 'Travel advisory generation failed. Please try again.' });
    return;
  }

  advisory.weatherSnapshot = weather;
  await saveAdvisory(req.user.id, trip, advisory);

  res.status(200).json({ advisory, trip });
}

export default withAuth(handler);
