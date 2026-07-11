import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';
import { renderWeatherTile } from '../components/weatherTile.js';

const RECOMMENDATION_LABELS = {
  proceed: 'Safe to proceed',
  proceed_with_caution: 'Proceed with caution',
  delay: 'Consider delaying',
  avoid: 'Avoid travel'
};
const RECOMMENDATION_RISK = {
  proceed: 'low',
  proceed_with_caution: 'moderate',
  delay: 'high',
  avoid: 'severe'
};

function renderForm(app) {
  app.innerHTML = `
    <div class="glass-card" style="max-width:560px; margin: 0 auto;">
      <h1 style="margin-top:0;">Travel Advisory</h1>
      <p style="color: var(--text-secondary);">Check monsoon-season conditions before you travel.</p>
      <form id="advisory-form">
        <div class="field"><label>Destination city</label><input id="destinationCity" type="text" required /></div>
        <div class="field"><label>State</label><input id="destinationState" type="text" /></div>
        <div class="field"><label>Country</label><input id="destinationCountry" type="text" value="India" /></div>
        <div class="field"><label>Travel date</label><input id="travelDate" type="date" /></div>
        <div class="field">
          <label>Mode of travel</label>
          <select id="mode">
            <option value="">Select...</option>
            <option>Car</option>
            <option>Train</option>
            <option>Flight</option>
            <option>Bus</option>
            <option>Two-wheeler</option>
          </select>
        </div>
        <div class="field"><label>Notes (optional)</label><textarea id="notes" placeholder="e.g. traveling with elderly parent, low-lying route"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block">Get advisory</button>
      </form>
      <div id="result-slot"></div>
    </div>
  `;

  app.querySelector('#advisory-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking conditions...';
    const trip = {
      destinationCity: app.querySelector('#destinationCity').value.trim(),
      destinationState: app.querySelector('#destinationState').value.trim(),
      destinationCountry: app.querySelector('#destinationCountry').value.trim(),
      travelDate: app.querySelector('#travelDate').value,
      mode: app.querySelector('#mode').value,
      notes: app.querySelector('#notes').value.trim()
    };
    try {
      const { advisory } = await api.getAdvisory(trip);
      renderResult(app, advisory);
    } catch (err) {
      showToast(err.message || 'Could not generate advisory', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get advisory';
    }
  });
}

function renderResult(app, advisory) {
  const risk = RECOMMENDATION_RISK[advisory.recommendation] || 'moderate';
  app.innerHTML = `
    <div class="glass-card" style="max-width:640px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <h1 style="margin:0;">Travel Advisory</h1>
        <span class="risk-badge ${risk}">${RECOMMENDATION_LABELS[advisory.recommendation] || advisory.recommendation}</span>
      </div>
      <p>${advisory.summary}</p>
      ${advisory.weatherSnapshot ? renderWeatherTile(advisory.weatherSnapshot) : ''}

      <h2>Route Concerns</h2>
      <ul>${(advisory.routeConcerns || []).map((c) => `<li>${c}</li>`).join('') || '<li>None identified</li>'}</ul>

      <h2>Packing List</h2>
      <ul>${(advisory.packingList || []).map((p) => `<li>${p}</li>`).join('')}</ul>

      <h2>Alternate Suggestions</h2>
      <ul>${(advisory.alternateSuggestions || []).map((s) => `<li>${s}</li>`).join('') || '<li>No alternatives needed</li>'}</ul>

      <button class="btn btn-secondary" id="new-check-btn" style="margin-top:12px;">Check another trip</button>
    </div>
  `;
  app.querySelector('#new-check-btn').addEventListener('click', () => renderForm(app));
}

export function renderAdvisoryPage(app) {
  renderForm(app);
}
