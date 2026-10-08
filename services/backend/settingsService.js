import { pocketbase } from './pocketbaseClient';
import { DEFAULT_PRESSURE_UNIT } from '../../src/shared/constants/pressure';
import { getOptionalRecord } from './pocketbaseUtils';

const SETTINGS_COLLECTION = 'user_settings';
const HPA_TO_INHG = 0.02953;

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

async function saveSettings(userId, existing, values) {
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

export const settingsService = {
  async get(userId) {
    return mapSettings(await findSettings(userId));
  },

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
