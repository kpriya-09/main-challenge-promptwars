import { generateStructuredContent } from './geminiClient.js';
import { PREPAREDNESS_PLAN_SCHEMA } from './schemas/preparednessPlan.js';
import { TRAVEL_ADVISORY_SCHEMA } from './schemas/travelAdvisory.js';
import { buildPreparednessPlanPrompt } from './prompts/preparednessPlan.js';
import { buildTravelAdvisoryPrompt } from './prompts/travelAdvisory.js';

export async function generatePreparednessPlan(profile, weatherSummary, alerts, language, gaps) {
  const prompt = buildPreparednessPlanPrompt(profile, weatherSummary, alerts, language, gaps);
  return generateStructuredContent(prompt, PREPAREDNESS_PLAN_SCHEMA);
}

export async function generateTravelAdvisory(profile, trip, weatherSummary, language) {
  const prompt = buildTravelAdvisoryPrompt(profile, trip, weatherSummary, language);
  return generateStructuredContent(prompt, TRAVEL_ADVISORY_SCHEMA);
}
