import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../../../services/backend/settingsService';
import { useAuth } from '../../auth/hooks/useAuth';

export const userSettingsQueryKey = (userId) => ['user-settings', userId];

export function useUserSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: userSettingsQueryKey(user?.id),
    queryFn: () => settingsService.get(user.id),
    enabled: !!user,
  });
}

export function useUpdatePressureUnit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = userSettingsQueryKey(user?.id);

  return useMutation({
    mutationFn: (pressureUnit) =>
      settingsService.updatePressureUnit(user.id, pressureUnit),
    onMutate: async (pressureUnit) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSettings = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (current) => ({
        ...current,
        pressure_unit: pressureUnit,
      }));
      return { previousSettings };
    },
    onError: (_error, _pressureUnit, context) => {
      queryClient.setQueryData(queryKey, context?.previousSettings);
    },
    onSuccess: (settings) => queryClient.setQueryData(queryKey, settings),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useUpdateWatchLevels() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = userSettingsQueryKey(user?.id);

  return useMutation({
    mutationFn: (watchLevels) =>
      settingsService.updateWatchLevels(user.id, watchLevels),
    onSuccess: (settings) => queryClient.setQueryData(queryKey, settings),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
