const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;
function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Renders the "Sign in with Google" button into `container` and invokes
 * onCredential(idToken) once the user completes the Google flow. No-ops
 * if VITE_GOOGLE_CLIENT_ID isn't configured, so the app degrades
 * gracefully to email/password-only auth.
 */
export async function renderGoogleButton(container, onCredential) {
  if (!CLIENT_ID) return;

  try {
    await loadGoogleScript();
  } catch {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: (response) => onCredential(response.credential)
  });

  const divider = document.createElement('div');
  divider.style.cssText = 'display:flex; align-items:center; gap:10px; margin: 18px 0; color: var(--text-muted); font-size: 12px;';
  divider.innerHTML = '<div style="flex:1;height:1px;background:var(--glass-border);"></div>or<div style="flex:1;height:1px;background:var(--glass-border);"></div>';
  container.appendChild(divider);

  const buttonSlot = document.createElement('div');
  buttonSlot.style.display = 'flex';
  buttonSlot.style.justifyContent = 'center';
  container.appendChild(buttonSlot);

  window.google.accounts.id.renderButton(buttonSlot, {
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    width: 320
  });
}
