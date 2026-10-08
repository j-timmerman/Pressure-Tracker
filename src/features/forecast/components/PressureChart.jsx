import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { createDateFormat, createTimeFormat } from '../utils/format';
import {
  calculateYaxisRange,
  convertPressure,
  formatPressure,
} from '../utils/pressure';

export function PressureChart({
  data,
  unit,
  timeZone,
  watchLevels = [],
  showHours = false,
}) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        pressure: convertPressure(point.pressure, unit),
      })),
    [data, unit]
  );

  const Yrange = useMemo(() => {
    const values = chartData
      .map((point) => point.pressure)
      .filter((value) => Number.isFinite(value));

    return calculateYaxisRange(values, unit);
  }, [chartData, unit]);

  // Hide saved watch levels that fall outside the visible Y-axis range.
  const referenceLevels = useMemo(
    () =>
      watchLevels
        .filter((value) => Number.isFinite(Number(value)))
        .map((value) => Number(value))
        .filter((value) => value >= Yrange[0] && value <= Yrange[1]),
    [watchLevels, Yrange]
  );

  // Show hours in the X-axis labels if the chart is showing a 24-hour window.
  // Otherwise, show only the date.
  const dateFormat = useMemo(() => createDateFormat(timeZone), [timeZone]);
  const timeFormat = useMemo(() => createTimeFormat(timeZone), [timeZone]);
  const axisFormat = useMemo(
    () =>
      showHours
        ? new Intl.DateTimeFormat(undefined, {
            timeZone,
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
          })
        : dateFormat,
    [timeZone, showHours, dateFormat]
  );

  return (
    <ResponsiveContainer width="100%" height={380} minWidth={0}>
      <LineChart
        data={chartData}
        margin={{ top: 24, right: 16, bottom: 12, left: 0 }}
        accessibilityLayer
      >
        <CartesianGrid
          stroke="var(--mantine-color-gray-2)"
          strokeDasharray="3 3"
          strokeOpacity={0.7}
          vertical={false}
        />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(time) => axisFormat.format(time)}
          minTickGap={35}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={Yrange}
          width={90}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatPressure(value, unit)}
          unit={` ${unit}`}
        />
        <Tooltip
          labelFormatter={(time) => timeFormat.format(Number(time))}
          formatter={(value) => [
            `${formatPressure(value, unit)} ${unit}`,
            'Mean-sea-level pressure',
          ]}
        />
        {/* Saved watch levels */}
        {referenceLevels.map((level) => (
          <ReferenceLine
            key={`watch-level-${level}`}
            y={level}
            stroke="var(--mantine-color-blue-4)"
            strokeDasharray="5 5"
            ifOverflow="extendDomain"
            label={{
              value: formatPressure(level, unit),
              position: 'insideTopRight',
              fill: 'var(--mantine-color-blue-6)',
              fontSize: 11,
              offset: 6,
            }}
          />
        ))}
        <Line
          type="linear"
          dataKey="pressure"
          name="Mean-sea-level pressure"
          stroke="var(--mantine-color-blue-7)"
          strokeWidth={2.75}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--mantine-color-blue-10)' }}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
