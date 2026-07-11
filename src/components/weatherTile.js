const ICONS = {
  rain: '🌧️', thunderstorm: '⛈️', clear: '☀️', clouds: '☁️', drizzle: '🌦️', mist: '🌫️'
};

function pickIcon(condition = '') {
  const key = Object.keys(ICONS).find((k) => condition.toLowerCase().includes(k));
  return ICONS[key] || '🌤️';
}

export function renderWeatherTile(weather) {
  if (!weather) return '';
  return `
    <div class="weather-tile">
      <div style="font-size:42px;">${pickIcon(weather.condition)}</div>
      <div>
        <div class="temp">${Math.round(weather.temp)}°C</div>
        <div class="condition">${weather.condition} · feels like ${Math.round(weather.feelsLike)}°C</div>
        <div style="color:var(--text-secondary); font-size:13px;">${weather.location} · humidity ${weather.humidity}% · wind ${weather.windSpeed} m/s</div>
      </div>
    </div>
  `;
}

export function renderAlertBanners(alerts) {
  if (!alerts?.length) return '<p style="color: var(--text-secondary);">No active weather alerts for your area.</p>';
  return alerts.map((a) => `<div class="alert-banner ${a.severity}">${a.message}</div>`).join('');
}
