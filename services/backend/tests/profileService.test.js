import { describe, expect, it, vi } from 'vitest';

vi.mock('../pocketbaseClient', () => ({
  pocketbase: {
    filter: vi.fn(),
  },
}));

import { validateProfileName } from '../profileService';

describe('validateProfileName', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
    ['only whitespace', '   '],
  ])('requires a profile name when it is %s', (_label, username) => {
    expect(() => validateProfileName(username)).toThrow(
      'Username must be at least 3 characters'
    );
  });

  it('accepts and trims a valid profile name', () => {
    expect(validateProfileName('  Jane  ')).toBe('Jane');
  });
});
