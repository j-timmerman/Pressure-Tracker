# Project guidance

This project uses a React frontend with PocketBase for authentication and data
storage.

## Backend service boundary

The modules in `services/backend/` are compatibility wrappers between the
frontend and PocketBase. This boundary keeps PocketBase-specific behavior out
of components and hooks, makes the frontend easier to reuse, and gives the app
one place to normalize backend responses.

Frontend code should call these services instead of importing the PocketBase
client directly:

- `authService`: `getSession`, `onSessionChange`, `signInWithPassword`,
  `signUpWithPassword`, `updatePassword`, and `signOut`
- `profileService`: `getByAuthUserId` and `updateProfile`
- `settingsService`: `get`, `updatePressureUnit`, and `updateWatchLevels`
- `locationService`: `getSaved` and `save`
- `journalService`: `list`, `getById`, `create`, `update`, and `remove`

Preserve these method names and their existing return shapes when changing the
backend implementation. Errors exposed to the frontend must have a useful
`message` property.

## Compatibility behavior

- Auth results expose `session.user.id` and `session.user.email`.
- Record IDs are opaque strings; shared code must not assume they are UUIDs.
- PocketBase empty values such as `0` and `""` are mapped to `null` when the
  frontend treats the corresponding journal field as optional.
- PocketBase `created` and `updated` timestamps are exposed as `created_at` and
  `updated_at` where the frontend expects those names.
- Expected not-found responses are returned as `null` for optional single-record
  lookups.
- Existing snake_case field names are kept at the service boundary.

## PocketBase-specific code

- Collection definitions and API rules live in `pb_migrations/`.
- Server-side validation and automatic profile creation live in `pb_hooks/`.
- `services/backend/pocketbaseClient.js` is the only shared client setup.
- Code bundled by Vite is public. Never place PocketBase superuser credentials
  or tokens in `src/`, `services/backend/`, or `VITE_*` environment variables.

## Commands

Do not install dependencies or run build, lint, or test commands unless the
user explicitly asks. The previous backend integration tests were intentionally
removed and should not be treated as missing files.

## Files

Never open .env or the TEST_ACCOUNTS.md files
