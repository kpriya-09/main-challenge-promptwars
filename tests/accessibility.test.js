import { describe, expect, it } from 'vitest';
import { renderStepIndicator } from '../src/components/stepIndicator.js';

describe('accessible setup progress', () => {
  it('announces the current step and labels every step', () => {
    const html = renderStepIndicator(3, 1, ['Location', 'Household', 'Language']);

    expect(html).toContain('aria-label="Setup progress"');
    expect(html).toContain('Step 2 of 3');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('Household');
    expect(html).toContain(', current step');
  });

  it('marks earlier steps as completed without relying on color alone', () => {
    const html = renderStepIndicator(3, 2, ['Location', 'Household', 'Language']);

    expect(html).toContain('✓');
    expect(html).toContain(', completed');
    expect(html).toContain('Language');
  });
});
