# Langex - Turkish Language Learning Platform

A personal Turkish language learning platform with grammar cards, dictionary with morphology breakdowns, and AI-powered translations.

## Quick Start

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start the database**
   ```bash
   yarn db:start
   ```

4. **Run database migrations**
   ```bash
   yarn db:migrate
   ```

5. **Start development servers**
   ```bash
   yarn dev
   ```

6. **Access the app**
   - Frontend: http://localhost:4001
   - Backend API: http://localhost:4000

## Features

- **Grammar Cards**: Structured cards explaining Turkish grammar concepts
- **Dictionary**: Personal vocabulary with auto-translation and morphology breakdowns
- **Ask AI**: Ask "How do I say X in Turkish?" and get instant translations

## API Keys

### Anthropic API (for AI features)
1. Go to https://console.anthropic.com
2. Create an account and add credits
3. Generate an API key

### Google Cloud Translation API (optional)
1. Go to https://console.cloud.google.com
2. Enable Cloud Translation API
3. Create credentials (API key)

## Tech Stack

- **Frontend**: Next.js 15, shadcn/ui, Tailwind CSS
- **Backend**: Express, Prisma ORM
- **Database**: PostgreSQL (Docker)
- **AI**: Anthropic Claude
- **Monorepo**: Turborepo + Yarn Workspaces

## Commands

```bash
# Start development (frontend + backend)
yarn dev

# Start only database
yarn db:start

# Stop database
yarn db:stop

# Run database migrations
yarn db:migrate

# Open Prisma Studio (database GUI)
yarn db:studio

# Build for production
yarn build
```

## Data Persistence

PostgreSQL data is stored in a Docker volume (`langex_postgres_data`) and persists across container restarts.

To backup data:
```bash
docker exec langex-db pg_dump -U langex langex > backup.sql
```

To restore:
```bash
cat backup.sql | docker exec -i langex-db psql -U langex langex
```
