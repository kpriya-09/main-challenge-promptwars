import { describe, it, expect } from 'vitest';
import { identifyProfileGaps } from '../api/_lib/profileGaps.js';

describe('identifyProfileGaps', () => {
  it('identifies missing critical fields', () => {
    const profile = {
      location: { lat: 10, lon: 10 },
      // Missing homeType, familySize, etc.
    };
    
    const gaps = identifyProfileGaps(profile);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.some(g => g.includes('home type'))).toBe(true);
    expect(gaps.some(g => g.includes('household size'))).toBe(true);
  });

  it('flags "Not sure" for flood risk as a gap', () => {
    const profile = {
      homeType: 'Apartment (upper floor)',
      familySize: 4,
      medicalConditions: 'None',
      hasVehicle: 'Yes',
      hasBackupPower: 'No',
      floodProne: 'Not sure'
    };
    
    const gaps = identifyProfileGaps(profile);
    expect(gaps.length).toBe(1);
    expect(gaps[0]).toContain('flood risk');
  });

  it('returns empty array when all fields are present', () => {
    const profile = {
      homeType: 'Independent house',
      floodProne: 'No',
      familySize: 2,
      medicalConditions: 'None',
      hasVehicle: 'Yes',
      hasBackupPower: 'Yes'
    };
    
    const gaps = identifyProfileGaps(profile);
    expect(gaps.length).toBe(0);
  });
});
