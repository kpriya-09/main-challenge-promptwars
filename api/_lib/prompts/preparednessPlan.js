import { languageInstruction, gapsInstruction } from './shared.js';

export function buildPreparednessPlanPrompt(profile, weatherSummary, alerts, language, gaps) {
  return [
    'You are a disaster-preparedness advisor helping a household get ready for monsoon-season weather in India.',
    'Use the household profile and current/forecast weather to produce a specific, actionable preparedness plan.',
    'Pay special attention to vulnerable household members (elderly, children, disabled, chronic medical conditions, pets/livestock) and to whether the home is flood-prone or on a ground floor.',
    languageInstruction(language),
    gapsInstruction(gaps),
    '',
    '## Household Profile',
    JSON.stringify(profile, null, 2),
    '',
    '## Current & Forecast Weather',
    JSON.stringify(weatherSummary, null, 2),
    '',
    '## Derived Alerts',
    JSON.stringify(alerts, null, 2),
    '',
    'Respond ONLY with JSON matching the required schema. Be concrete (e.g. name specific documents, specific quantities of water/supplies) rather than generic.'
  ].join('\n');
}
