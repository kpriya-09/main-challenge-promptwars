import { store } from '../utils/store.js';
import { navigate } from '../utils/router.js';

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function renderNavbar(el) {
  const user = store.getUser();
  el.innerHTML = '';
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.setAttribute('aria-label', 'Primary navigation');

  const brand = document.createElement('a');
  brand.className = 'brand brand-link';
  brand.href = '#/';
  brand.textContent = 'MonsoonGuard';
  brand.setAttribute('aria-label', 'MonsoonGuard home');
  nav.appendChild(brand);

  const links = document.createElement('div');
  links.className = 'links';

  if (user) {
    const dashLink = document.createElement('a');
    dashLink.href = '#/';
    dashLink.textContent = 'Dashboard';
    if ((location.hash || '#/').split('?')[0] === '#/') dashLink.setAttribute('aria-current', 'page');
    links.appendChild(dashLink);

    const advisoryLink = document.createElement('a');
    advisoryLink.href = '#/advisory';
    advisoryLink.textContent = 'Travel Advisory';
    if (location.hash.startsWith('#/advisory')) advisoryLink.setAttribute('aria-current', 'page');
    links.appendChild(advisoryLink);

    const historyLink = document.createElement('a');
    historyLink.href = '#/history';
    historyLink.textContent = 'History';
    if (location.hash.startsWith('#/history')) historyLink.setAttribute('aria-current', 'page');
    links.appendChild(historyLink);

    const logout = document.createElement('button');
    logout.className = 'btn btn-secondary';
    logout.textContent = 'Log out';
    logout.onclick = () => {
      store.clearSession();
      navigate('#/login');
    };
    links.appendChild(logout);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = initials(user.name || user.email);
    avatar.title = user.name || user.email;
    avatar.setAttribute('aria-label', `Signed in as ${user.name || user.email}`);
    links.appendChild(avatar);
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = '#/login';
    loginLink.textContent = 'Log in';
    links.appendChild(loginLink);

    const signupBtn = document.createElement('button');
    signupBtn.className = 'btn btn-primary';
    signupBtn.textContent = 'Sign up';
    signupBtn.onclick = () => navigate('#/signup');
    links.appendChild(signupBtn);
  }

  nav.appendChild(links);
  el.appendChild(nav);
}
