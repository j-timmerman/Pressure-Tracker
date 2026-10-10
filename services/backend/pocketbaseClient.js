import PocketBase from 'pocketbase';

const pocketbaseUrl = (
  import.meta.env.DEV
    ? import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
    : window.location.origin
).replace(/\/+$/, '');

export const pocketbase = new PocketBase(pocketbaseUrl);

export const pocketbaseAdminUrl = import.meta.env.DEV
  ? import.meta.env.VITE_POCKETBASE_ADMIN_URL || `${pocketbaseUrl}/_/`
  : `${pocketbaseUrl}/_/`;