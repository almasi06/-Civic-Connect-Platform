# CivicConnect

CivicConnect is a City of Tshwane service-reporting application. Citizens can
submit reports, attach optional photos, view area reports, and track reports
from their browser. Municipal staff can manage teams and assignments; field
workers can view their assigned work and update report status.

## Requirements

- Windows, macOS, or Linux.
- Node.js 20 LTS or newer. Install Node.js from [nodejs.org](https://nodejs.org/);
  npm is included with the Node.js installer.
- Internet access during the first dependency installation and for online map
  tiles. Reports can also be created offline from the browser once the app has
  loaded.

To check that Node.js and npm are installed, open PowerShell (Windows) or a
terminal (macOS/Linux) and run:

```text
node --version
npm --version
```

Node should report version 20 or newer. If either command is not recognized,
install or update Node.js, then close and reopen the terminal.

## Install the application dependencies

1. Download or clone this project to your computer.
2. Open a terminal in the project folder (the folder containing
   `package.json` and `package-lock.json`).
3. Install the exact dependency versions recorded for this project:

   ```text
   npm ci
   ```

`npm ci` creates the local `node_modules` directory from the lockfile. You do
not need to download, copy, or commit `node_modules` manually. If you later
download a fresh copy of the project, run `npm ci` again in that copy.

If you intentionally change dependencies, use `npm install <package-name>` and
include the resulting `package.json` and `package-lock.json` changes when
sharing the project. For an ordinary setup, prefer `npm ci`.

## Run the app locally

The easiest way to run both the web frontend and API is:

```text
npm run dev
```

Keep that terminal window open. When Vite starts, open the local URL printed in
the terminal; by default it is:

```text
http://localhost:5173
```

The development frontend proxies `/api` and `/health` requests to the Express
API on port `4000`. The combined development command starts both services.

### Run the frontend and API in separate terminals

If you prefer to run the services separately, open two terminals in the
project folder:

**Terminal 1 — API:**

```text
npm run dev:api
```

**Terminal 2 — web frontend:**

```text
npm run dev:web
```

Then visit `http://localhost:5173`. The frontend needs the API running on
`http://localhost:4000` for API-backed features such as sign-in and report
synchronization.

To stop either service, focus its terminal and press `Ctrl+C`.

## Demo staff accounts

The local API has demo accounts for testing:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@tshwane.gov.za` | `admin1234` |
| Field worker | `worker@tshwane.gov.za` | `worker1234` |
| Field worker | `worker2@tshwane.gov.za` | `worker1234` |

These are development-only credentials. Do not use them for a public or
production deployment.

## Environment configuration

The Vite development proxy works without an environment file. To point the
frontend at an API hosted somewhere else, create a `.env.local` file in the
project root and set the API base URL:

```text
VITE_API_BASE_URL=https://your-api.example.com
```

The checked-in `.env.example` is a template; copy it to `.env.local` before
editing if desired. Do not put secrets in `VITE_*` variables: Vite embeds
frontend environment values in the browser bundle.

For production builds, set `VITE_API_BASE_URL` in the build environment. When
the value is blank, API calls use relative paths such as `/api/requests`, which
requires the deployed web server to route those API paths to the backend.

## Build and preview

Run the checks and create a production frontend build with:

```text
npm run build
```

The deployable frontend is written to `dist/`. The build cleans that output
folder and generates readable asset names such as `assets/app.js`,
`assets/FaultMap.js`, and CSS files. `dist/` is generated output from the
project sources; do not copy compiled files back into `src/`, rename generated
files manually, or edit generated HTML references. Make changes to the source
files and rebuild instead.

To preview the production build locally, run:

```text
npm run preview
```

The preview server serves the frontend and proxies `/api` and `/health` to
`http://localhost:4000`; start the API separately with `npm run dev:api`.
Open the preview URL printed in the terminal (Vite uses port `4173` by
default). Do not open `dist/index.html` directly from the filesystem, because
the application needs a local web server for client-side routing and API
requests.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend and API together for development. |
| `npm run dev:web` | Start only the Vite frontend. |
| `npm run dev:api` | Start only the Express API. |
| `npm run typecheck` | Run TypeScript checking. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Type-check and create the production frontend build. |
| `npm run preview` | Serve the production build locally. |

## Troubleshooting

- **`npm` or `node` is not recognized:** install Node.js 20 LTS or newer, then
  reopen the terminal.
- **Dependency or package errors:** confirm the terminal is in the folder
  containing `package-lock.json`, then run `npm ci`.
- **The page does not open:** keep `npm run dev` running and visit the URL
  printed by Vite, usually `http://localhost:5173`.
- **API errors or sign-in fails:** start the API with `npm run dev:api` or run
  `npm run dev` to start both services. Check that port `4000` is available.
- **A port is already in use:** stop the other process using that port or use
  the alternative port Vite reports in the terminal. If changing the API
  port, update the proxy targets in `vite.config.ts` as well.
- **Geolocation does not work:** allow location access in the browser and use
  `localhost` or an HTTPS origin; browsers restrict geolocation on insecure
  pages.

## Development data

The demo Express API currently keeps report and team data in memory, so its
data resets when the API process restarts. Citizen-side offline reports are
stored in the browser's local storage for that browser profile.
