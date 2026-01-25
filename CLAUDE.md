# Claude Code Guidelines for Langex

## Git Commit Policy

Always commit changes atomically and sequentially:

1. **One logical change per commit** - Each commit should represent a single, cohesive change
2. **Commit frequently** - Don't accumulate large changesets
3. **Use conventional commits** - Format: `type(scope): description`
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code restructuring
   - `style`: Formatting, no code change
   - `chore`: Dependencies, config
   - `docs`: Documentation

4. **Commit order** - When multiple changes are made:
   - Database migrations first
   - Backend changes second
   - Frontend changes third
   - Dependencies last

5. **Always include co-author** - End commit messages with:
   ```
   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

## Project Structure

- `backend/` - Express + Prisma API
- `frontend/` - Next.js 15 + shadcn/ui
- PostgreSQL via Docker

## Key Commands

```bash
yarn dev          # Start both frontend and backend
yarn db:start     # Start PostgreSQL container
yarn db:migrate   # Run Prisma migrations
```

## API Model

Using Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) for translations with:
- 3 retry attempts with exponential backoff
- JSON response parsing with markdown handling
