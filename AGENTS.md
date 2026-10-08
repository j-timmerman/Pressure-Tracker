# Project guidance

This project uses PocketBase for authentication and data storage.

## Reusing the frontend

`src/` is the frontend to copy between backend variants. It contains the
Open-Meteo weather client and shared pressure defaults. Each repo supplies its
own `services/backend/` with the same named exports and methods:

- `authService`: `getSession`, `onSessionChange`, `signInWithPassword`,
  `signUpWithPassword`, `updatePassword`, and `signOut`. Sessions expose
  `session.user.id` and `session.user.email`; signup returns `{ session }`
  (with a null session when email confirmation is pending). Public signup is
  currently disabled; normal users are provisioned through PocketBase admin.
- `profileService`: `getByAuthUserId` and `updateProfile`.
- `settingsService`: `get`, `updatePressureUnit`, and `updateWatchLevels`.
- `locationService`: `getSaved` and `save`.
- `journalService`: `list`, `getById`, `create`, `update`, and `remove`.

Keep the returned record fields used by `src/` consistent across variants,
including `id`, `created_at`, `pressure_unit`, `watch_levels`, and the journal
fields in `src/features/journal/utils/formValues.js`. Services should throw
errors with a `message` property. PocketBase hooks are responsible for creating
a profile when a user is created. Record IDs are opaque strings.

## Architecture

- Reuse `src/` with minimal changes.
- Put PocketBase client setup and CRUD implementations in `services/backend/`.
- Preserve the service methods and return shapes documented above so
  frontend hooks and components do not need backend-specific logic.
- Treat record IDs as opaque strings. Do not add UUID assumptions to shared or
  PocketBase code.

## Compatibility wrappers

The PocketBase services must adapt PocketBase behavior to the existing frontend
contract:

- Auth results must expose `session.user.id` and `session.user.email`, and
  signup must return `{ session }` (using `null` when confirmation is pending).
- Normalize PocketBase empty values (`0` and `""`) to `null` for optional
  journal numbers, dates, text, and relations expected to be nullable by the
  frontend. Convert `null` back to PocketBase-compatible empty values on writes.
- Preserve existing snake_case response fields. Map PocketBase's `created` and
  `updated` fields to `created_at` and `updated_at` where the frontend expects
  those names.
- Translate expected PocketBase not-found responses into `null` where the
  existing service contract uses optional single records.
- Keep thrown failures compatible with frontend handling by providing a useful
  `message` property.

## Database migration

- The PocketBase schema is versioned in `pb_migrations/`; server-side data
  invariants and profile creation live in `pb_hooks/`.
- Use PocketBase relations for user and location references and a JSON field for
  `watch_levels`.
- Preserve SQL cross-field invariants in service validation or PocketBase hooks
  when they cannot be represented by collection field validation.
- Do not place PocketBase superuser credentials in browser-bundled code.

## Commands and verification

- Do not install dependencies or run build, lint, or test commands unless the
  user explicitly asks for them.
- The old tests were intentionally removed because they depended on a local
  Supabase test server. Do not treat their absence as an incomplete checkout.
- Prefer focused static inspection until the PocketBase dependency and test
  strategy are in place.
