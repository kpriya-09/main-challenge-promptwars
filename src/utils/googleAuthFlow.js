import { api } from './api.js';
import { store } from './store.js';
import { showToast } from './toast.js';

export async function handleGoogleCredential(credential, onSuccess) {
  try {
    const { token, user } = await api.googleAuth(credential);
    store.setSession(token, user);
    onSuccess(user);
  } catch (err) {
    showToast(err.message || 'Google sign-in failed', 'error');
  }
}
