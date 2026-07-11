/**
 * Single source of truth for environment configuration. Every other
 * module reads config through here instead of touching process.env
 * directly, so there's one place that knows what's required and one
 * place to update if an env var name ever changes.
 */
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  get jwtSecret() {
    const value = required('JWT_SECRET');
    if (value.length < 16) throw new Error('JWT_SECRET must be at least 16 characters');
    return value;
  },
  get databaseUrl() {
    return required('DATABASE_URL');
  },
  get geminiApiKey() {
    return required('GEMINI_API_KEY');
  },
  get openWeatherApiKey() {
    return required('OPENWEATHER_API_KEY');
  },
  get googleClientId() {
    return required('GOOGLE_CLIENT_ID');
  }
};
