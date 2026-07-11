import { describe, it, expect } from 'vitest';
import { deriveAlerts, getCurrentWeather } from '../api/_lib/weather.js';
import { afterEach, vi } from 'vitest';

afterEach(() => vi.unstubAllGlobals());

describe('deriveAlerts', () => {
  it('generates severe alert for heavy current rain', () => {
    const current = { rain: { '1h': 16 }, wind: { speed: 5 } };
    const forecastList = [];
    const alerts = deriveAlerts(current, forecastList);
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('severe');
    expect(alerts[0].message).toContain('Heavy rain');
  });

  it('generates watch alert for forecasted strong winds', () => {
    const current = { rain: {}, wind: { speed: 5 } };
    const forecastList = [
      { wind: { speed: 16 } }
    ];
    const alerts = deriveAlerts(current, forecastList);
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('watch');
    expect(alerts[0].message).toContain('Strong winds expected');
  });

  it('returns no alerts for normal conditions', () => {
    const current = { rain: {}, wind: { speed: 5 } };
    const forecastList = [
      { wind: { speed: 5 }, rain: { '3h': 2 } }
    ];
    const alerts = deriveAlerts(current, forecastList);
    
    expect(alerts).toHaveLength(0);
  });
});

describe('weather request efficiency', () => {
  it('reuses a recent weather response for the same coordinates', async () => {
    process.env.OPENWEATHER_API_KEY = 'test-weather-key';
    const response = { name: 'Test City', main: { temp: 27 } };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(response) });
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([
      getCurrentWeather(12.345678, 76.54321),
      getCurrentWeather(12.345678, 76.54321)
    ]);

    expect(first).toEqual(response);
    expect(second).toEqual(response);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
