import { describe, expect, it, vi } from 'vitest';

// journalService imports the PocketBase client at module load. Stub it so
// the unit tests never create a real client or touch the network.
vi.mock('../pocketbaseClient', () => ({
  pocketbase: {},
}));

import { validateEntry, mapEntry, toPocketBaseValues } from '../journalService';
import { validateEndedAt } from '../../../src/features/journal/utils/formValues.js';


// A minimal record (in the PocketBase record shape) that passes every check. Each test overrides only the
// field it is exercising.
function pocketBaseEntry(overrides = {}) {
  return {
    id: 'entry-1',
    occurred_at: '2024-05-01T10:00:00.000Z',
    ended_at: '',
    is_ongoing: false,
    symptoms: 'Headache',
    severity: 0,
    notes: '',
    pressure_hpa: 0,
    pressure_observed_at: '',
    end_pressure_hpa: 0,
    end_pressure_observed_at: '',
    location_id: '',
    location_label: '',
    created: '2024-05-01T10:00:00.000Z',
    updated: '2024-05-02T10:00:00.000Z',
    ...overrides,
  };
}

// A minimal entry (in the frontend data shape) that passes every check. Each test overrides only the
// field it is exercising.
function validFrontendEntry(overrides = {}) {
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
    expect(() => validateEntry(validFrontendEntry())).not.toThrow();
  });

  describe('symptoms', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty string', ''],
      ['only whitespace', '   '],
    ])('throws when symptoms is %s', (_label, symptoms) => {
      expect(() => validateEntry(validFrontendEntry({ symptoms }))).toThrow(
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
      expect(() => validateEntry(validFrontendEntry({ occurred_at }))).toThrow(
        'The start time is invalid.'
      );
    });
  });

  describe('end time', () => {
    it('throws when ended_at is not a valid date', () => {
      expect(() =>
        validateEntry(validFrontendEntry({ ended_at: 'not-a-date' }))
      ).toThrow('The end time must be after the start time.');
    });

    it('throws when ended_at is before occurred_at', () => {
      expect(() =>
        validateEntry(validFrontendEntry({ ended_at: '2024-05-01T09:00:00.000Z' }))
      ).toThrow('The end time must be after the start time.');
    });

    it('accepts ended_at after occurred_at', () => {
      expect(() =>
        validateEntry(validFrontendEntry({ ended_at: '2024-05-01T12:00:00.000Z' }))
      ).not.toThrow();
    });
  });

  describe('ongoing entries', () => {
    it('throws when an ongoing entry has an end time', () => {
      expect(() =>
        validateEntry(
          validFrontendEntry({
            is_ongoing: true,
            ended_at: '2024-05-01T12:00:00.000Z',
          })
        )
      ).toThrow('An ongoing entry cannot have an end time.');
    });

    it('accepts an ongoing entry without an end time', () => {
      expect(() =>
        validateEntry(validFrontendEntry({ is_ongoing: true }))
      ).not.toThrow();
    });
  });
});

describe('validateEndedAt', () => {
  it('rejects an end time equal to the start time', () => {
    expect(
      validateEndedAt('2024-05-01T10:00', {
        occurredAt: '2024-05-01T10:00',
      })
    ).toBe('End time must be after the start time');
  });
});

describe('journal entry transformations', () => {
  // The frontend uses null to represent "no value" for optional fields, 
  // but PocketBase uses empty strings or 0. The transformations
  // convert between the two representations.
  
  it('transforms frontend nulls to PocketBase empty values', () => {
    expect(toPocketBaseValues(validFrontendEntry({ severity: null }))).toEqual({
      occurred_at: '2024-05-01T10:00:00.000Z', // required fields should be unchanged
      ended_at: '',
      is_ongoing: false, // unchanged
      symptoms: 'Headache',  // unchanged
      severity: 0,
      notes: '',
      pressure_hpa: 0,
      pressure_observed_at: '',
      end_pressure_hpa: 0,
      end_pressure_observed_at: '',
      location_id: '',
      location_label: '',
    });
  });

  it('maps PocketBase empty values to frontend nulls', () => {
    expect(mapEntry(pocketBaseEntry())).toEqual(
      expect.objectContaining({
        occurred_at: '2024-05-01T10:00:00.000Z',  // required fields should be unchanged
        ended_at: null,
        is_ongoing: false,  // unchanged
        symptoms: 'Headache',  // unchanged
        severity: null,
        notes: null,
        pressure_hpa: null,
        pressure_observed_at: null,
        end_pressure_hpa: null,
        end_pressure_observed_at: null,
        location_id: null,
        location_label: null,
      })
    );
  });

  it('mapEntry(null) returns null', () => {
    expect(mapEntry(null)).toBeNull();
  });

  it('maps PocketBase timestamps to created_at and updated_at', () => {
    // The name of the fields in PocketBase is "created" and "updated", 
    // but the frontend expects "created_at" and "updated_at".
    const mapped = mapEntry(pocketBaseEntry());
    expect(mapped.created_at).toBe('2024-05-01T10:00:00.000Z');
    expect(mapped.updated_at).toBe('2024-05-02T10:00:00.000Z');
  });

});