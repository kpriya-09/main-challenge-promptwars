const IMPORTANT_FIELDS = [
  { key: 'homeType', label: 'home type' },
  { key: 'floodProne', label: 'flood risk for the area', treatAsGapIfValue: 'Not sure' },
  { key: 'familySize', label: 'household size' },
  { key: 'medicalConditions', label: 'medical conditions' },
  { key: 'hasVehicle', label: 'vehicle access' },
  { key: 'hasBackupPower', label: 'backup power availability' }
];

function isEmpty(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Implements the "transparent gaps" principle: rather than letting the
 * model silently guess at missing household details, we compute what's
 * actually missing/uncertain up front and hand it to the prompt (and the
 * UI) explicitly, so the plan can state its assumptions instead of
 * presenting guesses as facts.
 */
export function identifyProfileGaps(profile) {
  if (!profile) return IMPORTANT_FIELDS.map((f) => `No profile on file yet — ${f.label} is unknown.`);

  return IMPORTANT_FIELDS.filter(
    (f) => isEmpty(profile[f.key]) || (f.treatAsGapIfValue && profile[f.key] === f.treatAsGapIfValue)
  ).map((f) => `${f.label} is not known — the plan should state what it assumed instead of treating a guess as fact.`);
}
