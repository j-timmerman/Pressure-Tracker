import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconArrowDownRight,
  IconActivityHeartbeat,
  IconGauge,
} from '@tabler/icons-react';
import PressureSparkline from '../components/PressureSparkline';
import { DEFAULT_PRESSURE_UNIT } from '../../../shared/constants/pressure';
import { LoadingState } from '../../../shared/components/LoadingState';
import { usePressureForecast } from '../../forecast/hooks/usePressureForecast';
import {
  convertPressure,
  formatPressure,
  getThreeHourPressureTrend,
} from '../../forecast/utils/pressure';
import { useJournalEntries } from '../../journal/hooks/useJournal';
import { formatEntryDate } from '../../journal/utils/journal';
import { useSavedLocation } from '../../locations/hooks/useSavedLocation';
import { useUserSettings } from '../../settings/hooks/useUserSettings';
import { formatPlace } from '../../settings/utils/format';

export function HomePage() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const saved = useSavedLocation();
  const settings = useUserSettings();
  const journal = useJournalEntries();
  const forecast = usePressureForecast(saved.data);
  const location = saved.data;
  const unit = settings.data?.pressure_unit ?? DEFAULT_PRESSURE_UNIT;

  const latestReading = forecast.data
    ?.filter(
      (point) =>
        point.pressure !== null &&
        point.time <= now &&
        now - point.time <= 2 * 60 * 60 * 1000
    )
    .at(-1);

  const trend = getThreeHourPressureTrend(forecast.data, now);

  const TrendIcon =
    trend?.direction === 'Rising'
      ? IconArrowUpRight
      : trend?.direction === 'Falling'
        ? IconArrowDownRight
        : IconArrowRight;

  const trendChange = trend
    ? convertPressure(Math.abs(trend.change), unit)
    : null;

  const trendSign = trendChange === 0 ? '' : trend?.change > 0 ? '+' : '−';

  const ongoingEntry = journal.data?.find((entry) => entry.is_ongoing);

  return (
    <Stack w="100%" maw={800} mx="auto">
      <Title order={2}>Home</Title>

      {/* Current pressure */}
      <Paper withBorder p="lg">
        <Stack align="flex-start" gap="sm">
          <Group justify="space-between" w="100%" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon variant="light" size={30} radius="md">
                <IconGauge size={18} stroke={1.7} aria-hidden="true" />
              </ThemeIcon>
              <Title order={3}>Pressure</Title>
            </Group>
            <Button component={Link} to="/forecast" variant="light" size="sm">
              View forecast
            </Button>
          </Group>
          {saved.isPending && (
            <LoadingState label="Loading your location" variant="inline" />
          )}
          {saved.isError && (
            <Alert color="red" title="Could not load your location">
              {saved.error.message}
            </Alert>
          )}
          {saved.isSuccess && !location && (
            <>
              <Text>Set a location to see its pressure here.</Text>
              <Button component={Link} to="/settings">
                Set your location
              </Button>
            </>
          )}
          {location && (
            <Stack gap="xs" w="100%">
              <Text fw={600}>{formatPlace(location)}</Text>
              {(forecast.isPending ||
                (forecast.isSuccess && settings.isPending)) && (
                <LoadingState label="Loading pressure" variant="summary" />
              )}
              {forecast.isError && (
                <Alert color="red" title="Could not load pressure data">
                  {forecast.error.message}
                </Alert>
              )}
              {forecast.isSuccess && !settings.isPending && !latestReading && (
                <Text c="dimmed">No recent pressure reading is available.</Text>
              )}
              {latestReading && !settings.isPending && (
                <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" w="100%">
                  <Paper withBorder p="md" bg="blue.0" mih={116}>
                    <Stack gap={4}>
                      <Text size="sm" fw={600} c="dimmed">
                        Current pressure
                      </Text>
                      <Group gap={5} align="baseline" wrap="nowrap">
                        <Text className="pressure-reading" fw={700} lh={1.1}>
                          {formatPressure(
                            convertPressure(latestReading.pressure, unit),
                            unit
                          )}
                        </Text>
                        <Text size="sm" fw={600} c="dimmed">
                          {unit}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                  <Paper withBorder p="md" bg="gray.1" mih={116}>
                    <Group
                      justify="space-between"
                      align="center"
                      gap="md"
                      wrap="nowrap"
                      h="100%"
                    >
                      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={600} c="dimmed">
                          Next 3 hours
                        </Text>
                        {trend ? (
                          <>
                            <Group gap={6} wrap="nowrap">
                              <TrendIcon size={26} aria-hidden="true" />
                              <Text size="xl" fw={700}>
                                {trend.direction}
                              </Text>
                            </Group>
                            <Text size="sm">
                              {trendSign}
                              {formatPressure(trendChange, unit)} {unit}
                            </Text>
                          </>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Outlook unavailable
                          </Text>
                        )}
                      </Stack>
                      {trend && (
                        <PressureSparkline data={forecast.data} now={now} />
                      )}
                    </Group>
                  </Paper>
                </SimpleGrid>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Migraine tracking */}
      <Paper withBorder p="lg">
        <Stack align="flex-start" gap="sm">
          <Group gap="xs">
            <ThemeIcon variant="light" size={30} radius="md">
              <IconActivityHeartbeat
                size={18}
                stroke={1.7}
                aria-hidden="true"
              />
            </ThemeIcon>
            <Title order={3}>Migraine tracking</Title>
          </Group>
          {journal.isPending && (
            <LoadingState label="Checking migraine status" variant="inline" />
          )}
          {journal.isError && (
            <Alert color="red" title="Could not load migraine status">
              {journal.error.message}
              <Button variant="subtle" onClick={() => journal.refetch()}>
                Retry
              </Button>
            </Alert>
          )}
          {journal.isSuccess && ongoingEntry && (
            <>
              <Badge color="orange" variant="light">
                Active
              </Badge>
              <Text fw={600}>Migraine in progress</Text>
              <Text size="sm" c="dimmed">
                Started {formatEntryDate(ongoingEntry.occurred_at)}
              </Text>
            </>
          )}
          {journal.isSuccess && !ongoingEntry && (
            <>
              <Text fw={600}>No migraine in progress</Text>
              <Text size="sm" c="dimmed">
                Start a journal entry to record when symptoms begin.
              </Text>
            </>
          )}
          <Group>
            {journal.isSuccess &&
              (ongoingEntry ? (
                <Button
                  component={Link}
                  to={`/journal/${ongoingEntry.id}/edit?end=1`}
                >
                  End migraine log
                </Button>
              ) : (
                <Button component={Link} to="/journal/new?migraine=1">
                  Start migraine log
                </Button>
              ))}
            <Button component={Link} to="/journal" variant="light">
              Open journal
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
