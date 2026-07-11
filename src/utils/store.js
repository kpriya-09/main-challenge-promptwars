const TOKEN_KEY = 'mm.token';
const USER_KEY = 'mm.user';

export const store = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated() {
    return Boolean(this.getToken());
  }
};

const ONBOARDING_KEY = 'mm.onboarding';

export const onboardingDraft = {
  get() {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : {};
  },
  patch(partial) {
    const current = this.get();
    const next = { ...current, ...partial };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    return next;
  },
  clear() {
    localStorage.removeItem(ONBOARDING_KEY);
  }
};
