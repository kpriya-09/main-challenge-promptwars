import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  saveProfile: vi.fn(),
  savePlan: vi.fn(),
  saveAdvisory: vi.fn(),
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
  geocodeCity: vi.fn(),
  deriveAlerts: vi.fn(),
  summarizeWeather: vi.fn(),
  generatePreparednessPlan: vi.fn(),
  generateTravelAdvisory: vi.fn()
}));

vi.mock('../api/_lib/storage.js', () => ({
  getProfile: mocks.getProfile,
  saveProfile: mocks.saveProfile,
  savePlan: mocks.savePlan,
  saveAdvisory: mocks.saveAdvisory
}));

vi.mock('../api/_lib/weather.js', () => ({
  getCurrentWeather: mocks.getCurrentWeather,
  getForecast: mocks.getForecast,
  geocodeCity: mocks.geocodeCity,
  deriveAlerts: mocks.deriveAlerts,
  summarizeWeather: mocks.summarizeWeather
}));

vi.mock('../api/_lib/gemini.js', () => ({
  generatePreparednessPlan: mocks.generatePreparednessPlan,
  generateTravelAdvisory: mocks.generateTravelAdvisory
}));

import planHandler from '../api/plan.js';
import advisoryHandler from '../api/advisory.js';
import { signToken } from '../api/_lib/auth.js';

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; }
  };
}

function authenticatedRequest(body = {}, method = 'POST') {
  const token = signToken({ id: 'user-1', email: 'person@example.com', name: 'Person' });
  return { method, body, headers: { authorization: `Bearer ${token}` } };
}

const profile = {
  location: { lat: 19.076, lon: 72.878 },
  homeType: 'Apartment (upper floor)',
  floodProne: 'No',
  familySize: 2,
  medicalConditions: 'None',
  hasVehicle: 'Yes',
  hasBackupPower: 'Yes',
  language: 'English'
};
const current = { weather: [{ main: 'Rain' }], main: { temp: 28 } };
const forecast = [{ weather: [{ main: 'Rain' }] }];
const weatherSummary = { condition: 'Rain', temp: 28, location: 'Mumbai' };

beforeAll(() => {
  process.env.JWT_SECRET = 'integration-test-secret-is-at-least-32-characters';
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getProfile.mockResolvedValue(profile);
  mocks.getCurrentWeather.mockResolvedValue(current);
  mocks.getForecast.mockResolvedValue(forecast);
  mocks.deriveAlerts.mockReturnValue([{ severity: 'watch', message: 'Heavy rain expected' }]);
  mocks.summarizeWeather.mockReturnValue(weatherSummary);
  mocks.geocodeCity.mockResolvedValue({ lat: 18.52, lon: 73.86, name: 'Pune', country: 'IN' });
});

describe('preparedness plan route', () => {
  it('combines profile, weather, gaps, and generated content before saving', async () => {
    const generated = { summary: 'Prepare for rain', riskLevel: 'moderate' };
    mocks.generatePreparednessPlan.mockResolvedValue(generated);
    const req = authenticatedRequest();
    const res = responseRecorder();

    await planHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(mocks.generatePreparednessPlan).toHaveBeenCalledWith(
      profile,
      weatherSummary,
      [{ severity: 'watch', message: 'Heavy rain expected' }],
      'English',
      []
    );
    expect(res.body.plan).toMatchObject({
      summary: 'Prepare for rain',
      weatherSnapshot: weatherSummary,
      currentAlerts: [{ severity: 'watch' }],
      dataGaps: []
    });
    expect(mocks.savePlan).toHaveBeenCalledWith('user-1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), res.body.plan);
  });

  it('rejects unauthenticated generation before calling dependencies', async () => {
    const res = responseRecorder();

    await planHandler({ method: 'POST', body: {}, headers: {} }, res);

    expect(res.statusCode).toBe(401);
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it('returns an empathetic error and does not save when generation fails', async () => {
    mocks.generatePreparednessPlan.mockRejectedValue(new Error('model unavailable'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = responseRecorder();

    await planHandler(authenticatedRequest(), res);

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe('Preparedness plan generation failed. Please try again.');
    expect(mocks.savePlan).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('travel advisory route', () => {
  it('geocodes the destination, generates an advisory, enriches it, and saves it', async () => {
    mocks.generateTravelAdvisory.mockResolvedValue({ recommendation: 'proceed_with_caution', summary: 'Allow extra time' });
    const trip = { destinationCity: 'Pune', destinationState: '', destinationCountry: 'India', travelDate: '2026-07-15', mode: 'Train', notes: '' };
    const res = responseRecorder();

    await advisoryHandler(authenticatedRequest(trip), res);

    expect(res.statusCode).toBe(200);
    expect(mocks.geocodeCity).toHaveBeenCalledWith('Pune', '', 'India');
    expect(res.body.advisory).toMatchObject({
      recommendation: 'proceed_with_caution',
      weatherSnapshot: { ...weatherSummary, resolvedName: 'Pune', resolvedCountry: 'IN' }
    });
    expect(mocks.saveAdvisory).toHaveBeenCalledWith('user-1', trip, res.body.advisory);
  });

  it('validates the destination before weather or AI calls', async () => {
    const res = responseRecorder();

    await advisoryHandler(authenticatedRequest({}), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Destination city is required');
    expect(mocks.geocodeCity).not.toHaveBeenCalled();
    expect(mocks.generateTravelAdvisory).not.toHaveBeenCalled();
  });
});
