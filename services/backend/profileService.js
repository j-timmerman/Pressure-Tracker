import { pocketbase } from './pocketbaseClient';
import { getOptionalRecord, withTimestamps } from './pocketbaseUtils';

const PROFILE_COLLECTION = 'pressure_app_user_profiles';

function mapProfile(record) {
  return record ? withTimestamps(record) : null;
}

export const profileService = {
  async getByAuthUserId(authUserId) {
    const filter = pocketbase.filter('auth_user_id = {:authUserId}', {
      authUserId,
    });
    const record = await getOptionalRecord(() =>
      pocketbase.collection(PROFILE_COLLECTION).getFirstListItem(filter)
    );
    return mapProfile(record);
  },

  async getByUsername(username) {
    const filter = pocketbase.filter('username = {:username}', { username });
    const record = await getOptionalRecord(() =>
      pocketbase.collection(PROFILE_COLLECTION).getFirstListItem(filter, {
        fields: 'id',
      })
    );
    return record ? { id: record.id } : null;
  },

  async updateProfile(profileId, updates) {
    const record = await pocketbase
      .collection(PROFILE_COLLECTION)
      .update(profileId, updates);
    return mapProfile(record);
  },
};
