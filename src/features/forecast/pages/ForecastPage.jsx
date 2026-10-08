import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useSavedLocation } from '../../locations/hooks/useSavedLocation';
import { useUserSettings } from '../../settings/hooks/useUserSettings';
import { DEFAULT_PRESSURE_UNIT } from '../../../shared/constants/pressure';
import { LoadingState } from '../../../shared/components/LoadingState';
import { PressureChart } from '../components/PressureChart';
import { usePressureForecast } from '../hooks/usePressureForecast';

const HOUR = 60 * 60 * 1000;

export function ForecastPage() {

  // Chart default state: show upcoming 5 days of pressure data
  const [direction, setDirection] = useState('upcoming');
  const [duration, setDuration] = useState('5days');
  
  const [rangeNow, setRangeNow] = useState(() => Date.now());
  const saved = useSavedLocation();
  const settings = useUserSettings();
  const location = saved.data;
  const pressureUnit = settings.data?.pressure_unit ?? DEFAULT_PRESSURE_UNIT;
  const watchLevels = settings.data?.watch_levels ?? [];
  const forecast = usePressureForecast(location);

  const hasPressure = forecast.data?.some((point) => point.pressure !== null);

  // Filter the forecast data for the chart based on the selected direction (past/upcoming) and duration (24 hours/5 days)
  const visibleData = useMemo(() => {
    if (!forecast.data) return [];
    const windowLength = duration === '24hours' ? 24 * HOUR : 5 * 24 * HOUR;
    const start = direction === 'past' ? rangeNow - windowLength : rangeNow;
    const end = direction === 'past' ? rangeNow : rangeNow + windowLength;
    return forecast.data.filter(
      (point) => point.time >= start && point.time <= end
    );
  }, [forecast.data, direction, duration, rangeNow]);

  const hasVisiblePressure = visibleData.some(
    (point) => point.pressure !== null
  );

  const rangeLabel = `${direction === 'past' ? 'Past' : 'Next'} ${duration === '24hours' ? '24 hours' : '5 days'}`;

  function handleDirectionChange(value) {
    setRangeNow(Date.now());
    setDirection(value);
  }

  function handleDurationChange(value) {
    setRangeNow(Date.now());
    setDuration(value);
  }

  return (
    <Stack w="100%" maw={1200} mx="auto">
      <Group justify="space-between">
        <Title order={2}>Forecast</Title>
        <Button component={Link} to="/settings" variant="filled">
          Change location
        </Button>
      </Group>

      {/* Location and preferences */}
      {saved.isPending && <LoadingState label="Loading your forecast" />}
      {saved.isError && (
        <Alert color="red" title="Could not load your location">
          {saved.error.message}
          <Button variant="subtle" onClick={() => saved.refetch()}>
            Retry
          </Button>
        </Alert>
      )}
      {settings.isError && !settings.data && (
        <Alert color="red" title="Could not load your unit preference">
          Pressure is being shown in {DEFAULT_PRESSURE_UNIT}.
          <Button variant="subtle" onClick={() => settings.refetch()}>
            Retry
          </Button>
        </Alert>
      )}
      {saved.isSuccess && !location && (
        <Paper withBorder p="lg">
          <Stack align="flex-start">
            <Text>
              Save a location in Settings to see its pressure forecast.
            </Text>
            <Button component={Link} to="/settings">
              Set your location
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Pressure forecast */}
      {location && (
        <>
          <Stack gap={4}>
            <Title order={3}>
              {[location.city, location.region, location.country]
                .filter(Boolean)
                .join(', ')}
            </Title>
            <Text c="dimmed">
              Mean-sea-level pressure · {pressureUnit} · hourly
            </Text>
            <Text size="sm" c="dimmed">
              Times shown in{' '} {location.timezone}.
            </Text>
          </Stack>
          {forecast.isPending && (
            <LoadingState label="Loading pressure data" showLocation={false} />
          )}
          {forecast.isError && (
            <Alert color="red" title="Could not load pressure data">
              {forecast.error.message}
              <Button variant="subtle" onClick={() => forecast.refetch()}>
                Retry
              </Button>
            </Alert>
          )}
          {forecast.isSuccess && !hasPressure && (
            <Alert>No pressure data is available for this location.</Alert>
          )}
          {hasPressure && (
            <>
              <Group gap="lg" wrap="wrap">
                <Stack gap={4}>
                  <Text size="sm" fw={500}>
                    When
                  </Text>
                  <SegmentedControl
                    aria-label="Past or upcoming pressure"
                    value={direction}
                    onChange={handleDirectionChange}
                    data={[
                      { value: 'past', label: 'Past' },
                      { value: 'upcoming', label: 'Upcoming' },
                    ]}
                  />
                </Stack>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>
                    Range
                  </Text>
                  <SegmentedControl
                    aria-label="Chart time range"
                    value={duration}
                    onChange={handleDurationChange}
                    data={[
                      { value: '24hours', label: '24 hours' },
                      { value: '5days', label: '5 days' },
                    ]}
                  />
                </Stack>
              </Group>
              <Paper withBorder p="md" style={{ minWidth: 0 }}>
                {hasVisiblePressure ? (
                  <div
                    className="pressure-chart-scroll"
                    role="region"
                    aria-label={`${rangeLabel} pressure chart`}
                    tabIndex={0}
                  >
                    <div className="pressure-chart-scroll__content">
                      <PressureChart
                        data={visibleData}
                        unit={pressureUnit}
                        timeZone={location.timezone}
                        watchLevels={watchLevels}
                        showHours={duration === '24hours'}
                      />
                    </div>
                  </div>
                ) : (
                  <Text c="dimmed">
                    No pressure data is available for this window.
                  </Text>
                )}
              </Paper>
            </>
          )}
          <Text size="xs" c="dimmed">
            Weather data by{' '}
            <Anchor
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
            >
              Open-Meteo
            </Anchor>
            . Hourly model data; gaps indicate unavailable values.
          </Text>
        </>
      )}
    </Stack>
  );
}
