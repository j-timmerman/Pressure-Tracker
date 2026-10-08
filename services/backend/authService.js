import { pocketbase } from './pocketbaseClient';

const USERS_COLLECTION = 'users';

function currentSession(record = pocketbase.authStore.record) {
  if (!pocketbase.authStore.isValid || !record) return null;

  return {
    access_token: pocketbase.authStore.token,
    user: {
      ...record,
      id: record.id,
      email: record.email,
    },
  };
}

export const authService = {
  onSessionChange(callback) {
    return pocketbase.authStore.onChange((_token, record) => {
      callback(currentSession(record));
    });
  },

  async signInWithPassword(email, password) {
    await pocketbase
      .collection(USERS_COLLECTION)
      .authWithPassword(email, password);
    return { session: currentSession() };
  },

  async signUpWithPassword(email, password, fullName) {
    await pocketbase.collection(USERS_COLLECTION).create({
      email,
      password,
      passwordConfirm: password,
      name: fullName?.trim() || '',
    });

    try {
      await pocketbase
        .collection(USERS_COLLECTION)
        .authWithPassword(email, password);
      return { session: currentSession() };
    } catch (error) {
      await pocketbase.collection(USERS_COLLECTION).requestVerification(email);
      return { session: null, user: null, error };
    }
  },

  async updatePassword(currentPassword, password) {
    const userId = pocketbase.authStore.record?.id;
    if (!userId) throw new Error('You must be signed in to change your password.');

    const record = await pocketbase.collection(USERS_COLLECTION).update(userId, {
      oldPassword: currentPassword,
      password,
      passwordConfirm: password,
    });
    return { user: record };
  },

  async signOut() {
    pocketbase.authStore.clear();
  },

  async getSession() {
    if (!pocketbase.authStore.isValid) {
      pocketbase.authStore.clear();
      return null;
    }

    try {
      await pocketbase.collection(USERS_COLLECTION).authRefresh();
      return currentSession();
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        pocketbase.authStore.clear();
        return null;
      }
      throw error;
    }
  },
};
