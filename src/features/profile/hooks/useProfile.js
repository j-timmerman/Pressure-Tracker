import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../../../services/backend/profileService';
import { useAuth } from '../../auth/hooks/useAuth';

export const profileQueryKey = (userId) => ['profile', userId];

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileQueryKey(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: () => profileService.getByAuthUserId(user.id),
  });
}

export function useUpdateProfile(profileId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = profileQueryKey(user?.id);

  return useMutation({
    mutationFn: (updates) => profileService.updateProfile(profileId, updates),
    onSuccess: (profile) => queryClient.setQueryData(queryKey, profile),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
