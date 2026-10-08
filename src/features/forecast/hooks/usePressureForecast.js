import { useQuery } from '@tanstack/react-query';
import { weatherService } from '../../../services/weather/weatherService';

export const forecastQueryKeys = {
  all: ['forecast'],
  pressure: (location) => [
    'forecast',
    'pressure',
    location?.latitude,
    location?.longitude,
    location?.timezone,
  ],
};

export function usePressureForecast(location) {
  return useQuery({
    queryKey: forecastQueryKeys.pressure(location),
    queryFn: ({ signal }) => weatherService.getPressure(location, signal),
    enabled: !!location,
    staleTime: 15 * 60 * 1000,
  });
}
