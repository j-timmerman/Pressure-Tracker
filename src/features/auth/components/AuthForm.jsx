import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';

export function AuthForm({ onPassword, passwordLabel, withName = false }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', fullName: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
      fullName: (v) =>
        withName && v.trim().length < 2 ? 'Name is required' : null,
      password: (v) =>
        v.length < 8 ? 'Password must be at least 8 characters' : null,
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    setLoading(true);
    try {
      await onPassword(values);
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}
        {withName && (
          <TextInput
            label="Username"
            placeholder="Jane Doe"
            required
            {...form.getInputProps('fullName')}
          />
        )}
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          required
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={loading} fullWidth mt="sm">
          {passwordLabel}
        </Button>
      </Stack>
    </form>
  );
}
