import { pocketbase } from './pocketbaseClient';
import { getOptionalRecord, withTimestamps } from './pocketbaseUtils';

const LOCATIONS_COLLECTION = 'saved_locations';
const SETTINGS_COLLECTION = 'user_settings';

function mapLocation(record) {
  return record ? withTimestamps(record) : null;
}

async function getSettings(userId) {
  const filter = pocketbase.filter('user_id = {:userId}', { userId });
  return getOptionalRecord(() =>
    pocketbase.collection(SETTINGS_COLLECTION).getFirstListItem(filter)
  );
}

async function getFirstLocation(userId) {
  const filter = pocketbase.filter('owner_id = {:userId}', { userId });
  return getOptionalRecord(() =>
    pocketbase.collection(LOCATIONS_COLLECTION).getFirstListItem(filter, {
      sort: 'created',
    })
  );
}

export const locationService = {
  async getSaved(userId) {
    const settings = await getSettings(userId);

    if (settings?.default_location_id) {
      const location = await getOptionalRecord(() =>
        pocketbase
          .collection(LOCATIONS_COLLECTION)
          .getOne(settings.default_location_id)
      );
      if (location) return mapLocation(location);
    }

    return mapLocation(await getFirstLocation(userId));
  },

  async save(userId, place, existingId) {
    const values = {
      label: place.city.slice(0, 100),
      city: place.city,
      region: place.region || '',
      country: place.country || '',
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    };

    const location = existingId
      ? await pocketbase
          .collection(LOCATIONS_COLLECTION)
          .update(existingId, values)
      : await pocketbase.collection(LOCATIONS_COLLECTION).create({
          ...values,
          owner_id: userId,
        });

    const settings = await getSettings(userId);
    const settingsValues = { default_location_id: location.id };

    try {
      if (settings) {
        await pocketbase
          .collection(SETTINGS_COLLECTION)
          .update(settings.id, settingsValues);
      } else {
        await pocketbase.collection(SETTINGS_COLLECTION).create({
          ...settingsValues,
          user_id: userId,
          pressure_unit: 'hPa',
          notices_enabled: false,
          notice_direction: 'either',
          notice_threshold_hpa: 0,
          notice_window_hours: 6,
          watch_levels: [],
        });
      }
    } catch (error) {
      throw new Error(
        `Location saved, but setting it as default failed: ${error.message}`,
        { cause: error }
      );
    }

    return mapLocation(location);
  },
};
