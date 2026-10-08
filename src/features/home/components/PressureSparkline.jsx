import { Sparkline } from '@mantine/charts';
import { Group, Text } from '@mantine/core';
import { pressureAt } from '../../forecast/utils/pressure';

const HOUR = 60 * 60 * 1000;

export default function PressureSparkline({ data, now }) {
  if (!data?.length) return null;

  // Sample the pressure at now, now + 1h, now + 2h, now + 3h
  const samples = [0, 1, 2, 3].map((offset) =>
    pressureAt(data, now + offset * HOUR)
  );

  const values = samples.filter((value) => Number.isFinite(value));
  if (values.length < 2) return null;

  // Baseline the chart to the minimum value minus 6 hPa to give some space at the bottom
  const baseline = Math.min(...values) - 6;

  const chartData = samples.map((pressure) =>
    Number.isFinite(pressure) ? pressure - baseline : null
  );

  return (
    <div className="pressure-sparkline" aria-hidden="true">
      <Sparkline
        w="100%"
        h={50}
        data={chartData}
        color="blue.7"
        withGradient={true}
        fillOpacity={.15}
        strokeWidth={2}
        connectNulls={false}
      />
      <Group justify="space-between" gap={4} mt={-2}>
        <Text size="xs" c="dimmed">
          Now
        </Text>
        <Text size="xs" c="dimmed">
          +3 hr
        </Text>
      </Group>
    </div>
  );
}
