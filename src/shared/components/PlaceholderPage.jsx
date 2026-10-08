import { Group, Stack, Text, Title } from '@mantine/core';

export function PlaceholderPage({ title, description }) {
  return (
    <Stack gap="xs">
      <Group gap="sm">
        <Title order={2}>{title}</Title>
      </Group>
      {description && <Text c="dimmed">{description}</Text>}
    </Stack>
  );
}
