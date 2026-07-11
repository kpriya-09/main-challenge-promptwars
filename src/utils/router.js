import { store } from './store.js';

const routes = {};

export function registerRoute(path, { auth, render }) {
  routes[path] = { auth, render };
}

function currentPath() {
  const hash = location.hash || '#/';
  return hash.split('?')[0];
}

async function renderRoute() {
  const path = currentPath();
  const route = routes[path] ?? routes['#/'];

  if (route.auth && !store.isAuthenticated()) {
    location.hash = '#/login';
    return;
  }
  if (route.auth === false && store.isAuthenticated() && (path === '#/login' || path === '#/signup')) {
    location.hash = '#/';
    return;
  }

  const app = document.getElementById('app');
  app.classList.remove('page-enter');
  app.innerHTML = '';
  await route.render(app);
  requestAnimationFrame(() => app.classList.add('page-enter'));

  const navbar = document.getElementById('navbar');
  const { renderNavbar } = await import('../components/navbar.js');
  renderNavbar(navbar);
}

export function startRouter() {
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('DOMContentLoaded', renderRoute);
  if (document.readyState !== 'loading') renderRoute();
}

export function navigate(path) {
  location.hash = path;
}
