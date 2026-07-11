import { api, ApiError } from '../utils/api.js';
import { store } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { renderGoogleButton } from '../components/googleButton.js';
import { handleGoogleCredential } from '../utils/googleAuthFlow.js';

export function renderSignup(app) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="glass-card auth-card">
        <h1>Get monsoon-ready</h1>
        <p style="color: var(--text-secondary); margin-top: -8px;">Personalized preparedness plans in minutes</p>
        <div id="error-slot"></div>
        <form id="signup-form">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" type="text" required autocomplete="name" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" required minlength="8" autocomplete="new-password" />
          </div>
          <button class="btn btn-primary btn-block" type="submit">Sign up</button>
        </form>
        <div id="google-slot"></div>
        <div class="auth-switch">Already have an account? <a href="#/login">Log in</a></div>
      </div>
    </div>
  `;

  const form = app.querySelector('#signup-form');
  const errorSlot = app.querySelector('#error-slot');

  renderGoogleButton(app.querySelector('#google-slot'), (credential) =>
    handleGoogleCredential(credential, () => navigate('#/'))
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorSlot.innerHTML = '';
    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;
    try {
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const password = form.querySelector('#password').value;
      const { token, user } = await api.signup({ name, email, password });
      store.setSession(token, user);
      navigate('#/onboarding');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Try again.';
      errorSlot.innerHTML = `<div class="error-banner">${msg}</div>`;
    } finally {
      submitBtn.disabled = false;
    }
  });
}
