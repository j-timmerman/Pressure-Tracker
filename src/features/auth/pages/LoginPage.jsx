import {
  Box,
  Container,
  Title,
  Paper,
  Text,
  Stack,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/home';

  const handlePasswordLogin = async ({ email, password }) => {
    await signInWithPassword(email, password);
    navigate(from, { replace: true });
  };

  return (
    <Box
      style={{
        minHeight: '100dvh',
        padding: '24px',
      }}
    >
      <Container size={420} py={60}>
        <Stack gap="xs" mb="lg">
          <Title order={2} ta="center">
            Pressure Tracker
          </Title>
          <Text size="sm" ta="center">
            Sign in to track pressure forecasts and keep a journal.
          </Text>
        </Stack>
        <Paper withBorder shadow="md" p={30} radius="md">
          <AuthForm onPassword={handlePasswordLogin} passwordLabel="Sign in" />
        </Paper>
      </Container>
    </Box>
  );
}
