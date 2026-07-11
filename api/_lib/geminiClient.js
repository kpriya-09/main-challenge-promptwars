import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

let client = null;
function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return client;
}

// Use Google's rolling Flash alias so the app does not break when a dated
// model (such as gemini-1.5-flash) is retired. Deployments can still pin a
// specific supported model when needed.
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

/**
 * The only place that calls Gemini. Feature-specific code supplies a
 * prompt string and a response schema; this function doesn't know or
 * care what feature it's serving. Adding a new AI-generated feature
 * means adding a new prompt+schema pair, not modifying this function.
 */
export async function generateStructuredContent(prompt, schema) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema }
  });
  return JSON.parse(response.text);
}
