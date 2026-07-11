import { api } from '../utils/api.js';
import { onboardingDraft } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { renderStepIndicator } from '../components/stepIndicator.js';
import { showToast } from '../utils/toast.js';

const STEPS = [
  {
    title: 'Location & Home',
    fields: [
      { key: 'city', label: 'City / Town', type: 'text', required: true },
      { key: 'state', label: 'State', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
      { key: 'homeType', label: 'Home type', type: 'select', options: ['Apartment (upper floor)', 'Apartment (ground floor)', 'Independent house', 'Informal settlement'], required: true },
      { key: 'floodProne', label: 'Is your area known to flood or waterlog?', type: 'radio', options: ['Yes', 'No', 'Not sure'], required: true }
    ]
  },
  {
    title: 'Household',
    fields: [
      { key: 'familySize', label: 'Number of people in household', type: 'number', required: true },
      { key: 'elderlyCount', label: 'Elderly members (65+)', type: 'number' },
      { key: 'childrenCount', label: 'Children (under 12)', type: 'number' },
      { key: 'accessibilityNeeds', label: 'Anyone with mobility/accessibility needs?', type: 'radio', options: ['Yes', 'No'] },
      { key: 'medicalConditions', label: 'Chronic medical conditions in household (if any)', type: 'textarea' },
      { key: 'petsLivestock', label: 'Pets / livestock (comma-separated)', type: 'tags' },
      { key: 'hasVehicle', label: 'Household has access to a vehicle', type: 'radio', options: ['Yes', 'No'] },
      { key: 'hasBackupPower', label: 'Backup power (generator/inverter)', type: 'radio', options: ['Yes', 'No'] }
    ]
  },
  {
    title: 'Preferences',
    fields: [
      {
        key: 'language',
        label: 'Preferred language for plans and alerts',
        type: 'select',
        options: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati'],
        required: true
      },
      { key: 'phone', label: 'Mobile number (for future alert notifications)', type: 'tel' }
    ]
  }
];

function fieldTemplate(field, value) {
  const v = value ?? '';
  switch (field.type) {
    case 'select':
      return `<select id="${field.key}">
        <option value="">Select...</option>
        ${field.options.map((o) => `<option value="${o}" ${v === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>`;
    case 'radio':
      return `<div class="radio-group" data-key="${field.key}">
        ${field.options
          .map((o) => `<div class="chip ${v === o ? 'selected' : ''}" data-value="${o}">${o}</div>`)
          .join('')}
      </div>`;
    case 'textarea':
      return `<textarea id="${field.key}">${v}</textarea>`;
    case 'tags':
      return `<input id="${field.key}" type="text" value="${Array.isArray(v) ? v.join(', ') : v}" placeholder="e.g. dog, chickens" />`;
    default:
      return `<input id="${field.key}" type="${field.type}" value="${v}" ${field.required ? 'required' : ''} />`;
  }
}

function renderStep(container, stepIndex, draft) {
  const step = STEPS[stepIndex];
  container.innerHTML = `
    ${renderStepIndicator(STEPS.length, stepIndex)}
    <h2>${step.title}</h2>
    <form id="step-form">
      ${step.fields.map((f) => `<div class="field"><label>${f.label}</label>${fieldTemplate(f, draft[f.key])}</div>`).join('')}
      <div style="display:flex; gap:12px; margin-top:8px;">
        ${stepIndex > 0 ? '<button type="button" id="back-btn" class="btn btn-secondary">Back</button>' : ''}
        <button type="submit" class="btn btn-primary">${stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </form>
  `;

  container.querySelectorAll('.radio-group .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.parentElement.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  if (stepIndex > 0) {
    container.querySelector('#back-btn').addEventListener('click', () => {
      renderStep(container, stepIndex - 1, onboardingDraft.get());
    });
  }

  container.querySelector('#step-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const patch = {};
    for (const field of step.fields) {
      if (field.type === 'radio') {
        const selected = container.querySelector(`.radio-group[data-key="${field.key}"] .chip.selected`);
        patch[field.key] = selected ? selected.dataset.value : '';
      } else if (field.type === 'tags') {
        const raw = container.querySelector(`#${field.key}`).value;
        patch[field.key] = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        patch[field.key] = container.querySelector(`#${field.key}`).value;
      }
    }
    const updated = onboardingDraft.patch(patch);

    if (stepIndex < STEPS.length - 1) {
      renderStep(container, stepIndex + 1, updated);
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    try {
      await api.saveProfile(updated);
      onboardingDraft.clear();
      showToast('Profile saved!');
      navigate('#/plan?generate=1');
    } catch (err) {
      showToast(err.message || 'Could not save profile', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Finish';
    }
  });
}

export function renderOnboarding(app) {
  app.innerHTML = `<div class="glass-card" id="wizard"></div>`;
  const wizard = app.querySelector('#wizard');
  renderStep(wizard, 0, onboardingDraft.get());
}
