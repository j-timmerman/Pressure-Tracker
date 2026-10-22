import {
  Alert,
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { useSaveJournalEntry } from '../hooks/useJournal';
import {
  createJournalFormValues,
  createJournalPayload,
  validateEndedAt,
} from '../utils/formValues';
import { toDateTimeInput } from '../utils/journal';

const SEVERITY_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const value = String(index + 1);
  return { value, label: `${value}/10` };
});

export function JournalEntryForm({
  initialEntry,
  location,
  forecastData,
  startMigraine = false,
  endMigraine = false,
}) {
  const navigate = useNavigate();
  const isEditing = !!initialEntry;
  const saveEntry = useSaveJournalEntry(initialEntry?.id);

  const form = useForm({
    initialValues: createJournalFormValues(initialEntry, {
      startMigraine,
      endMigraine,
    }),
    // Input Validation 
    validate: {
      occurredAt: (value) =>
        Number.isFinite(new Date(value).getTime())
          ? null
          : 'Enter a valid date and time',
      endedAt: validateEndedAt,
      symptoms: (value) => {
        const length = value.trim().length;
        if (length === 0) return 'Describe your symptoms';
        return length <= 2000
          ? null
          : 'Symptoms must be 2,000 characters or fewer';
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    saveEntry.mutate(
      createJournalPayload(values, {
        initialEntry,
        location,
        forecastData,
      }),
      {
        onSuccess: (entry) => {
          notifications.show({
            color: 'blue',
            message: isEditing
              ? 'Journal entry updated'
              : 'Journal entry created',
          });
          navigate(`/journal/${entry.id}`, { replace: true });
        },
      }
    );
  });

  return (
    <Stack w="100%" maw={680} mx="auto">
      <Button
        component={Link}
        to={isEditing ? `/journal/${initialEntry.id}` : '/journal'}
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        style={{ alignSelf: 'flex-start' }}
      >
        {isEditing ? 'Entry' : 'Journal'}
      </Button>

      <Title order={2}>{isEditing ? 'Edit entry' : 'New journal entry'}</Title>

      {saveEntry.isError && (
        <Alert color="red" title="Could not save journal entry">
          {saveEntry.error.message}
        </Alert>
      )}

      <Paper withBorder p="lg">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              type="datetime-local"
              label="When symptoms began"
              required
              {...form.getInputProps('occurredAt')}
            />
            <Checkbox
              label="Migraine is ongoing"
              {...form.getInputProps('isOngoing', { type: 'checkbox' })}
              onChange={(event) => {
                form.setFieldValue('isOngoing', event.currentTarget.checked);
                if (event.currentTarget.checked) {
                  form.setFieldValue('endedAt', '');
                } else if (!form.values.endedAt) {
                  form.setFieldValue('endedAt', toDateTimeInput(new Date()));
                }
              }}
            />
            {!form.values.isOngoing && (
              <TextInput
                type="datetime-local"
                label="Migraine ended"
                description="Used for duration and an automatic end pressure snapshot"
                {...form.getInputProps('endedAt')}
              />
            )}
            <Textarea
              label="Symptoms"
              placeholder="Describe what you experienced"
              minRows={3}
              autosize
              required
              maxLength={2000}
              {...form.getInputProps('symptoms')}
            />
            <Select
              label="Severity"
              placeholder="Optional"
              data={SEVERITY_OPTIONS}
              clearable
              {...form.getInputProps('severity')}
            />
            <Textarea
              label="Notes"
              placeholder="Optional context, triggers, or actions taken"
              minRows={3}
              autosize
              {...form.getInputProps('notes')}
            />

            <Text size="sm" c="dimmed">
              Pressure snapshots near the start and end are saved automatically
              when hourly data is available. You can see them in the entry.
            </Text>

            <Group justify="flex-start">
              <Button
                component={Link}
                to={isEditing ? `/journal/${initialEntry.id}` : '/journal'}
                variant="default"
              >
                Cancel
              </Button>
              <Button type="submit" loading={saveEntry.isPending}>
                {isEditing ? 'Save changes' : 'Create entry'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
