async function getJson(url, signal) {
  // Fetch JSON data from a given URL, handling errors and abort signals.

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Open-Meteo request failed (${response.status}). Please try again.`);

  const data = await response.json();

  if (data.error) throw new Error(data.reason || 'Open-Meteo could not complete the request.');

  return data;

}

export const weatherService = {

  async searchLocations(search, signal) {
    // Search for locations using the Open-Meteo Geocoding API.
    // The API returns a list of places matching the search query, including their coordinates and timezone.
    
    const params = new URLSearchParams({ name: search.trim(), count: '10', language: 'en', format: 'json' });
    const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`, signal);

    return (data.results ?? []).filter((place) => place.timezone).map((place) => ({
      id: String(place.id),
      city: place.name,
      region: place.admin1 ?? '',
      country: place.country ?? '',
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    }));
  },

  async getPressure(location, signal) {
    // Fetch pressure data for a given location using the Open-Meteo Weather API.
    // Six calendar forecast days cover a full five days from the current hour.

    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      hourly: 'pressure_msl',
      past_days: '5',
      forecast_days: '6',
      timezone: location.timezone,
      timeformat: 'unixtime',
    });

    const data = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`, signal);

    const times = data.hourly?.time;
    const pressures = data.hourly?.pressure_msl;

    if (!Array.isArray(times) || !Array.isArray(pressures) || times.length !== pressures.length
      || data.hourly_units?.pressure_msl !== 'hPa') {
      throw new Error('Open-Meteo returned an unexpected pressure response.');
    }

    // Convert the times from seconds to milliseconds and pair them with their corresponding pressure values.
    return times.map((time, index) => ({
      time: time * 1000,
      pressure: Number.isFinite(pressures[index]) ? pressures[index] : null,
    }));
  },
};
