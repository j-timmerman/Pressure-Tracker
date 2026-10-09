# Pressure forecast

This project was originally built with Supabase and has been converted to use
PocketBase for authentication and data storage. The original table and field
shapes were kept where practical, while `services/backend/` provides a
compatibility layer so the React frontend requires minimal backend-specific
code.

## Local Development

Run the dev server

```bash
npm run dev
```

In a new terminal, start PocketBase:

Windows Command Prompt:

```bat
pocketbase.exe serve
```

macOS or Linux:

```bash
./pocketbase serve
```

## Quick start

The project does not ship with default usernames or passwords. On a new
PocketBase installation, create both a PocketBase superuser for administration
and a separate normal user for signing into Pressure Tracker.

1. Install dependencies

   ```bash
   npm install
   ```

2. Download the PocketBase executable for your operating system, place it in
   the project directory, and start it with the command for your shell.

   Windows Command Prompt:

   ```bat
   pocketbase.exe serve
   ```

   macOS or Linux:

   ```bash
   ./pocketbase serve
   ```

   PocketBase automatically applies the committed migrations in
   `pb_migrations/` and loads the validation hooks in `pb_hooks/`.

3. Open the installer URL printed by PocketBase and create the first
   superuser. You can also create one from the command line:

   ```text
   # Windows Command Prompt
   pocketbase.exe superuser create YOUR_EMAIL YOUR_PASSWORD

   # macOS or Linux
   ./pocketbase superuser create YOUR_EMAIL YOUR_PASSWORD
   ```

4. Open the PocketBase administration dashboard. With the default local
   address, it is available at:

   ```text
   http://127.0.0.1:8090/_/
   ```

5. In the dashboard, open the `users` collection and create a normal user for
   the application. Use this account on the Pressure Tracker login page; do not
   use the PocketBase superuser account in the frontend.

6. Set the public server and dashboard URLs in `.env`:

   ```env
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   VITE_POCKETBASE_ADMIN_URL=http://127.0.0.1:8090/_/
   ```

7. In a new terminal, start the dev server and login using the account created in step 5

    ```bash
    npm run dev
    ```

For a home-server deployment, replace `127.0.0.1` with the hostname or reverse
proxy address used by the browser. Keep superuser credentials out of `.env`
files exposed to Vite and restrict the administration dashboard to the local
network or VPN when possible.

## Serving the frontend using PocketBase

Build the frontend `dist` folder

```bash
npm run build
```

Create a folder called `pb_public` at the project root and copy the contents of the `dist` folder into it. Then start PocketBase.

Windows Command Prompt:

```bat
pocketbase.exe serve
```

macOS or Linux:

```bash
./pocketbase serve
```

## TO-DO

- Form, journal, settings unit tests
- Convert app to TS? -> Lower priority
