# ⛈️ MonsoonGuard

MonsoonGuard is a GenAI-powered monsoon preparedness and citizen assistance app. It turns a household's location, living situation, and vulnerabilities into a concrete, personalized plan for surviving monsoon season — not generic "keep an umbrella handy" advice, but a plan shaped by live weather data and the specific people in that household.

Built for the **PromptWars — Monsoon Preparedness & Citizen Assistance** challenge: help individuals, families, and communities prepare for the monsoon season using GenAI-driven personalized guidance, checklists, travel advisories, safety recommendations, multilingual assistance, and real-time alerts, before, during, and after severe weather.

## What it does

**Household profile.** After signing up (email/password or Google), a 3-step onboarding captures what actually matters for preparedness:

1. **Location & home** — city/state/country (geocoded automatically), home type (apartment vs. ground floor vs. independent house vs. informal settlement), and whether the area is known to flood
2. **Household** — family size, elderly members, children, anyone with mobility/accessibility needs, chronic medical conditions, pets/livestock, vehicle access, backup power
3. **Preferences** — preferred language for all plans and alerts (English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati), and a phone number for future alert delivery

**Live weather awareness.** The dashboard pulls real-time conditions and a 24-hour forecast for the user's saved location (OpenWeatherMap), and derives plain-language alerts from rainfall and wind thresholds — heavy rain happening now, strong winds expected in the next 24 hours, and so on. This isn't decorative: every generated plan is grounded in this same live data, not a static template.

**Personalized preparedness plans.** On request, the household profile plus live weather is sent to Gemini, which returns a structured plan:

- **Risk level** (low/moderate/high/severe) and a plain-language summary
- **Immediate actions** to take right now, given current conditions
- **Emergency checklist** — specific items (not "emergency kit" but named supplies and quantities), each tagged critical/recommended/optional with the reasoning
- **Documents to secure** and **emergency contacts to save**
- **Home safety tips** and **health precautions**, adapted to the home type and flood risk
- **Evacuation guidance**, with explicit callouts for vulnerable household members (elderly, children, mobility needs, pets/livestock) when relevant
- An automatic note to consult authorities/medical professionals where appropriate

Every plan is saved so it can be reviewed later without regenerating.

**Travel advisories.** Before a trip, a user enters a destination, date, and mode of travel. The app geocodes the destination, pulls its live weather, and asks Gemini for a clear recommendation — proceed, proceed with caution, delay, or avoid — along with route-specific concerns, a packing list, and alternate suggestions if the trip looks risky.

**Multilingual by default.** Every plan and advisory is generated directly in the household's preferred language (not machine-translated after the fact), so guidance reads naturally rather than like a translated document.

**Transparent about what it doesn't know.** Before generating a plan, the app checks the household profile for gaps — missing backup power info, an unconfirmed flood risk, an unset household size — and tells the model exactly what's unknown. The plan comes back with an explicit **Assumptions & Gaps** section, so a guess is always labeled as a guess instead of presented as fact.

## Why it's different from a generic weather app

- Plans are shaped by *who's in the household*, not just where they are — an elderly parent, a ground-floor apartment, and no vehicle changes what "prepared" actually means.
- Alerts and plans share the same live weather pipeline, so the guidance is never stale or generic.
- Travel advisories give a clear go/no-go recommendation instead of just showing a forecast and leaving the risk assessment to the user.
- Preparedness content is generated in the user's own language from the start, which matters for reaching the people most affected by severe weather.
- Missing information is surfaced, not papered over — the plan tells you what it assumed and why, instead of quietly guessing.

## Test Credentials (For Evaluators)

To test the application end-to-end without signing up, please use the following test credentials:
- **Email:** `evaluator@monsoonguard.com`
- **Password:** `evaluate123`

*(Note for deployment: Please ensure you manually create this account via the sign-up page on your live URL before submitting, so evaluators can use it).*

## Tech stack

- **Frontend**: Vite + vanilla JS SPA (hash router, no framework), dark glassmorphism design system
- **Backend**: Vercel serverless functions (Node.js)
- **Database**: Postgres (Neon), storing accounts, household profiles, generated plans, and travel advisories
- **Weather**: OpenWeatherMap (current conditions, 5-day/3-hour forecast, geocoding)
- **Auth**: JWT sessions via email/password (bcrypt-hashed) or Google Sign-In (Google Identity Services, server-verified ID tokens)
- **AI**: Gemini, called through a single generic client (`api/_lib/geminiClient.js`) that knows nothing about meal plans or advisories — each feature supplies its own prompt (`api/_lib/prompts/`) and response schema (`api/_lib/schemas/`), so adding a new AI-generated feature never means touching the call logic itself

### Design notes

- **Single source of config** (`api/_lib/config.js`) — every module reads env vars through here instead of touching `process.env` directly, so there's one place that knows what's required.
- **Gap-aware prompting** (`api/_lib/profileGaps.js`) — a pure function that computes what's missing from a profile *before* the AI call, so the model is told what it doesn't know rather than being left to infer it silently.

See `.env.example` for required configuration.
