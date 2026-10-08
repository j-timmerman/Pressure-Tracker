import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalService } from '../../../../services/backend/journalService';
import { useAuth } from '../../auth/hooks/useAuth';

export const journalQueryKeys = {
  all: (userId) => ['journal', userId],
  list: (userId) => ['journal', userId, 'list'],
  detail: (userId, entryId) => ['journal', userId, 'detail', entryId],
};

export function useJournalEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: journalQueryKeys.list(user?.id),
    queryFn: () => journalService.list(user.id),
    enabled: !!user,
  });
}

export function useJournalEntry(entryId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: journalQueryKeys.detail(user?.id, entryId),
    queryFn: () => journalService.getById(user.id, entryId),
    enabled: !!user && !!entryId,
  });
}

export function useSaveJournalEntry(entryId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) =>
      entryId
        ? journalService.update(user.id, entryId, values)
        : journalService.create(user.id, values),
    onSuccess: (entry) => {
      queryClient.setQueryData(
        journalQueryKeys.detail(user.id, entry.id),
        entry
      );
      queryClient.invalidateQueries({
        queryKey: journalQueryKeys.all(user.id),
      });
    },
  });
}

export function useDeleteJournalEntry(entryId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => journalService.remove(user.id, entryId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: journalQueryKeys.detail(user.id, entryId),
      });
      queryClient.invalidateQueries({
        queryKey: journalQueryKeys.all(user.id),
      });
    },
  });
}
