import { getArchitectureLabel, getArchitectureSubtitle } from './architecture-view.helpers';

describe('architecture-view.helpers', () => {
  it('maps internal architecture values to public-facing labels', () => {
    expect(getArchitectureLabel('AS-IS')).toBe('Current State');
    expect(getArchitectureLabel('TO-BE')).toBe('Target State');
  });

  it('maps internal architecture values to explanatory subtitles', () => {
    expect(getArchitectureSubtitle('AS-IS')).toBe('Current State (AS-IS)');
    expect(getArchitectureSubtitle('TO-BE')).toBe('Target State (TO-BE)');
  });
});
