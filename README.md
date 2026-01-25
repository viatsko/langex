# Langex - Turkish Language Learning Platform

A personal Turkish language learning platform with grammar cards, dictionary with morphology breakdowns, and AI-powered translations.

## Quick Start

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the app**
   - Frontend: http://localhost:3000
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

- **Frontend**: Next.js 14, shadcn/ui, Tailwind CSS
- **Backend**: Express, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Anthropic Claude

## Development

```bash
# Backend only
cd backend && npm install && npm run dev

# Frontend only
cd frontend && npm install && npm run dev

# Database migrations
cd backend && npm run db:migrate
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
