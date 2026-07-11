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
  const nav = document.createElement('div');
  nav.className = 'navbar';

  const brand = document.createElement('div');
  brand.className = 'brand';
  brand.textContent = 'MonsoonGuard';
  brand.style.cursor = 'pointer';
  brand.onclick = () => navigate('#/');
  nav.appendChild(brand);

  const links = document.createElement('div');
  links.className = 'links';

  if (user) {
    const dashLink = document.createElement('a');
    dashLink.href = '#/';
    dashLink.textContent = 'Dashboard';
    links.appendChild(dashLink);

    const advisoryLink = document.createElement('a');
    advisoryLink.href = '#/advisory';
    advisoryLink.textContent = 'Travel Advisory';
    links.appendChild(advisoryLink);

    const historyLink = document.createElement('a');
    historyLink.href = '#/history';
    historyLink.textContent = 'History';
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
