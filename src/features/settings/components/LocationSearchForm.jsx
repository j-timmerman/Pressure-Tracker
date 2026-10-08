import { Button, Group, TextInput } from '@mantine/core';

export function LocationSearchForm({
  search,
  setSearch,
  onSubmit,
  isSearching,
  isSaving,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Group align="end">
        <TextInput
          label="City or postal code"
          placeholder="e.g. London"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: 1 }}
          minLength={2}
          required
          disabled={isSaving}
        />
        <Button
          type="submit"
          loading={isSearching}
          disabled={search.trim().length < 2 || isSaving}
        >
          Search
        </Button>
      </Group>
    </form>
  );
}
