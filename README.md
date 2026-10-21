# Pressure forecast

This project was originally built with Supabase and has been converted to use
PocketBase for authentication and data storage. The original table and field
shapes were kept where practical, while `services/backend/` provides a
compatibility layer so the React frontend requires minimal backend-specific
code.

## Setup

Follow the full local setup guide in [docs/SETUP.md](docs/SETUP.md), including installing PocketBase, creating the admin and app users, and configuring the environment variables.

## Local development

Start the frontend dev server:

```bash
npm run dev
```

In a separate terminal, start PocketBase:

Windows Command Prompt:

```bat
pocketbase.exe serve
```

macOS or Linux:

```bash
./pocketbase serve
```

## Serving the frontend using PocketBase

Build the frontend `dist` folder:

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
