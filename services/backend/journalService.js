import { pocketbase } from './pocketbaseClient';
import {
  getOptionalRecord,
  nullableNumber,
  nullableString,
  withTimestamps,
} from './pocketbaseUtils';

const JOURNAL_COLLECTION = 'pressure_app_journal_entries';


// Journal entry conversion functions between the PocketBase data shape and the frontend data shape.
function mapEntry(record) {
  if (!record) return null;

  // Translate PocketBase empty values and timestamps back to the data shape
  // already used throughout the frontend.
  return withTimestamps({
    ...record,
    ended_at: nullableString(record.ended_at),
    severity: nullableNumber(record.severity),
    notes: nullableString(record.notes),
    pressure_hpa: nullableNumber(record.pressure_hpa),
    pressure_observed_at: nullableString(record.pressure_observed_at),
    end_pressure_hpa: nullableNumber(record.end_pressure_hpa),
    end_pressure_observed_at: nullableString(
      record.end_pressure_observed_at
    ),
    location_id: nullableString(record.location_id),
    location_label: nullableString(record.location_label),
  });
}

function toPocketBaseValues(values) {
  // PocketBase stores empty optional primitive fields using their zero values,
  // so convert frontend nulls before sending a create or update request.
  return {
    occurred_at: values.occurred_at,
    ended_at: values.ended_at || '',
    is_ongoing: Boolean(values.is_ongoing),
    symptoms: values.symptoms?.trim() || '',
    severity: values.severity ?? 0,
    notes: values.notes || '',
    pressure_hpa: values.pressure_hpa ?? 0,
    pressure_observed_at: values.pressure_observed_at || '',
    end_pressure_hpa: values.end_pressure_hpa ?? 0,
    end_pressure_observed_at: values.end_pressure_observed_at || '',
    location_id: values.location_id || '',
    location_label: values.location_label || '',
  };
}

// Validates the values for a journal entry before creating or updating it. Throws an error if any validation fails.
export function validateEntry(values) {
  if (!values.symptoms?.trim()) {
    throw new Error('Symptoms are required.');
  }

  const occurredAt = new Date(values.occurred_at);
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error('The start time is invalid.');
  }

  if (values.ended_at) {
    const endedAt = new Date(values.ended_at);
    if (Number.isNaN(endedAt.getTime()) || endedAt < occurredAt) {
      throw new Error('The end time must be after the start time.');
    }
  }

  if (values.is_ongoing && values.ended_at) {
    throw new Error('An ongoing entry cannot have an end time.');
  }

  const hasStartPressure = values.pressure_hpa !== null && values.pressure_hpa !== undefined;
  const hasStartReadingTime =
    values.pressure_observed_at !== null &&
    values.pressure_observed_at !== undefined;
  if (hasStartPressure !== hasStartReadingTime) {
    throw new Error('Start pressure and reading time must be saved together.');
  }

  const hasEndPressure =
    values.end_pressure_hpa !== null && values.end_pressure_hpa !== undefined;
  const hasEndReadingTime =
    values.end_pressure_observed_at !== null &&
    values.end_pressure_observed_at !== undefined;
  if (hasEndPressure !== hasEndReadingTime) {
    throw new Error('End pressure and reading time must be saved together.');
  }
  if (hasEndPressure && !values.ended_at) {
    throw new Error('An end pressure requires an end time.');
  }

  if (values.location_id && !values.location_label?.trim()) {
    throw new Error('A saved location requires a location label.');
  }
}

function requireUser(userId) {
  if (!userId) throw new Error('You must be signed in to modify journal entries.');
}

// Journal service CRUD operations
export const journalService = {
  async list(userId) {
    const filter = pocketbase.filter('user_id = {:userId}', { userId });
    const records = await pocketbase
      .collection(JOURNAL_COLLECTION)
      .getFullList({
        filter,
        sort: '-occurred_at',
        fields:
          'id,occurred_at,ended_at,is_ongoing,symptoms,severity,pressure_hpa,pressure_observed_at,end_pressure_hpa,end_pressure_observed_at,location_label,created,updated',
      });
    return records.map(mapEntry);
  },

  async getById(userId, entryId) {
    const filter = pocketbase.filter('id = {:entryId} && user_id = {:userId}', {
      entryId,
      userId,
    });
    const record = await getOptionalRecord(() =>
      pocketbase.collection(JOURNAL_COLLECTION).getFirstListItem(filter)
    );
    return mapEntry(record);
  },

  async create(userId, values) {
    validateEntry(values);
    const record = await pocketbase.collection(JOURNAL_COLLECTION).create({
      ...toPocketBaseValues(values),
      user_id: userId,
    });
    return mapEntry(record);
  },

  async update(userId, entryId, values) {
    requireUser(userId);
    validateEntry(values);
    const record = await pocketbase
      .collection(JOURNAL_COLLECTION)
      .update(entryId, toPocketBaseValues(values));
    return mapEntry(record);
  },

  async remove(userId, entryId) {
    requireUser(userId);
    await pocketbase.collection(JOURNAL_COLLECTION).delete(entryId);
  },
};
