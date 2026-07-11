import { withAuth, methodGuard } from './_lib/auth.js';
import { getProfile, saveProfile, savePlan } from './_lib/storage.js';
import { getCurrentWeather, getForecast, deriveAlerts, summarizeWeather } from './_lib/weather.js';
import { generatePreparednessPlan } from './_lib/gemini.js';
import { identifyProfileGaps } from './_lib/profileGaps.js';

async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const incomingProfile = req.body?.profile;
  let profile = incomingProfile && typeof incomingProfile === 'object' ? await saveProfile(req.user.id, incomingProfile) : await getProfile(req.user.id);

  if (!profile) {
    res.status(400).json({ error: 'No household profile found. Complete onboarding first.' });
    return;
  }
  if (!profile.location) {
    res.status(400).json({ error: 'Your profile needs a valid city before generating a plan.' });
    return;
  }

  const { lat, lon } = profile.location;
  let weather, alerts;
  try {
    const [current, forecastList] = await Promise.all([getCurrentWeather(lat, lon), getForecast(lat, lon)]);
    alerts = deriveAlerts(current, forecastList);
    weather = summarizeWeather(current, forecastList);
  } catch (err) {
    console.error('Weather lookup failed', err);
    res.status(502).json({ error: 'Could not fetch live weather data. Please try again.' });
    return;
  }

  const gaps = identifyProfileGaps(profile);

  let plan;
  try {
    plan = await generatePreparednessPlan(profile, weather, alerts, profile.language, gaps);
  } catch (err) {
    console.error('Gemini plan generation failed', err);
    res.status(502).json({ error: 'Preparedness plan generation failed. Please try again.' });
    return;
  }

  plan.weatherSnapshot = weather;
  plan.currentAlerts = alerts;
  plan.dataGaps = gaps;

  const planDate = new Date().toISOString().slice(0, 10);
  await savePlan(req.user.id, planDate, plan);

  res.status(200).json({ plan, planDate });
}

export default withAuth(handler);
