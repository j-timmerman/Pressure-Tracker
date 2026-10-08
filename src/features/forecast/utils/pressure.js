// Standard conversion factor from hPa to inHg.
export const HPA_TO_INHG = 0.02953;

const pressureFormatters = {
  hPa: new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }),
  inHg: new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

export function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function convertPressure(value, unit) {
  // Convert pressure from hPa to the specified unit.
  if (value === null) return null;
  const convertedValue = unit === 'inHg' ? value * HPA_TO_INHG : value;
  return round(convertedValue, unit === 'inHg' ? 2 : 1);
}

export function convertPressureToHpa(value, unit) {
  // Convert pressure from the specified unit to hPa.
  if (value === null) return null;
  unit === 'inHg' ? value / HPA_TO_INHG : value;
  const convertedValue = unit === 'inHg' ? value / HPA_TO_INHG : value;
  return round(convertedValue, 1);
}

export function formatPressure(value, unit) {
  return pressureFormatters[unit].format(value);
}

export function calculateYaxisRange(values, unit) {
  // Calculate the min and max values for the pressure chart based on the provided values and unit.
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return [0, 0];
  }

  const minValue = Math.min(...validValues);
  const maxValue = Math.max(...validValues);
  const padding = unit === 'inHg' ? 0.15 : 5;

  return [minValue - padding, maxValue + padding];
}

const HOUR = 60 * 60 * 1000;

export function pressureAt(data, time) {
  // Find the pressure at a specific time by interpolating between the two nearest readings.
  const nextIndex = data.findIndex((point) => point.time >= time);
  if (nextIndex === -1) return null;

  const next = data[nextIndex];
  if (next.time === time) {
    return Number.isFinite(next.pressure) ? next.pressure : null;
  }

  // Use the reading before this time with the next one to interpolate; skip missing or wide gaps,
  // e.g. if the requested time is 2:30, and the readings are at 2:00 and 3:00, interpolate between those two.
  const previous = data[nextIndex - 1];
  if (
    !previous ||
    !Number.isFinite(previous.pressure) ||
    !Number.isFinite(next.pressure) ||
    next.time - previous.time > 1.5 * HOUR
  ) {
    return null;
  }

  const progress = (time - previous.time) / (next.time - previous.time);
  return previous.pressure + (next.pressure - previous.pressure) * progress;
}

export function getThreeHourPressureTrend(data, now) {
  // Calculate the pressure trend over the next three hours based on the provided data and current time.
  if (!data?.length) return null;

  const current = pressureAt(data, now);
  const future = pressureAt(data, now + 3 * HOUR);
  if (current === null || future === null) return null;

  const change = future - current;
  return {
    change,
    direction: change >= 0.5 ? 'Rising' : change <= -0.5 ? 'Falling' : 'Steady',
  };
}
