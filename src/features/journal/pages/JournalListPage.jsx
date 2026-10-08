import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { DEFAULT_PRESSURE_UNIT } from '../../../shared/constants/pressure';
import { LoadingState } from '../../../shared/components/LoadingState';
import { useUserSettings } from '../../settings/hooks/useUserSettings';
import { convertPressure, formatPressure } from '../../forecast/utils/pressure';
import { useJournalEntries } from '../hooks/useJournal';
import { formatDuration, formatEntryDate } from '../utils/journal';

export function JournalListPage() {
  const entries = useJournalEntries();
  const settings = useUserSettings();
  const pressureUnit = settings.data?.pressure_unit ?? DEFAULT_PRESSURE_UNIT;

  return (
    <Stack w="100%" maw={900} mx="auto">
      <Group justify="space-between">
        <Title order={2}>Journal</Title>
        <Button
          component={Link}
          to="/journal/new"
          leftSection={<IconPlus size={16} />}
        >
          New entry
        </Button>
      </Group>

      {/* Entry status */}
      {entries.isPending && (
        <LoadingState label="Loading journal entries" variant="inline" />
      )}

      {entries.isError && (
        <Alert color="red" title="Could not load journal entries">
          {entries.error.message}
          <Button variant="subtle" onClick={() => entries.refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {entries.isSuccess && entries.data.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="flex-start">
            <Text fw={600}>No journal entries yet</Text>
            <Text c="dimmed">
              Record symptoms alongside the pressure at the time they occurred.
            </Text>
            <Button component={Link} to="/journal/new" variant="light">
              Create your first entry
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Entries */}
      {entries.data?.map((entry) => (
        <Paper
          key={entry.id}
          component={Link}
          to={`/journal/${entry.id}`}
          withBorder
          p="md"
          className="journal-entry-card"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <Group wrap="nowrap">
            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {formatEntryDate(entry.occurred_at)}
                </Text>
                {entry.severity !== null && (
                  <Badge variant="light">Severity {entry.severity}/10</Badge>
                )}
                {entry.is_ongoing && <Badge variant="light">Ongoing</Badge>}
                {entry.ended_at && (
                  <Text size="sm" c="dimmed">
                    Duration:{' '}
                    {formatDuration(entry.occurred_at, entry.ended_at)}
                  </Text>
                )}
              </Group>
              <Text fw={600} lineClamp={2}>
                {entry.symptoms}
              </Text>
              <Text size="sm" c="dimmed">
                {entry.pressure_hpa === null
                  ? 'No start pressure recorded'
                  : `Reading near start: ${formatPressure(
                      convertPressure(entry.pressure_hpa, pressureUnit),
                      pressureUnit
                    )} ${pressureUnit}`}
                {entry.location_label ? ` · ${entry.location_label}` : ''}
              </Text>
            </Stack>
            <IconChevronRight size={20} aria-hidden="true" />
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
