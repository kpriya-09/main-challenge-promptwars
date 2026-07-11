import { api } from '../utils/api.js';
import { navigate } from '../utils/router.js';
import { showToast } from '../utils/toast.js';
import { renderChecklist } from '../components/checklist.js';
import { renderWeatherTile } from '../components/weatherTile.js';

function parseQuery() {
  const [, query = ''] = location.hash.split('?');
  return Object.fromEntries(new URLSearchParams(query));
}

function renderPlan(app, plan) {
  app.innerHTML = `
    <div class="glass-card" style="margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <h1 style="margin:0;">Your Preparedness Plan</h1>
        <span class="risk-badge ${plan.riskLevel}">${plan.riskLevel} risk</span>
      </div>
      <p>${plan.summary}</p>
      ${plan.weatherSnapshot ? renderWeatherTile(plan.weatherSnapshot) : ''}
    </div>

    ${
      plan.assumptions?.length || plan.dataGaps?.length
        ? `<div class="glass-card" style="margin-bottom:20px;">
             <h2 style="margin-top:0;">Assumptions &amp; Gaps</h2>
             <p style="color: var(--text-secondary); font-size:13px;">This plan is only as good as the profile behind it. Here's what was missing or assumed, so you know what to double-check.</p>
             ${plan.assumptions?.length ? `<ul>${plan.assumptions.map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}
             ${plan.dataGaps?.length ? plan.dataGaps.map((g) => `<div class="alert-banner advisory">${g}</div>`).join('') : ''}
           </div>`
        : ''
    }

    <div class="glass-card" style="margin-bottom:20px;">
      <h2 style="margin-top:0;">Immediate Actions</h2>
      <ul>${(plan.immediateActions || []).map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>

    <div class="glass-card" style="margin-bottom:20px;">
      <h2 style="margin-top:0;">Emergency Checklist</h2>
      ${renderChecklist(plan.emergencyChecklist)}
    </div>

    <div class="grid cols-2" style="margin-bottom:20px;">
      <div class="glass-card">
        <h2 style="margin-top:0;">Documents to Secure</h2>
        <ul>${(plan.documentsToSecure || []).map((d) => `<li>${d}</li>`).join('')}</ul>
      </div>
      <div class="glass-card">
        <h2 style="margin-top:0;">Emergency Contacts to Save</h2>
        <ul>${(plan.emergencyContactsToSave || []).map((c) => `<li>${c}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="grid cols-2" style="margin-bottom:20px;">
      <div class="glass-card">
        <h2 style="margin-top:0;">Home Safety Tips</h2>
        <ul>${(plan.homeSafetyTips || []).map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="glass-card">
        <h2 style="margin-top:0;">Health Precautions</h2>
        <ul>${(plan.healthPrecautions || []).map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="glass-card" style="margin-bottom:20px;">
      <h2 style="margin-top:0;">Evacuation Guidance</h2>
      <p>${plan.evacuationGuidance || 'No evacuation concerns identified for your area.'}</p>
      ${plan.vulnerableMembersNotes ? `<div class="alert-banner advisory">${plan.vulnerableMembersNotes}</div>` : ''}
    </div>

    <div class="action-bar" style="display:flex; gap:12px; flex-wrap:wrap;">
      <button class="btn btn-secondary" id="print-btn">Download / Print</button>
      <button class="btn btn-primary" id="regenerate-btn">Regenerate plan</button>
    </div>
  `;

  app.querySelector('#print-btn').addEventListener('click', () => window.print());
  app.querySelector('#regenerate-btn').addEventListener('click', () => navigate('#/plan?generate=1'));
}

function renderLoading(app) {
  app.innerHTML = `
    <div class="glass-card">
      <h2 style="margin-top:0;">Building your preparedness plan…</h2>
      <div class="skeleton" style="height:24px; margin-bottom:12px;"></div>
      <div class="skeleton" style="height:120px; margin-bottom:12px;"></div>
      <div class="skeleton" style="height:120px;"></div>
    </div>
  `;
}

export async function renderPlanPage(app) {
  const { generate, planId } = parseQuery();
  renderLoading(app);

  try {
    if (planId) {
      const { plans } = await api.history(50);
      const found = plans.find((p) => String(p.id) === String(planId));
      if (!found) {
        showToast('Plan not found', 'error');
        navigate('#/');
        return;
      }
      renderPlan(app, found.plan);
      return;
    }

    if (generate) {
      const { plan } = await api.generatePlan();
      renderPlan(app, plan);
      return;
    }

    const { plans } = await api.history(1);
    if (plans[0]) {
      renderPlan(app, plans[0].plan);
    } else {
      navigate('#/plan?generate=1');
    }
  } catch (err) {
    app.innerHTML = `<div class="glass-card"><div class="error-banner">${err.message || 'Could not load your preparedness plan.'}</div>
      <button class="btn btn-primary" id="retry-btn" style="margin-top:12px;">Try again</button></div>`;
    app.querySelector('#retry-btn')?.addEventListener('click', () => navigate('#/plan?generate=1'));
  }
}
