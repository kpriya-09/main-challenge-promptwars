export function renderChecklist(items) {
  if (!items?.length) return '<p style="color: var(--text-secondary);">No checklist items.</p>';
  return items
    .map(
      (i) => `
    <div class="checklist-item">
      <span class="priority ${i.priority}">${i.priority}</span>
      <div class="text">
        <strong>${i.item}</strong>
        <span>${i.reason}</span>
      </div>
    </div>`
    )
    .join('');
}
