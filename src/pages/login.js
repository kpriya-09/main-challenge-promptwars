import { api, ApiError } from '../utils/api.js';
import { store } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { renderGoogleButton } from '../components/googleButton.js';
import { handleGoogleCredential } from '../utils/googleAuthFlow.js';

export function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="glass-card auth-card">
        <h1>Welcome back</h1>
        <p style="color: var(--text-secondary); margin-top: -8px;">Log in to MonsoonGuard</p>
        <div id="error-slot"></div>
        <form id="login-form">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" required autocomplete="current-password" />
          </div>
          <button class="btn btn-primary btn-block" type="submit">Log in</button>
        </form>
        <div id="google-slot"></div>
        <div class="auth-switch">No account? <a href="#/signup">Sign up</a></div>
      </div>
    </div>
  `;

  const form = app.querySelector('#login-form');
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
      const email = form.querySelector('#email').value.trim();
      const password = form.querySelector('#password').value;
      const { token, user } = await api.login({ email, password });
      store.setSession(token, user);
      navigate('#/');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Try again.';
      errorSlot.innerHTML = `<div class="error-banner">${msg}</div>`;
    } finally {
      submitBtn.disabled = false;
    }
  });
}
