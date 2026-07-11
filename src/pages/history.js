import { api } from '../utils/api.js';
import { navigate } from '../utils/router.js';

export async function renderHistory(app) {
  app.innerHTML = `<div class="skeleton" style="height:200px;"></div>`;
  const { plans, advisories } = await api.history(50);

  app.innerHTML = `
    <div class="glass-card" style="margin-bottom:20px;">
      <h1 style="margin-top:0;">Plan History</h1>
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
          : '<p style="color: var(--text-secondary);">No past plans yet.</p>'
      }
    </div>

    <div class="glass-card">
      <h1 style="margin-top:0;">Travel Advisories</h1>
      ${
        advisories.length
          ? advisories
              .map(
                (a) => `
        <div class="sub-card">
          <span>${a.trip?.destinationCity || 'Unknown'}</span>
          <span style="color: var(--text-secondary); font-size: 13px;">${a.trip?.travelDate || ''}</span>
          <span class="risk-badge ${a.advisory?.recommendation === 'avoid' ? 'severe' : a.advisory?.recommendation === 'delay' ? 'high' : a.advisory?.recommendation === 'proceed_with_caution' ? 'moderate' : 'low'}" style="margin-left:auto;">${a.advisory?.recommendation || ''}</span>
        </div>`
              )
              .join('')
          : '<p style="color: var(--text-secondary);">No past advisories yet.</p>'
      }
    </div>
  `;

  app.querySelectorAll('[data-plan-id]').forEach((el) => {
    el.addEventListener('click', () => navigate(`#/plan?planId=${el.dataset.planId}`));
  });
}
