# AimFox → Zoho CRM Sync

Syncs LinkedIn automation stats from AimFox campaigns into matching Zoho CRM leads.

## Prerequisites

- Node.js 18+
- AimFox account with API key
- Zoho CRM app with OAuth credentials (Client ID, Client Secret, Refresh Token)

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
AIMFOX_API_KEY=your_aimfox_key
PORT=3001
CRON_SCHEDULE=0 6 * * *   # optional, defaults to daily at 6am
```

### 3. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 4. Production build

```bash
npm run build   # builds client/dist
npm start       # runs Express server only
```

Serve `client/dist` via nginx/CDN or have Express serve it statically.

## How it works

1. Enter credentials in the UI (or set them in `.env` for scheduled syncs).
2. The backend fetches all AimFox campaign leads and all Zoho CRM leads.
3. Leads are matched by **LinkedIn URL** (primary) or **Email** (fallback).
4. Matched Zoho leads are updated with:
   - `AimFox_Connection_Status`
   - `AimFox_Messages_Sent`
   - `AimFox_Replied`
   - `AimFox_Profile_Views`
   - `AimFox_Campaign`
5. A cron job runs the same sync automatically if env credentials are present.

## Zoho CRM custom fields

Create these custom fields on the **Leads** module in Zoho CRM before syncing:

| API Name                    | Type    |
|-----------------------------|---------|
| `AimFox_Connection_Status`  | Text    |
| `AimFox_Messages_Sent`      | Long Integer |
| `AimFox_Replied`            | Long Integer |
| `AimFox_Profile_Views`      | Long Integer |
| `AimFox_Campaign`           | Text    |
| `AimFox_Initiated_Date`     | Date    |
| `AimFox_Sent_Date`          | Date    |
| `LinkedIn_URL`              | URL     |

## Project structure

```
aimfox-zoho-sync/
├── client/               # React + Vite frontend
│   └── src/
│       ├── api/          # API helpers
│       ├── components/   # UI components
│       ├── hooks/        # useSync hook
│       └── App.jsx
├── server/               # Express backend
│   ├── jobs/             # node-cron scheduled sync
│   ├── routes/           # POST /api/sync
│   └── services/         # Zoho + AimFox + sync logic
├── .env.example
└── package.json
```
