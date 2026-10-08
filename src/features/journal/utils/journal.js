const entryDateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Maximum time in milliseconds to consider a pressure reading "near" the entry time
const MAX_PRESSURE_DISTANCE_MS = 90 * 60 * 1000;

export function formatEntryDate(value) {
  return entryDateFormat.format(new Date(value));
}

export function formatDuration(start, end) {
  // Format the duration between the start and end times as a human-readable string.
  const minutes = Math.round((new Date(end) - new Date(start)) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;
  return [
    days && `${days}d`,
    hours && `${hours}h`,
    (remainingMinutes || (!days && !hours)) && `${remainingMinutes}m`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function toDateTimeInput(value) {
  // Convert a date string to a format suitable for an <input type="datetime-local"> element.
  const date = new Date(value);
  const localTime = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );
  return localTime.toISOString().slice(0, 16);
}

export function findNearestPressure(
  data,
  occurredAt,
  { atOrBefore = false } = {}
) {
  // Find the nearest pressure reading to the current time (within 90 minutes).
  // Used to set the pressure reading at the start or end of a migraine entry.

  if (!data?.length) return null;

  const targetTime = new Date(occurredAt).getTime();
  if (!Number.isFinite(targetTime)) return null;

  const nearest = data.reduce((closest, point) => {
    if (point.pressure === null || (atOrBefore && point.time > targetTime)) {
      return closest;
    }
    if (!closest) return point;

    return Math.abs(point.time - targetTime) <
      Math.abs(closest.time - targetTime)
      ? point
      : closest;
  }, null);

  if (
    !nearest ||
    Math.abs(nearest.time - targetTime) > MAX_PRESSURE_DISTANCE_MS
  ) {
    return null;
  }

  return nearest;
}
