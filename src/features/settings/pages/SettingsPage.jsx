import { useState } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  useLocationSearch,
  useSavedLocation,
  useSaveLocation,
} from '../../locations/hooks/useSavedLocation';
import { DEFAULT_PRESSURE_UNIT } from '../../../shared/constants/pressure';
import { formatPlace } from '../utils/format';
import {
  useUpdatePressureUnit,
  useUpdateWatchLevels,
  useUserSettings,
} from '../hooks/useUserSettings';
import { LocationSearchForm } from '../components/LocationSearchForm';
import { SavedLocationStatus } from '../components/SavedLocationStatus';
import { pocketbaseAdminUrl } from '../../../../services/backend/pocketbaseClient';

// Notice delivery is not implemented yet.
const NOTICES_DISABLED = true;

export function SettingsPage() {
  const saved = useSavedLocation();
  const settings = useUserSettings();

  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [watchLevelsInput, setWatchLevelsInput] = useState('');
  const [watchLevelsError, setWatchLevelsError] = useState('');

  const showNotices = false;

  const places = useLocationSearch(submittedSearch);
  const savedLocation = useSaveLocation(saved.data?.id);
  const savePressureUnit = useUpdatePressureUnit();
  const saveWatchLevels = useUpdateWatchLevels();

  const pressureUnit = settings.data?.pressure_unit ?? DEFAULT_PRESSURE_UNIT;
  const savedWatchLevelsText = (settings.data?.watch_levels ?? [])
    .map((value) =>
      Number(value)
        .toFixed(pressureUnit === 'inHg' ? 2 : 1)
        .replace(/\.0+$/, '')
    )
    .join(', ');
  const currentWatchLevelsText = watchLevelsInput || savedWatchLevelsText;

  const selected = places.data?.find((place) => place.id === selectedId);

  // Convert the comma-separated input into the numeric array stored in settings.
  function parseWatchLevels(value) {
    if (!value.trim()) return [];

    const entries = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    const parsed = entries.map((entry) => Number(entry));
    const invalid = parsed.some(
      (entry) => !Number.isFinite(entry) || entry <= 0
    );

    if (invalid) {
      return null;
    }

    return parsed;
  }

  function handleSearchSubmit() {
    const trimmed = search.trim();
    if (trimmed.length < 2) return;

    setSelectedId(null);
    savedLocation.reset();
    setSubmittedSearch(trimmed);
    if (trimmed === submittedSearch) places.refetch();
  }

  function handleSelectChange(value) {
    setSelectedId(value);
    savedLocation.reset();
  }

  function handleWatchLevelsSubmit() {
    const parsedLevels = parseWatchLevels(watchLevelsInput);

    if (parsedLevels === null) {
      setWatchLevelsError(
        'Enter positive numbers only, separated by commas, e.g. 1012, 1016, 1020.'
      );
      return;
    }

    setWatchLevelsError('');
    const normalizedInput = parsedLevels
      .map((value) =>
        Number(value)
          .toFixed(pressureUnit === 'inHg' ? 2 : 1)
          .replace(/\.0+$/, '')
      )
      .join(', ');
    setWatchLevelsInput(normalizedInput);
    saveWatchLevels.mutate(parsedLevels, {
      onSuccess: (updatedSettings) => {
        setWatchLevelsInput((updatedSettings.watch_levels ?? []).join(', '));
        setWatchLevelsError('');
        notifications.show({
          color: 'blue',
          message: 'Levels to watch updated',
        });
      },
    });
  }

  const locationOptions =
    places.data?.map((place) => ({
      value: place.id,
      label: formatPlace(place),
    })) ?? [];

  let resultsPlaceholder = 'Search to see matching locations';
  if (places.isFetching) resultsPlaceholder = 'Searching…';
  else if (submittedSearch && places.isSuccess && !places.data.length) {
    resultsPlaceholder = 'No matching locations';
  } else if (locationOptions.length) {
    resultsPlaceholder = 'Select a search result';
  }

  return (
    <Stack w="100%" maw={700} mx="auto">
      <Title order={2}>Settings</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Forecast location */}
        <Paper withBorder p="lg" style={{ gridColumn: '1 / -1' }}>
          <Stack>
            <Title order={3}>Forecast location</Title>
            <Text c="dimmed">
              Save one location to use for your pressure forecast. Saving
              another city replaces it.
            </Text>

            <SavedLocationStatus saved={saved} />

            <LocationSearchForm
              search={search}
              setSearch={setSearch}
              onSubmit={handleSearchSubmit}
              isSearching={places.isFetching}
              isSaving={savedLocation.isPending}
            />

            {places.isError && (
              <Alert color="red" title="Search failed">
                {places.error.message}
              </Alert>
            )}

            <Select
              label="Search results"
              placeholder={resultsPlaceholder}
              value={selectedId}
              onChange={handleSelectChange}
              disabled={
                !locationOptions.length ||
                savedLocation.isPending ||
                places.isFetching
              }
              data={locationOptions}
            />

            {savedLocation.isError && (
              <Alert color="red" title="Could not save location">
                {savedLocation.error.message}
              </Alert>
            )}

            <Button
              onClick={() =>
                savedLocation.mutate(selected, {
                  onSuccess: (location) => {
                    setSelectedId(null);
                    notifications.show({
                      color: 'blue',
                      title: 'Location saved',
                      message: `${formatPlace(location)} will now be used for your forecast.`,
                    });
                  },
                })
              }
              disabled={!selected || !saved.isSuccess || places.isFetching}
              loading={savedLocation.isPending}
              style={{ alignSelf: 'flex-start' }}
            >
              Save location
            </Button>

            <Text size="xs" c="dimmed">
              Location search by{' '}
              <Anchor
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </Anchor>{' '}
              and{' '}
              <Anchor
                href="https://www.geonames.org/"
                target="_blank"
                rel="noreferrer"
              >
                GeoNames
              </Anchor>
              .
            </Text>
          </Stack>
        </Paper>

        {/* Pressure unit */}
        <Paper withBorder p="lg">
          <Stack>
            <Stack gap={2}>
              <Title order={3}>Units</Title>
              <Text c="dimmed" size="sm">
                Choose how pressure values are displayed. Changes save
                automatically.
              </Text>
            </Stack>

            {settings.isError && (
              <Alert color="red" title="Could not load your unit preference">
                {settings.error.message}
                <Button variant="subtle" onClick={() => settings.refetch()}>
                  Retry
                </Button>
              </Alert>
            )}

            {savePressureUnit.isError && (
              <Alert color="red" title="Could not save your unit preference">
                {savePressureUnit.error.message}
              </Alert>
            )}

            <SegmentedControl
              aria-label="Pressure unit"
              value={pressureUnit}
              onChange={(value) =>
                savePressureUnit.mutate(value, {
                  onSuccess: (updatedSettings) => {
                    setWatchLevelsInput(
                      (updatedSettings.watch_levels ?? []).join(', ')
                    );
                    setWatchLevelsError('');
                    notifications.show({
                      color: 'blue',
                      message: 'Pressure unit updated',
                    });
                  },
                })
              }
              data={[
                { label: 'hPa', value: 'hPa' },
                { label: 'inHg', value: 'inHg' },
              ]}
              disabled={settings.isPending || savePressureUnit.isPending}
            />
          </Stack>
        </Paper>

        {/* Watch levels */}
        <Paper withBorder p="lg">
          <Stack>
            <Stack gap={2}>
              <Title order={3}>Levels to watch</Title>
              <Text c="dimmed" size="sm">
                Enter comma-separated pressure checkpoints in {pressureUnit}.
                These are kept with your current unit preference.
              </Text>
            </Stack>

            <TextInput
              label="Pressure levels"
              placeholder={
                pressureUnit === 'inHg'
                  ? `30, 35 ${pressureUnit}`
                  : `1012, 1016 ${pressureUnit}`
              }
              value={currentWatchLevelsText}
              onChange={(event) => {
                setWatchLevelsInput(event.currentTarget.value);
                if (watchLevelsError) setWatchLevelsError('');
              }}
              error={watchLevelsError}
              disabled={settings.isPending || saveWatchLevels.isPending}
            />

            <Button
              onClick={handleWatchLevelsSubmit}
              disabled={settings.isPending || saveWatchLevels.isPending}
              style={{ alignSelf: 'flex-start' }}
            >
              Save levels
            </Button>
          </Stack>
        </Paper>

        {/* Notices (hidden until delivery is implemented) */}
        {showNotices && (
          <Paper withBorder p="lg" style={{ gridColumn: '1 / -1' }}>
            <Stack>
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Title order={3}>Notices</Title>
                  <Text c="dimmed" size="sm">
                    Get notified when pressure changes by a chosen amount.
                  </Text>
                </Stack>
                <Badge color="gray" variant="light">
                  Coming soon
                </Badge>
              </Group>

              <Switch
                label="Pressure-change notices"
                description="Send a notice when the configured change occurs."
                disabled={NOTICES_DISABLED}
              />

              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Direction
                </Text>
                <SegmentedControl
                  aria-label="Pressure change direction"
                  defaultValue="either"
                  data={[
                    { label: 'Rise', value: 'rise' },
                    { label: 'Fall', value: 'fall' },
                    { label: 'Either', value: 'either' },
                  ]}
                  disabled={NOTICES_DISABLED}
                />
              </Stack>

              <Group grow align="flex-start">
                <NumberInput
                  label="Pressure change"
                  defaultValue={10}
                  min={0.1}
                  decimalScale={1}
                  suffix=" hPa"
                  disabled={NOTICES_DISABLED}
                />
                <Select
                  label="Within"
                  defaultValue="6"
                  data={[
                    { label: '3 hours', value: '3' },
                    { label: '6 hours', value: '6' },
                    { label: '12 hours', value: '12' },
                    { label: '24 hours', value: '24' },
                  ]}
                  disabled={NOTICES_DISABLED}
                />
              </Group>

              <Button
                disabled={NOTICES_DISABLED}
                style={{ alignSelf: 'flex-start' }}
              >
                Save preferences
              </Button>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      <Paper withBorder p="lg">
        <Stack align="flex-start">
          <Stack gap={2}>
            <Title order={3}>Administration</Title>
            <Text c="dimmed" size="sm">
              Manage accounts, collections, and PocketBase server settings in
              the separate administration dashboard.
            </Text>
          </Stack>
          <Button
            component="a"
            href={pocketbaseAdminUrl}
            target="_blank"
            rel="noreferrer"
            variant="light"
          >
            Open PocketBase admin
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
