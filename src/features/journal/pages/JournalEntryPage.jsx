import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_PRESSURE_UNIT } from '../../../shared/constants/pressure';
import { LoadingState } from '../../../shared/components/LoadingState';
import { convertPressure, formatPressure } from '../../forecast/utils/pressure';
import { useUserSettings } from '../../settings/hooks/useUserSettings';
import { useDeleteJournalEntry, useJournalEntry } from '../hooks/useJournal';
import { formatDuration, formatEntryDate } from '../utils/journal';

export function JournalEntryPage() {
  const { entryId } = useParams();
  const entry = useJournalEntry(entryId);
  const settings = useUserSettings();
  const navigate = useNavigate();
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const pressureUnit = settings.data?.pressure_unit ?? DEFAULT_PRESSURE_UNIT;

  const removeEntry = useDeleteJournalEntry(entryId);

  function handleDelete() {
    removeEntry.mutate(undefined, {
      onSuccess: () => {
        notifications.show({ color: 'blue', message: 'Journal entry deleted' });
        navigate('/journal', { replace: true });
      },
    });
  }

  if (entry.isPending) {
    return <LoadingState label="Loading journal entry" variant="inline" />;
  }

  if (entry.isError) {
    return (
      <Alert color="red" title="Could not load journal entry">
        {entry.error.message}
        <Button variant="subtle" onClick={() => entry.refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!entry.data) {
    return (
      <Stack align="flex-start">
        <Title order={2}>Entry not found</Title>
        <Button component={Link} to="/journal" variant="light">
          Back to journal
        </Button>
      </Stack>
    );
  }

  const pressure =
    entry.data.pressure_hpa === null
      ? null
      : formatPressure(
          convertPressure(entry.data.pressure_hpa, pressureUnit),
          pressureUnit
        );

  // If the start and end readings resolve to the same forecast timestamp,
  // don't record a separate end pressure. This can happen when the nearest
  // reading is the same for both times, e.g. a log started at 2:00pm and ended
  // at 2:25pm but both map to the 2:00pm forecast sample. Using two different
  // pressures for the same timestamp would be misleading.
  const sameReadingTime =
    entry.data.pressure_observed_at &&
    entry.data.end_pressure_observed_at &&
    new Date(entry.data.pressure_observed_at).getTime() ===
      new Date(entry.data.end_pressure_observed_at).getTime();
  const endPressure =
    sameReadingTime || entry.data.end_pressure_hpa === null
      ? null
      : formatPressure(
          convertPressure(entry.data.end_pressure_hpa, pressureUnit),
          pressureUnit
        );
  const pressureChange =
    sameReadingTime ||
    entry.data.pressure_hpa === null ||
    entry.data.end_pressure_hpa === null
      ? null
      : convertPressure(
          entry.data.end_pressure_hpa - entry.data.pressure_hpa,
          pressureUnit
        );

  return (
    <Stack w="100%" maw={760} mx="auto">
      {/* Delete confirmation */}
      <Modal
        opened={deleteOpened}
        onClose={() => {
          if (!removeEntry.isPending) closeDelete();
        }}
        title="Delete journal entry?"
        centered
        closeOnClickOutside={!removeEntry.isPending}
        closeOnEscape={!removeEntry.isPending}
        withCloseButton={!removeEntry.isPending}
      >
        <Stack>
          <Text>
            This entry will be permanently deleted. This action cannot be
            undone.
          </Text>
          {removeEntry.isError && (
            <Alert color="red" title="Could not delete journal entry">
              {removeEntry.error.message}
            </Alert>
          )}
          <Group justify="flex-start">
            <Button
              variant="default"
              onClick={closeDelete}
              disabled={removeEntry.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              variant="light"
              loading={removeEntry.isPending}
              onClick={handleDelete}
            >
              Delete entry
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Button
        component={Link}
        to="/journal"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        style={{ alignSelf: 'flex-start' }}
      >
        Journal
      </Button>

      {/* Entry actions */}
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={2}>Journal entry</Title>
          <Text c="dimmed">
            Started {formatEntryDate(entry.data.occurred_at)}
          </Text>
        </Stack>
        <Group gap="xs">
          <Button
            component={Link}
            to={`/journal/${entryId}/edit`}
            variant="light"
            leftSection={<IconEdit size={16} />}
          >
            Edit
          </Button>
          {entry.data.is_ongoing && (
            <Button
              component={Link}
              to={`/journal/${entryId}/edit?end=1`}
              variant="outline"
            >
              End migraine log
            </Button>
          )}
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => {
              removeEntry.reset();
              openDelete();
            }}
          >
            Delete
          </Button>
        </Group>
      </Group>

      {/* Entry details */}
      <Paper withBorder p="lg">
        <Stack>
          {entry.data.is_ongoing && (
            <Badge variant="light">Ongoing migraine</Badge>
          )}
          {entry.data.ended_at && (
            <Text size="sm" c="dimmed">
              Ended {formatEntryDate(entry.data.ended_at)} · Duration{' '}
              {formatDuration(entry.data.occurred_at, entry.data.ended_at)}
            </Text>
          )}
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start">
              <Title order={3}>Symptoms</Title>
              {entry.data.severity !== null && (
                <Badge variant="light">Severity {entry.data.severity}/10</Badge>
              )}
            </Group>
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {entry.data.symptoms}
            </Text>
          </Stack>

          {entry.data.notes && (
            <>
              <Divider />
              <Stack gap={6}>
                <Text fw={600}>Notes</Text>
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {entry.data.notes}
                </Text>
              </Stack>
            </>
          )}

          <Divider />
          <SimpleGrid cols={{ base: 1, sm: endPressure !== null ? 3 : 2 }}>
            <Stack gap={2}>
              <Text size="sm" c="dimmed">
                Pressure near symptom start
              </Text>
              <Text fw={500}>
                {pressure === null
                  ? 'Not recorded'
                  : `${pressure} ${pressureUnit}`}
              </Text>
              {entry.data.pressure_observed_at && (
                <Text size="xs" c="dimmed">
                  Reading time{' '}
                  {formatEntryDate(entry.data.pressure_observed_at)}
                </Text>
              )}
            </Stack>
            {endPressure !== null && (
              <Stack gap={2}>
                <Text size="sm" c="dimmed">
                  Pressure near symptom end
                </Text>
                <Text fw={500}>{`${endPressure} ${pressureUnit}`}</Text>
                {entry.data.end_pressure_observed_at && (
                  <Text size="xs" c="dimmed">
                    Reading time{' '}
                    {formatEntryDate(entry.data.end_pressure_observed_at)}
                  </Text>
                )}
              </Stack>
            )}
            <Stack gap={2}>
              <Text size="sm" c="dimmed">
                Location
              </Text>
              <Text fw={500}>
                {entry.data.location_label ?? 'Not recorded'}
              </Text>
            </Stack>
          </SimpleGrid>
          {pressureChange !== null && (
            <Text size="sm" c="dimmed">
              Change from start to end: {pressureChange > 0 ? '+' : ''}
              {formatPressure(pressureChange, pressureUnit)} {pressureUnit}
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
