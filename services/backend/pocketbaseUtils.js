export function isNotFound(error) {
  return error?.status === 404;
}

export async function getOptionalRecord(fetchRecord) {
  try {
    return await fetchRecord();
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function nullableNumber(value) {
  return value === 0 || value === '' || value === null || value === undefined
    ? null
    : Number(value);
}

export function nullableString(value) {
  return value === '' || value === null || value === undefined ? null : value;
}

export function withTimestamps(record) {
  return {
    ...record,
    created_at: record.created_at || record.created,
    updated_at: record.updated_at || record.updated,
  };
}
