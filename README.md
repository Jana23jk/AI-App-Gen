# AI App Generator Platform (Metadata-Driven Runtime System)

A production-grade, zero-crash dynamic application generator and runtime engine. This platform converts JSON metadata schemas into fully functional layouts, forms, tables, buttons, headings, and dashboards with real-time editing, translation support (English + Tamil), database persistence (Prisma + PostgreSQL), and offline PWA capabilities.

## Key Features

1. **Robust Metadata Runtime Engine**: Recursively evaluates configuration files. Unknown components, missing labels, empty dropdown arrays, or broken layout declarations are gracefully caught and replaced with interactive fallback components.
2. **Schema Validation Diagnostics**: The builder panel features a live validator that lint-checks JSON syntax, highlights structural warnings, and automatically cleans configurations (generating random field names if missing) before committing edits.
3. **Database Integration**: Express API with Prisma 7 ORM and PostgreSQL. Saves custom application formats and submits dynamically generated form values.
4. **Workflow Automation Logs**: Form submissions trigger automated backend logging, recording transaction events, network parameters, and user-agent metadata.
5. **Multi-Language Support**: Supports English and Tamil locales. Form controls, static values, and error states dynamically translate based on client preferences.
6. **Progressive Web App (PWA)**: Desktop/mobile installability via standard offline caching service workers and manifest files.
7. **Premium Styling**: High-fidelity dark mode with glassmorphic cards, custom animations, templates, and theme toggling.

---

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS v4, Zustand 5, Lucide Icons
- **Backend**: Express, Prisma 7, PostgreSQL
- **Shared**: TypeScript types and schema validators used by both apps
- **Notifications**: React Hot Toast
- **PWA**: Custom Service Worker + manifest.json

---

## Project Structure

```text
ai-app/
├── frontend/                 # Next.js UI (port 3000)
│   ├── public/               # PWA assets, manifest, service worker
│   └── src/
│       ├── app/              # Pages (dashboard, standalone app views)
│       ├── components/       # Renderer + dashboard panels
│       ├── lib/              # API client, templates, translations
│       └── store/            # Zustand workspace state
├── backend/                  # Express REST API (port 3001)
│   ├── prisma/               # Database schema
│   └── src/
│       ├── routes/           # /api/apps endpoints
│       └── lib/              # Prisma client
└── shared/                   # Shared types & validators
    └── src/
        ├── types/
        └── validators/
```

---

## Getting Started

### 1. Configure the Environment

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL="postgres://username:password@localhost:5432/dbname"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Install Dependencies

From the repository root:

```bash
npm install
```

### 3. Apply Schema and Generate Prisma Client

```bash
npm run db:push
npm run db:generate
```

### 4. Run Development Servers

Start both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building.

---

## API Specifications

All endpoints are served by the backend at `http://localhost:3001` (or `NEXT_PUBLIC_API_URL`).

### `GET /api/apps`
Returns list of all saved applications.

### `POST /api/apps`
Creates a new app configuration or edits an existing app if an `id` parameter is specified in the payload body.

### `GET /api/apps/:id`
Returns a single application config metadata along with all associated dynamic form submission payloads.

### `GET /api/apps/subdomain/:slug`
Resolves an app by its public subdomain slug.

### `POST /api/apps/:id/submit`
Verifies dynamic inputs against database constraints, runs workflow log engines, and writes form records to PostgreSQL.

---

## JSON Schema Structure Specification

Every application is defined as a JSON configuration object. See the previous documentation for component types, layout properties, and example JSON.
