import './style.css';
import { registerRoute, startRouter } from './utils/router.js';

registerRoute('#/login', { auth: false, render: (app) => import('./pages/login.js').then((m) => m.renderLogin(app)) });
registerRoute('#/signup', { auth: false, render: (app) => import('./pages/signup.js').then((m) => m.renderSignup(app)) });
registerRoute('#/', { auth: true, render: (app) => import('./pages/dashboard.js').then((m) => m.renderDashboard(app)) });
registerRoute('#/onboarding', { auth: true, render: (app) => import('./pages/onboarding.js').then((m) => m.renderOnboarding(app)) });
registerRoute('#/plan', { auth: true, render: (app) => import('./pages/plan.js').then((m) => m.renderPlanPage(app)) });
registerRoute('#/advisory', { auth: true, render: (app) => import('./pages/advisory.js').then((m) => m.renderAdvisoryPage(app)) });
registerRoute('#/history', { auth: true, render: (app) => import('./pages/history.js').then((m) => m.renderHistory(app)) });

startRouter();
