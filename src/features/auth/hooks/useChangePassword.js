import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../../services/backend/authService';

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.updatePassword(currentPassword, newPassword),
  });
}
