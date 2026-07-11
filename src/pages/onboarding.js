import { api } from '../utils/api.js';
import { onboardingDraft } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { renderStepIndicator } from '../components/stepIndicator.js';
import { showToast } from '../utils/toast.js';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Other'];
const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const STEPS = [
  {
    title: 'Where should we keep watch?',
    intro: 'Your location and home type help us spot waterlogging and evacuation risks. We only use this to personalize your safety plan.',
    reassurance: 'About 45 seconds',
    fields: [
      { key: 'city', label: 'City or town', type: 'select', options: CITIES, required: true, autocomplete: 'address-level2' },
      { key: 'state', label: 'State or union territory', type: 'select', options: STATES, required: true, autocomplete: 'address-level1' },
      { key: 'country', label: 'Country', type: 'select', options: ['India'], required: true, autocomplete: 'country-name' },
      { key: 'homeType', label: 'Which looks most like your home?', type: 'radio', options: ['Apartment (upper floor)', 'Apartment (ground floor)', 'Independent house', 'Informal settlement'], required: true, layout: 'cards' },
      { key: 'floodProne', label: 'Does water collect near your home?', help: '“Not sure” is completely fine—we will clearly label that assumption.', type: 'radio', options: ['Yes', 'No', 'Not sure'], required: true }
    ]
  },
  {
    title: 'Who are we planning for?',
    intro: 'A few taps help us prioritize medicine, mobility, children, and pets without making you describe your whole household.',
    reassurance: 'No sensitive details required',
    fields: [
      { key: 'familySize', label: 'People at home', type: 'number', required: true, min: 1, defaultValue: 1 },
      { key: 'elderlyCount', label: 'Adults aged 65+', type: 'number', min: 0, defaultValue: 0 },
      { key: 'childrenCount', label: 'Children under 12', type: 'number', min: 0, defaultValue: 0 },
      { key: 'accessibilityNeeds', label: 'Does anyone need mobility or accessibility support?', type: 'radio', options: ['Yes', 'No'] },
      { key: 'medicalConditions', label: 'Health needs we should plan around', help: 'Optional. Broad terms such as “diabetes” or “asthma” are enough.', type: 'textarea', optional: true },
      { key: 'petsLivestock', label: 'Pets or livestock', type: 'tags', help: 'Optional. For example: dog, two goats.', optional: true },
      { key: 'hasVehicle', label: 'Access to a vehicle?', type: 'radio', options: ['Yes', 'No'], optional: true },
      { key: 'hasBackupPower', label: 'Generator, inverter, or battery backup?', type: 'radio', options: ['Yes', 'No'], optional: true }
    ]
  },
  {
    title: 'Make the plan feel like yours',
    intro: 'Choose the language that feels easiest in a stressful moment. Your plan will be written in it from the start.',
    reassurance: 'Last step',
    fields: [
      { key: 'language', label: 'Plan language', type: 'radio', options: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati'], required: true, layout: 'language' },
      { key: 'phone', label: 'Mobile number', help: 'Optional. Reserved for future safety alerts; we will not send marketing messages.', type: 'tel', autocomplete: 'tel', optional: true }
    ]
  }
];

const OPTION_DETAILS = {
  'Apartment (upper floor)': ['Upper floor', 'Lower direct flood exposure'],
  'Apartment (ground floor)': ['Ground floor', 'Earlier move-out guidance'],
  'Independent house': ['House', 'Roof, drainage, and power checks'],
  'Informal settlement': ['Lightweight home', 'Shelter and evacuation focus'],
  Yes: ['Yes', 'We’ll add extra precautions'],
  No: ['No', 'Keep the plan streamlined'],
  'Not sure': ['Not sure', 'We’ll plan cautiously']
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selectTemplate(field, value) {
  return `<select id="${field.key}" name="${field.key}" ${field.required ? 'required' : ''} ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''}>
    <option value="">Choose ${escapeHtml(field.label.toLowerCase())}</option>
    ${field.options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
  </select>`;
}

function radioTemplate(field, value) {
  const details = field.options.map((option, index) => {
    const [title, description] = OPTION_DETAILS[option] || [option, ''];
    const id = `${field.key}-${index}`;
    return `<div class="choice-option">
      <input class="choice-input" type="radio" id="${id}" name="${field.key}" value="${escapeHtml(option)}" ${value === option ? 'checked' : ''} ${field.required ? 'required' : ''} />
      <label class="choice-card" for="${id}">
        <span class="choice-mark" aria-hidden="true"></span>
        <span><strong>${escapeHtml(title)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ''}</span>
      </label>
    </div>`;
  }).join('');
  return `<fieldset class="field fieldset-field">
    <legend>${escapeHtml(field.label)}${field.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</legend>
    ${field.help ? `<p class="field-help" id="${field.key}-help">${escapeHtml(field.help)}</p>` : ''}
    <div class="choice-grid ${field.layout ? `choice-grid-${field.layout}` : ''}">${details}</div>
  </fieldset>`;
}

function numberTemplate(field, value) {
  const amount = value === '' || value == null ? field.defaultValue : value;
  return `<div class="number-stepper">
    <button type="button" class="stepper-btn" data-step="-1" aria-label="Decrease ${escapeHtml(field.label)}">−</button>
    <input id="${field.key}" name="${field.key}" type="number" value="${escapeHtml(amount)}" min="${field.min ?? 0}" inputmode="numeric" ${field.required ? 'required' : ''} aria-label="${escapeHtml(field.label)}" />
    <button type="button" class="stepper-btn" data-step="1" aria-label="Increase ${escapeHtml(field.label)}">+</button>
  </div>`;
}

function renderField(field, value) {
  if (field.type === 'radio') return radioTemplate(field, value);

  let control = '';
  if (field.type === 'select') control = selectTemplate(field, value);
  else if (field.type === 'number') control = numberTemplate(field, value);
  else if (field.type === 'textarea') control = `<textarea id="${field.key}" name="${field.key}" aria-describedby="${field.key}-help">${escapeHtml(value)}</textarea>`;
  else if (field.type === 'tags') control = `<input id="${field.key}" name="${field.key}" type="text" value="${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}" placeholder="Dog, two goats" aria-describedby="${field.key}-help" />`;
  else control = `<input id="${field.key}" name="${field.key}" type="${field.type}" value="${escapeHtml(value)}" ${field.required ? 'required' : ''} ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''} ${field.help ? `aria-describedby="${field.key}-help"` : ''} />`;

  return `<div class="field ${field.type === 'number' ? 'field-count' : ''}">
    <label for="${field.key}">${escapeHtml(field.label)}${field.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : '<span class="optional-label">Optional</span>'}</label>
    ${field.help ? `<p class="field-help" id="${field.key}-help">${escapeHtml(field.help)}</p>` : ''}
    ${control}
  </div>`;
}

function collectStep(form, step) {
  const patch = {};
  for (const field of step.fields) {
    if (field.type === 'radio') patch[field.key] = form.querySelector(`input[name="${field.key}"]:checked`)?.value || '';
    else if (field.type === 'tags') patch[field.key] = form.elements[field.key].value.split(',').map((item) => item.trim()).filter(Boolean);
    else patch[field.key] = form.elements[field.key].value;
  }
  return patch;
}

function renderStep(container, stepIndex, draft) {
  const step = STEPS[stepIndex];
  const standardFields = step.fields.filter((field) => !field.optional);
  const optionalFields = step.fields.filter((field) => field.optional);

  container.innerHTML = `
    <section class="onboarding-shell" aria-labelledby="onboarding-title">
      ${renderStepIndicator(STEPS.length, stepIndex, STEPS.map((item) => item.title))}
      <div class="wizard-heading">
        <div>
          <p class="eyebrow">Quick safety setup</p>
          <h1 id="onboarding-title" tabindex="-1">${escapeHtml(step.title)}</h1>
          <p class="wizard-intro">${escapeHtml(step.intro)}</p>
        </div>
        <span class="time-pill">${escapeHtml(step.reassurance)}</span>
      </div>
      <form id="step-form" novalidate>
        <div class="wizard-fields ${stepIndex === 1 ? 'count-grid' : ''}">
          ${standardFields.map((field) => renderField(field, draft[field.key])).join('')}
        </div>
        ${optionalFields.length ? `<details class="optional-panel" ${optionalFields.some((field) => draft[field.key] && (!Array.isArray(draft[field.key]) || draft[field.key].length)) ? 'open' : ''}>
          <summary><span>Add details for a smarter plan</span><small>Optional · health, pets, transport, power</small></summary>
          <div class="optional-fields">${optionalFields.map((field) => renderField(field, draft[field.key])).join('')}</div>
        </details>` : ''}
        <div id="form-error" class="form-error" role="alert" hidden>Please complete the highlighted choices before continuing.</div>
        <div class="wizard-actions">
          ${stepIndex > 0 ? '<button type="button" id="back-btn" class="btn btn-secondary">Back</button>' : '<span></span>'}
          <button type="submit" class="btn btn-primary">${stepIndex === STEPS.length - 1 ? 'Create my safety plan' : 'Continue'}</button>
        </div>
        <p class="save-note">Your progress is saved on this device.</p>
      </form>
    </section>`;

  container.querySelectorAll('.number-stepper').forEach((stepper) => {
    const input = stepper.querySelector('input');
    stepper.querySelectorAll('.stepper-btn').forEach((button) => button.addEventListener('click', () => {
      const minimum = Number(input.min || 0);
      input.value = Math.max(minimum, Number(input.value || minimum) + Number(button.dataset.step));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }));
  });

  const form = container.querySelector('#step-form');
  form.addEventListener('change', () => onboardingDraft.patch(collectStep(form, step)));

  container.querySelector('#back-btn')?.addEventListener('click', () => {
    onboardingDraft.patch(collectStep(form, step));
    renderStep(container, stepIndex - 1, onboardingDraft.get());
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = container.querySelector('#form-error');
    if (!form.checkValidity()) {
      error.hidden = false;
      form.querySelector(':invalid')?.focus();
      return;
    }
    error.hidden = true;
    const updated = onboardingDraft.patch(collectStep(form, step));

    if (stepIndex < STEPS.length - 1) {
      renderStep(container, stepIndex + 1, updated);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating your plan…';
    try {
      await api.saveProfile(updated);
      onboardingDraft.clear();
      showToast('Your household profile is ready.');
      navigate('#/plan?generate=1');
    } catch (error) {
      showToast(error.message || 'We could not save your profile. Your answers are still here.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Create my safety plan';
    }
  });

  requestAnimationFrame(() => container.querySelector('#onboarding-title')?.focus());
}

export async function renderOnboarding(app) {
  app.innerHTML = '<div class="onboarding-card"><div class="skeleton" style="height:360px"></div></div>';
  let draft = onboardingDraft.get();
  if (!Object.keys(draft).length) {
    try {
      const { profile } = await api.getProfile();
      if (profile) draft = onboardingDraft.patch(profile);
    } catch {
      // A new user may not have a profile yet; the wizard still works normally.
    }
  }
  renderStep(app.querySelector('.onboarding-card'), 0, draft);
}
