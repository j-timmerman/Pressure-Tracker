export function isNotFound(error) {
  // PocketBase client errors expose the HTTP response code as `status`.
  return error?.status === 404;
}

export async function getOptionalRecord(fetchRecord) {
  // Preserve the old service contract: an optional missing row is null, while
  // authentication, validation, and network errors still reach the frontend.
  try {
    return await fetchRecord();
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function nullableNumber(value) {
  // PocketBase returns an unset number field as 0; optional journal numbers
  // were null in the previous backend and are still treated that way by React.
  return value === 0 || value === '' || value === null || value === undefined
    ? null
    : Number(value);
}

export function nullableString(value) {
  // PocketBase represents unset text, date, and relation fields as "".
  return value === '' || value === null || value === undefined ? null : value;
}

export function withTimestamps(record) {
  // Keep the Supabase-style timestamp names consumed by the existing frontend.
  return {
    ...record,
    created_at: record.created_at || record.created,
    updated_at: record.updated_at || record.updated,
  };
}
