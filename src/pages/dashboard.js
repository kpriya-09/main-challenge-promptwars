import { api } from '../utils/api.js';
import { store } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { renderWeatherTile, renderAlertBanners } from '../components/weatherTile.js';

const PROFILE_FIELDS_TOTAL = 12;

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export async function renderDashboard(app) {
  const user = store.getUser();
  app.innerHTML = `<div class="skeleton" style="height: 300px;"></div>`;

  const [profileRes, historyRes] = await Promise.all([
    api.getProfile().catch(() => ({ profile: null })),
    api.history(5).catch(() => ({ plans: [], advisories: [] }))
  ]);
  const profile = profileRes.profile;
  const plans = historyRes.plans || [];

  let weatherBlock = '';
  if (profile?.location) {
    try {
      const { weather, alerts } = await api.getAlerts();
      weatherBlock = `
        <div class="grid cols-2" style="margin-bottom:20px;">
          <div>${renderWeatherTile(weather)}</div>
          <div>${renderAlertBanners(alerts)}</div>
        </div>
      `;
    } catch {
      weatherBlock = '<p style="color: var(--text-secondary);">Could not load live weather right now.</p>';
    }
  }

  const filled = profile ? Object.values(profile).filter((v) => v !== '' && v != null && !(Array.isArray(v) && v.length === 0)).length : 0;
  const completion = Math.min(100, Math.round((filled / PROFILE_FIELDS_TOTAL) * 100));
  const lastPlan = plans[0];
  const lastGap = lastPlan ? daysSince(lastPlan.createdAt) : null;

  app.innerHTML = `
    <div class="glass-card" style="margin-bottom: 20px;">
      <h1 style="margin-top:0;">Namaste, ${user?.name?.split(' ')[0] || 'there'}</h1>
      <p style="color: var(--text-secondary);">Here's your monsoon readiness at a glance.</p>
      ${
        profile
          ? `<div class="progress-meter" style="margin: 12px 0 6px;"><div class="fill" style="width:${completion}%"></div></div>
             <div style="font-size: 13px; color: var(--text-secondary);">Profile ${completion}% complete</div>`
          : `<div class="error-banner">Complete your household profile to get weather alerts and a preparedness plan.</div>
             <button class="btn btn-primary" id="onboard-btn">Complete profile</button>`
      }
    </div>

    ${weatherBlock}

    <div class="grid cols-3" style="margin-bottom: 20px;">
      <div class="stat-tile"><div class="label">Risk level</div><div class="value">${lastPlan?.plan?.riskLevel ?? '—'}</div></div>
      <div class="stat-tile"><div class="label">Days since last plan</div><div class="value">${lastGap ?? '—'}</div></div>
      <div class="stat-tile"><div class="label">Household size</div><div class="value">${profile?.familySize ?? '—'}</div></div>
    </div>

    <div style="display:flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
      <button class="btn btn-primary" id="generate-btn">Generate preparedness plan</button>
      <button class="btn btn-secondary" id="advisory-btn">Travel advisory</button>
      <button class="btn btn-secondary" id="edit-profile-btn">${profile ? 'Update profile' : 'Complete profile'}</button>
    </div>

    <div class="glass-card">
      <h2 style="margin-top:0;">Recent plans</h2>
      ${
        plans.length
          ? plans
              .map(
                (p) => `
        <div class="sub-card" style="cursor:pointer;" data-plan-id="${p.id}">
          <span>${p.planDate}</span>
          <span class="risk-badge ${p.plan?.riskLevel || 'low'}">${p.plan?.riskLevel || 'n/a'}</span>
          <span style="color: var(--text-secondary); font-size: 13px; margin-left:auto;">View →</span>
        </div>`
              )
              .join('')
          : '<p style="color: var(--text-secondary);">No plans yet. Generate your first one!</p>'
      }
    </div>
  `;

  app.querySelector('#onboard-btn')?.addEventListener('click', () => navigate('#/onboarding'));
  app.querySelector('#generate-btn').addEventListener('click', () => navigate('#/plan?generate=1'));
  app.querySelector('#advisory-btn').addEventListener('click', () => navigate('#/advisory'));
  app.querySelector('#edit-profile-btn').addEventListener('click', () => navigate('#/onboarding'));
  app.querySelectorAll('[data-plan-id]').forEach((el) => {
    el.addEventListener('click', () => navigate(`#/plan?planId=${el.dataset.planId}`));
  });
}
