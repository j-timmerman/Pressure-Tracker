import PocketBase from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, '');

if (!pocketbaseUrl) {
  throw new Error(
    'Missing VITE_POCKETBASE_URL. Add the public PocketBase URL to your .env file.'
  );
}

export const pocketbase = new PocketBase(pocketbaseUrl);

export const pocketbaseAdminUrl =
  import.meta.env.VITE_POCKETBASE_ADMIN_URL || `${pocketbaseUrl}/_/`;
