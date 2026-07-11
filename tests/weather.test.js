import { describe, it, expect } from 'vitest';
import { deriveAlerts } from '../api/_lib/weather.js';

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
