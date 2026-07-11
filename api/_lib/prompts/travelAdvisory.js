import { languageInstruction } from './shared.js';

export function buildTravelAdvisoryPrompt(profile, trip, weatherSummary, language) {
  return [
    'You are a travel-safety advisor for monsoon-season conditions in India.',
    'Assess whether the described trip is safe to proceed with, given the weather at the destination and the traveler profile.',
    languageInstruction(language),
    '',
    '## Traveler Profile',
    JSON.stringify(profile, null, 2),
    '',
    '## Trip Details',
    JSON.stringify(trip, null, 2),
    '',
    '## Destination Weather',
    JSON.stringify(weatherSummary, null, 2),
    '',
    'Respond ONLY with JSON matching the required schema.'
  ].join('\n');
}
