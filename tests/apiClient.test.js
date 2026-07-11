import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '../src/utils/api.js';
import { store } from '../src/utils/store.js';

function jsonResponse(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === 'content-type' ? 'application/json' : null },
    json: vi.fn().mockResolvedValue(data)
  };
}

describe('browser API client', () => {
  let values;

  beforeEach(() => {
    values = new Map([['mm.token', 'test-token'], ['mm.user', JSON.stringify({ id: 'user-1' })]]);
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => values.get(key) ?? null),
      setItem: vi.fn((key, value) => values.set(key, value)),
      removeItem: vi.fn((key) => values.delete(key))
    });
    vi.stubGlobal('location', { hash: '#/' });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends an authenticated preparedness-plan request with the expected payload', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { plan: { riskLevel: 'moderate' } }));

    const result = await api.generatePlan({ city: 'Mumbai' });

    expect(fetch).toHaveBeenCalledWith('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ profile: { city: 'Mumbai' } })
    });
    expect(result.plan.riskLevel).toBe('moderate');
  });

  it('surfaces server errors without losing their status code', async () => {
    fetch.mockResolvedValue(jsonResponse(502, { error: 'Plan service is temporarily unavailable' }));

    await expect(api.generatePlan()).rejects.toMatchObject({
      name: 'Error',
      message: 'Plan service is temporarily unavailable',
      status: 502
    });
  });

  it('clears an expired session and redirects to login after a 401', async () => {
    fetch.mockResolvedValue(jsonResponse(401, { error: 'Invalid or expired token' }));
    const clearSession = vi.spyOn(store, 'clearSession');

    await expect(api.history()).rejects.toBeInstanceOf(ApiError);

    expect(clearSession).toHaveBeenCalledOnce();
    expect(location.hash).toBe('#/login');
  });
});
