import { Alert, Button, Stack, Title } from '@mantine/core';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LoadingState } from '../../../shared/components/LoadingState';
import { usePressureForecast } from '../../forecast/hooks/usePressureForecast';
import { useSavedLocation } from '../../locations/hooks/useSavedLocation';
import { formatPlace } from '../../settings/utils/format';
import { useJournalEntry } from '../hooks/useJournal';
import { JournalEntryForm } from '../components/JournalEntryForm';

function CreateJournalEntryPage({ startMigraine, saved, forecast }) {
  if (saved.isPending || (!!saved.data && forecast.isPending)) {
    return <LoadingState label="Preparing journal entry" variant="inline" />;
  }

  const location = saved.data
    ? {
        id: saved.data.id,
        label: formatPlace(saved.data).slice(0, 200),
      }
    : null;

  return (
    <Stack w="100%" maw={680} mx="auto">
      {(saved.isError || forecast.isError) && (
        <Alert
          color="yellow"
          title="Pressure snapshot unavailable"
          maw={680}
          mb="md"
        >
          You can still save symptoms. No pressure snapshot will be saved
          without matching hourly data.
        </Alert>
      )}
      <JournalEntryForm
        initialEntry={null}
        location={location}
        forecastData={forecast.data}
        startMigraine={startMigraine}
      />
    </Stack>
  );
}

export function JournalFormPage({ mode }) {
  const { entryId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = mode === 'edit';
  const entry = useJournalEntry(isEditing ? entryId : null);
  const saved = useSavedLocation();
  const forecast = usePressureForecast(saved.data);

  if (isEditing && entry.isPending) {
    return <LoadingState label="Loading journal entry" variant="inline" />;
  }

  if (
    isEditing &&
    entry.data &&
    (saved.isPending ||
      (entry.data.location_id === saved.data?.id && forecast.isPending))
  ) {
    return <LoadingState label="Preparing pressure reading" variant="inline" />;
  }

  if (isEditing && entry.isError) {
    return (
      <Alert color="red" title="Could not load journal entry">
        {entry.error.message}
        <Button variant="subtle" onClick={() => entry.refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (isEditing && !entry.data) {
    return (
      <Stack align="flex-start">
        <Title order={2}>Entry not found</Title>
        <Button component={Link} to="/journal" variant="light">
          Back to journal
        </Button>
      </Stack>
    );
  }

  return isEditing ? (
    <JournalEntryForm
      initialEntry={entry.data}
      location={null}
      forecastData={
        entry.data.location_id === saved.data?.id ? forecast.data : null
      }
      endMigraine={searchParams.get('end') === '1' && entry.data.is_ongoing}
    />
  ) : (
    <CreateJournalEntryPage
      startMigraine={searchParams.get('migraine') === '1'}
      saved={saved}
      forecast={forecast}
    />
  );
}
