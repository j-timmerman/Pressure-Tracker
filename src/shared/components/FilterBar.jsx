import { Group, Select, TextInput, Button } from '@mantine/core';

/**
 * Status-preset select + date-range inputs + reset button.
 * Page-specific filters go in `children` (rendered at the end of the row).
 */
export function FilterBar({
  statusPresets,
  statusValue,
  onStatusChange,
  statusWidth = 170,
  from,
  onFromChange,
  to,
  onToChange,
  fromLabel = 'From',
  toLabel = 'To',
  onReset,
  resetLabel = 'Next 30 days',
  children,
}) {
  return (
    <Group gap="sm" align="flex-end">
      <Select
        label="Status"
        data={statusPresets.map(({ value, label }) => ({ value, label }))}
        value={statusValue}
        onChange={onStatusChange}
        allowDeselect={false}
        size="xs"
        w={statusWidth}
      />
      <TextInput
        label={fromLabel}
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.currentTarget.value)}
        size="xs"
      />
      <TextInput
        label={toLabel}
        type="date"
        value={to}
        onChange={(e) => onToChange(e.currentTarget.value)}
        size="xs"
      />
      <Button size="xs" variant="subtle" onClick={onReset}>
        {resetLabel}
      </Button>
      {children}
    </Group>
  );
}
