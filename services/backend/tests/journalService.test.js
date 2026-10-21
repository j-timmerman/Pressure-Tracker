import { describe, expect, it, vi } from 'vitest';

// journalService imports the PocketBase client at module load. Stub it so
// the unit tests never create a real client or touch the network.
vi.mock('../pocketbaseClient', () => ({
  pocketbase: {},
}));

import { validateEntry } from '../journalService';

// A minimal entry that passes every check. Each test overrides only the
// field it is exercising.
function validEntry(overrides = {}) {
  return {
    occurred_at: '2024-05-01T10:00:00.000Z',
    ended_at: null,
    is_ongoing: false,
    symptoms: 'Headache',
    severity: 5,
    notes: null,
    pressure_hpa: null,
    pressure_observed_at: null,
    end_pressure_hpa: null,
    end_pressure_observed_at: null,
    location_id: null,
    location_label: null,
    ...overrides,
  };
}

describe('validateEntry', () => {
  it('accepts a minimal valid entry', () => {
    expect(() => validateEntry(validEntry())).not.toThrow();
  });

  describe('symptoms', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty string', ''],
      ['only whitespace', '   '],
    ])('throws when symptoms is %s', (_label, symptoms) => {
      expect(() => validateEntry(validEntry({ symptoms }))).toThrow(
        'Symptoms are required.'
      );
    });
  });

  describe('start time', () => {
    it.each([
      ['undefined', undefined],
      ['an empty string', ''],
      ['not a date', 'not-a-date'],
    ])('throws when occurred_at is %s', (_label, occurred_at) => {
      expect(() => validateEntry(validEntry({ occurred_at }))).toThrow(
        'The start time is invalid.'
      );
    });
  });

  describe('end time', () => {
    it('throws when ended_at is not a valid date', () => {
      expect(() =>
        validateEntry(validEntry({ ended_at: 'not-a-date' }))
      ).toThrow('The end time must be after the start time.');
    });

    it('throws when ended_at is before occurred_at', () => {
      expect(() =>
        validateEntry(validEntry({ ended_at: '2024-05-01T09:00:00.000Z' }))
      ).toThrow('The end time must be after the start time.');
    });

    it('accepts ended_at after occurred_at', () => {
      expect(() =>
        validateEntry(validEntry({ ended_at: '2024-05-01T12:00:00.000Z' }))
      ).not.toThrow();
    });
  });

  describe('ongoing entries', () => {
    it('throws when an ongoing entry has an end time', () => {
      expect(() =>
        validateEntry(
          validEntry({
            is_ongoing: true,
            ended_at: '2024-05-01T12:00:00.000Z',
          })
        )
      ).toThrow('An ongoing entry cannot have an end time.');
    });

    it('accepts an ongoing entry without an end time', () => {
      expect(() =>
        validateEntry(validEntry({ is_ongoing: true }))
      ).not.toThrow();
    });
  });
});