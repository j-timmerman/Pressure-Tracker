import { useEffect } from 'react';
import {
  Title,
  Paper,
  Stack,
  TextInput,
  Button,
  Text,
  Center,
  Alert,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { LoadingState } from '../../../shared/components/LoadingState';
import { useChangePassword } from '../../auth/hooks/useChangePassword';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';

export function ProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const updateProfile = useUpdateProfile(profile.data?.id);
  const changePassword = useChangePassword();

  const form = useForm({
    initialValues: {
      username: '',
    },
    validate: {
      username: (v) =>
        v.trim().length >= 3 ? null : 'Username must be at least 3 characters',
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) =>
        value ? null : 'Enter your current password',
      newPassword: (value) =>
        value.length >= 8 ? null : 'Password must be at least 8 characters',
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Passwords do not match',
    },
  });

  // Populate the form after the profile query resolves.
  useEffect(() => {
    if (profile.data) {
      form.setValues({ username: profile.data.username ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data]);

  const handleSubmit = (values) => {
    updateProfile.mutate(
      { username: values.username.trim() },
      {
        onSuccess: () =>
          notifications.show({ color: 'blue', message: 'Profile updated' }),
      }
    );
  };

  const handlePasswordSubmit = (values) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        passwordForm.reset();
        notifications.show({
          color: 'blue',
          message: 'Password updated',
        });
      },
    });
  };

  if (profile.isPending) {
    return <LoadingState label="Loading your profile" variant="inline" />;
  }

  if (profile.isError) {
    return (
      <Alert color="red" title="Could not load your profile">
        {profile.error.message}
        <Button variant="subtle" onClick={() => profile.refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!profile.data) {
    return (
      <Center py="xl">
        <Text c="dimmed">No profile found for this account.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md" w="100%" maw={520} mx="auto">
      <Title order={2}>My Profile</Title>

      <Paper withBorder p="lg" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Title order={3}>Profile</Title>
            {updateProfile.isError && (
              <Alert color="red" title="Could not update your profile">
                {updateProfile.error.message}
              </Alert>
            )}
            <TextInput
              label="Username"
              required
              {...form.getInputProps('username')}
            />
            <Text size="xs" c="dimmed">
              Member since{' '}
              {new Date(profile.data.created_at).toLocaleDateString()}
            </Text>
            <Button type="submit" loading={updateProfile.isPending} style={{ alignSelf: 'flex-start' }} >
              Save changes
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Title order={3}>Account</Title>
          <Text>Email: {user?.email ?? ''}</Text>

          <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
            <Stack>
              <Text fw={600}>Change password</Text>

              {changePassword.isError && (
                <Alert color="red" title="Could not update your password">
                  {changePassword.error.message}
                </Alert>
              )}

              <PasswordInput
                label="Current password"
                autoComplete="current-password"
                required
                {...passwordForm.getInputProps('currentPassword')}
              />
              <PasswordInput
                label="New password"
                description="Use at least 8 characters."
                autoComplete="new-password"
                required
                {...passwordForm.getInputProps('newPassword')}
              />
              <PasswordInput
                label="Confirm new password"
                autoComplete="new-password"
                required
                {...passwordForm.getInputProps('confirmPassword')}
              />
              <Button
                type="submit"
                loading={changePassword.isPending}
                style={{ alignSelf: 'flex-start' }}
              >
                Change password
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
