# Pressure Tracker App

## Overview

This app helps users track pressure-related symptoms and weather pressure readings over time. It includes authentication, a journal for entries and symptoms, saved locations, profile settings, and configurable pressure units and watch levels.

This project was built with Supabase and converted to PocketBase for authentication and data storage. Existing table and field names are preserved where practical. The services/backend/ compatibility layer handles PocketBase-specific behavior, including field-name mapping and empty-value conversion.

### Tech Stack

- **Frontend:** React, Vite, Mantine
- **Database/Auth:** Pocketbase

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
