import { findNearestPressure, toDateTimeInput } from './journal.js';

export function validateEndedAt(value, values) {
  if (!value) return null;
  const start = new Date(values.occurredAt).getTime();
  const end = new Date(value).getTime();
  if (!Number.isFinite(end)) return 'Enter a valid end date and time';
  if (Number.isFinite(start) && end <= start) {
    return 'End time must be after the start time';
  }
  return null;
}

export function getJournalLocation(initialEntry, location) {
  return {
    id: initialEntry?.location_id ?? location?.id ?? null,
    label: initialEntry?.location_label ?? location?.label ?? null,
  };
}

export function createJournalFormValues(
  initialEntry,
  { startMigraine = false, endMigraine = false } = {}
) {
  return {
    occurredAt: toDateTimeInput(initialEntry?.occurred_at ?? new Date()),
    endedAt: endMigraine
      ? toDateTimeInput(new Date())
      : initialEntry?.ended_at
        ? toDateTimeInput(initialEntry.ended_at)
        : '',
    isOngoing: endMigraine
      ? false
      : (initialEntry?.is_ongoing ?? startMigraine),
    symptoms: initialEntry?.symptoms ?? '',
    severity:
      initialEntry?.severity === null || initialEntry?.severity === undefined
        ? null
        : String(initialEntry.severity),
    notes: initialEntry?.notes ?? '',
  };
}

export function createJournalPayload(
  values,
  { initialEntry, location, forecastData }
) {
  const journalLocation = getJournalLocation(initialEntry, location);
  const occurredAt = new Date(values.occurredAt).toISOString();
  const endedAt =
    values.isOngoing || !values.endedAt
      ? null
      : new Date(values.endedAt).toISOString();

  // Preserve original pressure readings when the user edits an existing entry without
  // changing the original start/end timestamps. Recomputes the pressure readings if the
  // timeline actually changes.
  const previousEnd = initialEntry?.ended_at;
  const previousStart = initialEntry?.occurred_at;

  const startUnchanged =
    !!previousStart &&
    new Date(occurredAt).getTime() === new Date(previousStart).getTime();

  const endUnchanged =
    !!previousEnd &&
    !!endedAt &&
    new Date(endedAt).getTime() === new Date(previousEnd).getTime();

  // Find the nearest pressure readings for the start and end times, if they have changed
  const startReading =
    startUnchanged || !journalLocation.id
      ? null
      : findNearestPressure(forecastData, occurredAt, { atOrBefore: true });

  const endReading =
    endedAt && !endUnchanged && journalLocation.id
      ? findNearestPressure(forecastData, endedAt, { atOrBefore: true })
      : null;

  // Determine the pressure readings and times to use for the payload, preserving the original readings if
  // the start/end times haven't changed
  const startPressure = startUnchanged
    ? (initialEntry.pressure_hpa ?? null)
    : (startReading?.pressure ?? null);

  const startPressureTime = startUnchanged
    ? (initialEntry.pressure_observed_at ?? null)
    : startReading
      ? new Date(startReading.time).toISOString()
      : null;

  const endPressure = endedAt
    ? endUnchanged
      ? (initialEntry.end_pressure_hpa ?? null)
      : (endReading?.pressure ?? null)
    : null;

  const endPressureTime = endedAt
    ? endUnchanged
      ? (initialEntry.end_pressure_observed_at ?? null)
      : endReading
        ? new Date(endReading.time).toISOString()
        : null
    : null;

  // Determine if the start and end pressure snapshots share the same timestamp
  // If so, don't record the end pressure. 
  const sameReadingTime =
    startPressureTime &&
    endPressureTime &&
    new Date(startPressureTime).getTime() ===
      new Date(endPressureTime).getTime();

  return {
    occurred_at: occurredAt,
    ended_at: endedAt,
    is_ongoing: values.isOngoing,
    symptoms: values.symptoms.trim(),
    severity: values.severity === null ? null : Number(values.severity),
    notes: values.notes.trim() || null,
    pressure_hpa: startPressure,
    pressure_observed_at: startPressureTime,
    end_pressure_hpa: sameReadingTime ? null : endPressure,
    end_pressure_observed_at: sameReadingTime ? null : endPressureTime,
    location_id: journalLocation.id,
    location_label: journalLocation.label,
  };
}
