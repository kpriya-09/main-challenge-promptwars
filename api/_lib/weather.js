import { config } from './config.js';

const BASE = 'https://api.openweathermap.org';
const WEATHER_TTL_MS = 5 * 60 * 1000;
const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

async function cached(key, ttl, load) {
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) return existing.value;

  // Cache the in-flight promise too, preventing concurrent dashboard/plan
  // requests for the same location from duplicating an external API call.
  const value = Promise.resolve().then(load);
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  try {
    return await value;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
}

async function fetchJson(url, errorLabel) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorLabel} (${response.status})`);
  return response.json();
}

export async function geocodeCity(city, state, country) {
  const query = [city, state, country].filter(Boolean).join(',');
  return cached(`geo:${query.toLowerCase()}`, GEOCODE_TTL_MS, async () => {
    const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${config.openWeatherApiKey}`;
    const [match] = await fetchJson(url, 'Geocoding failed');
    if (!match) throw new Error(`Could not find location for "${query}"`);
    return { lat: match.lat, lon: match.lon, name: match.name, country: match.country };
  });
}

export async function getCurrentWeather(lat, lon) {
  return cached(`current:${lat}:${lon}`, WEATHER_TTL_MS, () => {
    const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.openWeatherApiKey}`;
    return fetchJson(url, 'Current weather lookup failed');
  });
}

export async function getForecast(lat, lon) {
  return cached(`forecast:${lat}:${lon}`, WEATHER_TTL_MS, async () => {
    const url = `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${config.openWeatherApiKey}`;
    const data = await fetchJson(url, 'Forecast lookup failed');
    return data.list ?? [];
  });
}

const RAIN_HEAVY_MM_3H = 15;
const RAIN_MODERATE_MM_3H = 5;
const WIND_STRONG_MS = 15;
const WIND_MODERATE_MS = 10;

/**
 * Derives plain-language, threshold-based alerts from free-tier OpenWeatherMap
 * data (current + 3-hourly forecast), since the official severe-weather
 * alerts endpoint requires a paid One Call subscription. Not a substitute
 * for official IMD/government warnings — surfaced to users as such.
 */
export function deriveAlerts(current, forecastList) {
  const alerts = [];

  const currentRain = current?.rain?.['1h'] ?? current?.rain?.['3h'] ?? 0;
  if (currentRain >= RAIN_HEAVY_MM_3H) {
    alerts.push({ severity: 'severe', message: `Heavy rain happening right now (${currentRain}mm). Avoid unnecessary travel.` });
  }
  if (current?.wind?.speed >= WIND_STRONG_MS) {
    alerts.push({ severity: 'severe', message: `Strong winds currently at ${current.wind.speed} m/s. Secure loose objects outdoors.` });
  }

  const next24h = forecastList.slice(0, 8);
  const maxRain = Math.max(0, ...next24h.map((f) => f.rain?.['3h'] ?? 0));
  const maxWind = Math.max(0, ...next24h.map((f) => f.wind?.speed ?? 0));

  if (maxRain >= RAIN_HEAVY_MM_3H) {
    alerts.push({ severity: 'watch', message: `Heavy rainfall expected in the next 24 hours (up to ${maxRain.toFixed(0)}mm/3h). Plan for possible waterlogging.` });
  } else if (maxRain >= RAIN_MODERATE_MM_3H) {
    alerts.push({ severity: 'advisory', message: `Moderate rain expected in the next 24 hours (up to ${maxRain.toFixed(0)}mm/3h).` });
  }

  if (maxWind >= WIND_STRONG_MS) {
    alerts.push({ severity: 'watch', message: `Strong winds expected in the next 24 hours (up to ${maxWind.toFixed(0)} m/s).` });
  } else if (maxWind >= WIND_MODERATE_MS) {
    alerts.push({ severity: 'advisory', message: `Breezy conditions expected (up to ${maxWind.toFixed(0)} m/s winds).` });
  }

  return alerts;
}

export function summarizeWeather(current, forecastList) {
  return {
    location: current?.name,
    temp: current?.main?.temp,
    feelsLike: current?.main?.feels_like,
    humidity: current?.main?.humidity,
    condition: current?.weather?.[0]?.description,
    windSpeed: current?.wind?.speed,
    rainLastHour: current?.rain?.['1h'] ?? 0,
    forecastNext24h: forecastList.slice(0, 8).map((f) => ({
      time: f.dt_txt,
      temp: f.main?.temp,
      condition: f.weather?.[0]?.description,
      rain3h: f.rain?.['3h'] ?? 0,
      windSpeed: f.wind?.speed
    }))
  };
}
