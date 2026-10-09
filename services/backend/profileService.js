import { pocketbase } from './pocketbaseClient';
import { getOptionalRecord, withTimestamps } from './pocketbaseUtils';

const PROFILE_COLLECTION = 'pressure_app_user_profiles';

function mapProfile(record) {
  return record ? withTimestamps(record) : null;
}

export const profileService = {
  // Query the profile collection with a filter on the auth_user_id field to get the profile ID.
  async getByAuthUserId(authUserId) {
    const filter = pocketbase.filter('auth_user_id = {:authUserId}', {
      authUserId,
    });
    const record = await getOptionalRecord(() =>
      pocketbase.collection(PROFILE_COLLECTION).getFirstListItem(filter)
    );
    return mapProfile(record);
  },

  async updateProfile(profileId, updates) {
    const record = await pocketbase
      .collection(PROFILE_COLLECTION)
      .update(profileId, updates);
    return mapProfile(record);
  },
};
