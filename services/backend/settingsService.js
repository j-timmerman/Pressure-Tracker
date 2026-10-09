import { pocketbase } from './pocketbaseClient';
import { DEFAULT_PRESSURE_UNIT } from '../../src/shared/constants/pressure';
import { getOptionalRecord } from './pocketbaseUtils';

const SETTINGS_COLLECTION = 'user_settings';
const HPA_TO_INHG = 0.02953;

// Functions to round and convert pressure values between hPa and inHg, preserving the number of decimal places based on the target unit.
function roundValue(value, decimals) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return value;
  }
  return Number(Number(value).toFixed(decimals));
}

function convertPressureValue(value, fromUnit, toUnit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return value;
  }

  const numericValue = Number(value);
  if (fromUnit === toUnit) {
    return roundValue(numericValue, fromUnit === 'inHg' ? 2 : 1);
  }

  const convertedValue =
    fromUnit === 'hPa' && toUnit === 'inHg'
      ? numericValue * HPA_TO_INHG
      : numericValue / HPA_TO_INHG;
  return roundValue(convertedValue, toUnit === 'inHg' ? 2 : 1);
}

// Find the user's settings record in the PocketBase collection, returning null if not found.
async function findSettings(userId) {
  const filter = pocketbase.filter('user_id = {:userId}', { userId });
  return getOptionalRecord(() =>
    pocketbase.collection(SETTINGS_COLLECTION).getFirstListItem(filter)
  );
}

function mapSettings(record) {
  return {
    pressure_unit: record?.pressure_unit || DEFAULT_PRESSURE_UNIT,
    watch_levels: Array.isArray(record?.watch_levels)
      ? record.watch_levels
      : [],
  };
}

// Save the user's settings record, either updating an existing record or creating a new one with default values.
async function saveSettings(userId, existing, values) {
  // PocketBase has no client-side upsert helper, so preserve the former upsert
  // behavior by updating the user's singleton record or creating its defaults.
  const record = existing
    ? await pocketbase
        .collection(SETTINGS_COLLECTION)
        .update(existing.id, values)
    : await pocketbase.collection(SETTINGS_COLLECTION).create({
        user_id: userId,
        pressure_unit: DEFAULT_PRESSURE_UNIT,
        notices_enabled: false,
        notice_direction: 'either',
        notice_threshold_hpa: 0,
        notice_window_hours: 6,
        watch_levels: [],
        ...values,
      });
  return mapSettings(record);
}

// Settings service CRUD operations
export const settingsService = {
  async get(userId) {
    return mapSettings(await findSettings(userId));
  },

  // Update the user's pressure unit and convert existing watch levels to the new unit if necessary.
  async updatePressureUnit(userId, pressureUnit) {
    const existing = await findSettings(userId);
    const previous = mapSettings(existing);
    const convertedWatchLevels =
      previous.pressure_unit === pressureUnit
        ? previous.watch_levels
        : previous.watch_levels.map((value) =>
            convertPressureValue(value, previous.pressure_unit, pressureUnit)
          );

    return saveSettings(userId, existing, {
      pressure_unit: pressureUnit,
      watch_levels: convertedWatchLevels,
    });
  },
 
  // Update the user's watch levels, normalizing and validating the input values before saving.
  async updateWatchLevels(userId, watchLevels) {
    const existing = await findSettings(userId);
    const activeUnit = existing?.pressure_unit || DEFAULT_PRESSURE_UNIT;
    const normalizedLevels = (watchLevels ?? [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => roundValue(value, activeUnit === 'inHg' ? 2 : 1))
      .sort((a, b) => a - b);

    return saveSettings(userId, existing, {
      pressure_unit: activeUnit,
      watch_levels: normalizedLevels,
    });
  },
};
