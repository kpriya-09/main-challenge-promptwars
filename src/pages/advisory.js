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
    <div class="glass-card travel-card">
      <p class="eyebrow">Quick travel check</p>
      <h1 style="margin:5px 0 8px;">Is it safe to go?</h1>
      <p class="wizard-intro">Tell us where you’re headed. We’ll combine live weather with your household needs and give you a clear recommendation.</p>
      <form id="advisory-form">
        <div class="field">
          <label for="destinationCity">Destination city</label>
          <select id="destinationCity" required>
            <option value="">Select...</option>
            <option>Mumbai</option><option>Delhi</option><option>Bengaluru</option><option>Hyderabad</option><option>Ahmedabad</option><option>Chennai</option><option>Kolkata</option><option>Surat</option><option>Pune</option><option>Jaipur</option><option>Lucknow</option><option>Kanpur</option><option>Nagpur</option><option>Indore</option><option>Thane</option><option>Bhopal</option><option>Visakhapatnam</option><option>Pimpri-Chinchwad</option><option>Patna</option><option>Vadodara</option><option>Ghaziabad</option><option>Ludhiana</option><option>Agra</option><option>Nashik</option><option>Faridabad</option><option>Meerut</option><option>Rajkot</option><option>Kalyan-Dombivli</option><option>Vasai-Virar</option><option>Varanasi</option><option>Srinagar</option><option>Aurangabad</option><option>Dhanbad</option><option>Amritsar</option><option>Navi Mumbai</option><option>Allahabad</option><option>Howrah</option><option>Ranchi</option><option>Gwalior</option><option>Jabalpur</option><option>Coimbatore</option><option>Vijayawada</option><option>Jodhpur</option><option>Madurai</option><option>Raipur</option><option>Kota</option><option>Guwahati</option><option>Chandigarh</option><option>Other</option>
          </select>
        </div>
        <input id="destinationState" type="hidden" value="" />
        <input id="destinationCountry" type="hidden" value="India" />
        <div class="field"><label for="travelDate">Travel date <span class="optional-label">Optional</span></label><input id="travelDate" name="travelDate" type="date" /></div>
        <fieldset class="field fieldset-field">
          <legend>How are you travelling? <span class="optional-label">Optional</span></legend>
          <div class="choice-grid travel-mode-grid">
            ${['Car', 'Train', 'Flight', 'Bus', 'Two-wheeler'].map((mode, index) => `<div class="choice-option"><input class="choice-input" type="radio" id="mode-${index}" name="mode" value="${mode}" /><label class="choice-card" for="mode-${index}"><span class="choice-mark" aria-hidden="true"></span><strong>${mode}</strong></label></div>`).join('')}
          </div>
        </fieldset>
        <details class="optional-panel travel-details">
          <summary><span>Add a note</span><small>Optional · companions, accessibility, or route concerns</small></summary>
          <div class="optional-fields"><div class="field"><label for="notes">Anything we should plan around?</label><textarea id="notes" name="notes" placeholder="For example: travelling with an older parent"></textarea></div></div>
        </details>
        <button type="submit" class="btn btn-primary btn-block">Check my trip</button>
        <p class="save-note">Usually ready in under a minute.</p>
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
      mode: app.querySelector('input[name="mode"]:checked')?.value || '',
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
