# Pressure forecast

## Local Development

```bash
npm install
```

Run the dev server

```bash
npm run dev
```

## Quick start

The project does not ship with default usernames or passwords. On a new
PocketBase installation, create both a PocketBase superuser for administration
and a separate normal user for signing into Pressure Tracker.

1. Start PocketBase:

   ```bash
   ./pocketbase serve
   ```

   PocketBase automatically applies the committed migrations in
   `pb_migrations/` and loads the validation hooks in `pb_hooks/`.

2. Open the installer URL printed by PocketBase and create the first
   superuser. You can also create one from the command line:

   ```bash
   ./pocketbase superuser create YOUR_EMAIL YOUR_PASSWORD
   ```

3. Open the PocketBase administration dashboard. With the default local
   address, it is available at:

   ```text
   http://127.0.0.1:8090/_/
   ```

4. In the dashboard, open the `users` collection and create a normal user for
   the application. Use this account on the Pressure Tracker login page; do not
   use the PocketBase superuser account in the frontend.

5. Set the public server and dashboard URLs in `.env`:

   ```env
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   VITE_POCKETBASE_ADMIN_URL=http://127.0.0.1:8090/_/
   ```

For a home-server deployment, replace `127.0.0.1` with the hostname or reverse
proxy address used by the browser. Keep superuser credentials out of `.env`
files exposed to Vite and restrict the administration dashboard to the local
network or VPN when possible.

## TO-DO

- Form, journal, settings unit tests
- Convert app to TS? -> Lower priority

### Forecast home page

- [ ] Create a user-orientated README
