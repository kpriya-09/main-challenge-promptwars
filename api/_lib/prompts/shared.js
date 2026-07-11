export function languageInstruction(language) {
  if (!language || language.toLowerCase() === 'english') return 'Respond in clear, simple English.';
  return `Respond entirely in ${language}. All string fields in the JSON must be written in ${language}, not English.`;
}

export function gapsInstruction(gaps) {
  if (!gaps?.length) return '';
  return [
    '',
    '## Known Gaps in the Profile',
    gaps.map((g) => `- ${g}`).join('\n'),
    'Where you have to fill a gap with a reasonable default, name that default explicitly in the "assumptions" field rather than presenting it as a known fact.'
  ].join('\n');
}
