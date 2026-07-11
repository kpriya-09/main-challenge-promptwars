export function renderStepIndicator(total, currentIndex, labels = []) {
  const dots = Array.from({ length: total }, (_, i) => {
    const cls = i === currentIndex ? 'active' : i < currentIndex ? 'done' : '';
    const state = i === currentIndex ? 'current step' : i < currentIndex ? 'completed' : 'not started';
    return `<li class="step ${cls}" ${i === currentIndex ? 'aria-current="step"' : ''}>
      <span class="dot" aria-hidden="true">${i < currentIndex ? '✓' : i + 1}</span>
      <span class="step-label">${labels[i] || `Step ${i + 1}`}</span>
      <span class="sr-only">, ${state}</span>
    </li>`;
  }).join('');
  return `<nav aria-label="Setup progress"><p class="step-count">Step ${currentIndex + 1} of ${total}</p><ol class="step-indicator">${dots}</ol></nav>`;
}
