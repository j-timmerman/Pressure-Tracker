import { useEffect, useState } from 'react';
import {
  Box,
  Center,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@mantine/core';

const APPEARANCE_DELAY = 180;

function ForecastSkeleton({ showLocation }) {
  return (
    <Stack gap="md">
      {showLocation && (
        <Stack gap={8}>
          <Skeleton height={24} width="min(260px, 70%)" radius="sm" />
          <Skeleton height={14} width="min(310px, 85%)" radius="sm" />
          <Skeleton height={14} width="min(440px, 95%)" radius="sm" />
        </Stack>
      )}
      <Paper withBorder p="md" style={{ minWidth: 0 }}>
        <Skeleton height={380} radius="sm" />
      </Paper>
    </Stack>
  );
}

function FullscreenSkeleton() {
  return (
    <Center h="100dvh" p="md">
      <Stack align="center" gap="sm" w={220}>
        <Text fw={700} size="lg">
          Pressure Tracker
        </Text>
        <Skeleton height={6} width="100%" radius="xl" />
      </Stack>
    </Center>
  );
}

function SummarySkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" w="100%">
      <Skeleton height={116} radius="md" />
      <Skeleton height={116} radius="md" />
    </SimpleGrid>
  );
}

export function LoadingState({
  label = 'Loading',
  variant = 'forecast',
  showLocation = true,
  delay = APPEARANCE_DELAY,
}) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;

    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return (
    <Box role="status" aria-live="polite" aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      {visible && (
        <Box className="loading-state">
          {variant === 'fullscreen' ? (
            <FullscreenSkeleton />
          ) : variant === 'inline' ? (
            <Skeleton height={20} width="min(240px, 70%)" radius="sm" />
          ) : variant === 'summary' ? (
            <SummarySkeleton />
          ) : (
            <ForecastSkeleton showLocation={showLocation} />
          )}
        </Box>
      )}
    </Box>
  );
}
