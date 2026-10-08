import { Alert, Button, Text } from '@mantine/core';
import { LoadingState } from '../../../shared/components/LoadingState';
import { formatPlace } from '../utils/format';

export function SavedLocationStatus({ saved, savedLocation = saved }) {
  const locationState = savedLocation ?? {};

  if (locationState.isPending) {
    return <LoadingState label="Loading saved location" variant="inline" />;
  }
  if (locationState.isError) {
    return (
      <Alert color="red" title="Could not load your location">
        {locationState.error.message}
        <Button variant="subtle" onClick={() => locationState.refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }
  if (locationState.data) {
    return (
      <Text>
        Saved: <strong>{formatPlace(locationState.data)}</strong>
      </Text>
    );
  }
  return <Text c="dimmed">No location saved yet.</Text>;
}
