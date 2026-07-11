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
        <div class="field">
          <label>Destination city</label>
          <select id="destinationCity" required>
            <option value="">Select...</option>
            <option>Mumbai</option><option>Delhi</option><option>Bengaluru</option><option>Hyderabad</option><option>Ahmedabad</option><option>Chennai</option><option>Kolkata</option><option>Surat</option><option>Pune</option><option>Jaipur</option><option>Lucknow</option><option>Kanpur</option><option>Nagpur</option><option>Indore</option><option>Thane</option><option>Bhopal</option><option>Visakhapatnam</option><option>Pimpri-Chinchwad</option><option>Patna</option><option>Vadodara</option><option>Ghaziabad</option><option>Ludhiana</option><option>Agra</option><option>Nashik</option><option>Faridabad</option><option>Meerut</option><option>Rajkot</option><option>Kalyan-Dombivli</option><option>Vasai-Virar</option><option>Varanasi</option><option>Srinagar</option><option>Aurangabad</option><option>Dhanbad</option><option>Amritsar</option><option>Navi Mumbai</option><option>Allahabad</option><option>Howrah</option><option>Ranchi</option><option>Gwalior</option><option>Jabalpur</option><option>Coimbatore</option><option>Vijayawada</option><option>Jodhpur</option><option>Madurai</option><option>Raipur</option><option>Kota</option><option>Guwahati</option><option>Chandigarh</option><option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>State</label>
          <select id="destinationState" required>
            <option value="">Select...</option>
            <option>Andaman and Nicobar Islands</option><option>Andhra Pradesh</option><option>Arunachal Pradesh</option><option>Assam</option><option>Bihar</option><option>Chandigarh</option><option>Chhattisgarh</option><option>Dadra and Nagar Haveli</option><option>Delhi</option><option>Goa</option><option>Gujarat</option><option>Haryana</option><option>Himachal Pradesh</option><option>Jammu and Kashmir</option><option>Jharkhand</option><option>Karnataka</option><option>Kerala</option><option>Ladakh</option><option>Lakshadweep</option><option>Madhya Pradesh</option><option>Maharashtra</option><option>Manipur</option><option>Meghalaya</option><option>Mizoram</option><option>Nagaland</option><option>Odisha</option><option>Puducherry</option><option>Punjab</option><option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option><option>Telangana</option><option>Tripura</option><option>Uttar Pradesh</option><option>Uttarakhand</option><option>West Bengal</option>
          </select>
        </div>
        <div class="field">
          <label>Country</label>
          <select id="destinationCountry" required>
            <option>India</option>
          </select>
        </div>
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
