import {
  getArchitectureLabel,
  getArchitectureState,
  getArchitectureSubtitle,
  getArchitectureViewId,
  normalizeArchitectureViewId,
} from './architecture-view.helpers';

describe('architecture-view.helpers', () => {
  it('should map internal architecture values to public-facing labels', () => {
    expect(getArchitectureLabel('AS-IS')).toBe('Current State');
    expect(getArchitectureLabel('TO-BE')).toBe('Target State');
  });

  it('should map internal architecture values to explanatory subtitles', () => {
    expect(getArchitectureSubtitle('AS-IS')).toBe('Current State (AS-IS)');
    expect(getArchitectureSubtitle('TO-BE')).toBe('Target State (TO-BE)');
  });

  it('should map architecture states and public route view ids bidirectionally', () => {
    expect(getArchitectureViewId('AS-IS')).toBe('as-is');
    expect(getArchitectureViewId('TO-BE')).toBe('to-be');
    expect(getArchitectureState('as-is')).toBe('AS-IS');
    expect(getArchitectureState('to-be')).toBe('TO-BE');
  });

  it('should normalize unknown public view ids to an explicit fallback', () => {
    expect(normalizeArchitectureViewId('to-be')).toBe('to-be');
    expect(normalizeArchitectureViewId('CURRENT')).toBe('as-is');
    expect(normalizeArchitectureViewId(null, 'to-be')).toBe('to-be');
  });
});
