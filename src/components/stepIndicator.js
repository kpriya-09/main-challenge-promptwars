export function renderStepIndicator(total, currentIndex) {
  const dots = Array.from({ length: total }, (_, i) => {
    const cls = i === currentIndex ? 'active' : i < currentIndex ? 'done' : '';
    return `<div class="dot ${cls}"></div>`;
  }).join('');
  return `<div class="step-indicator">${dots}</div>`;
}
