import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { locationService } from '../../../../services/backend/locationService';
import { weatherService } from '../../../services/weather/weatherService';

export const locationQueryKeys = {
  all: ['locations'],
  saved: (userId) => ['locations', userId, 'saved'],
  search: (search) => ['locations', 'search', search],
};

export function useSavedLocation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: locationQueryKeys.saved(user?.id),
    queryFn: () => locationService.getSaved(user.id),
    enabled: !!user,
  });
}

export function useLocationSearch(search) {
  return useQuery({
    queryKey: locationQueryKeys.search(search),
    queryFn: ({ signal }) => weatherService.searchLocations(search, signal),
    enabled: search.length >= 2,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSaveLocation(existingLocationId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = locationQueryKeys.saved(user?.id);

  return useMutation({
    mutationFn: (place) =>
      locationService.save(user.id, place, existingLocationId),
    onSuccess: (location) => queryClient.setQueryData(queryKey, location),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
