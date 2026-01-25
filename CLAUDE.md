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
- max_tokens: 1024 for phrases

## Creating Conversation Samples

Conversations are stored in the `conversations` table with the following structure:

```typescript
interface ConversationLine {
  speaker: string;        // Name of the speaker (e.g., "Ahmet", "Elif")
  turkish: string;        // Turkish text
  pronunciation: string;  // Phonetic pronunciation guide
  english: string;        // English translation
  russian: string;        // Russian translation
}

interface Conversation {
  title: string;          // e.g., "Casual Greeting Between Friends"
  description?: string;   // Brief description of the scenario
  category: string;       // e.g., "greetings", "restaurant", "shopping"
  difficulty: "beginner" | "intermediate" | "advanced";
  lines: ConversationLine[];
  order: number;          // Display order within category
}
```

### Adding a new conversation via API:

```bash
curl -X POST http://localhost:4000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "At the Restaurant",
    "description": "Ordering food and drinks at a Turkish restaurant",
    "category": "restaurant",
    "difficulty": "beginner",
    "order": 1,
    "lines": [
      {
        "speaker": "Waiter",
        "turkish": "Hoş geldiniz! Kaç kişisiniz?",
        "pronunciation": "hosh gel-di-NIZ! kach ki-shi-si-NIZ?",
        "english": "Welcome! How many people?",
        "russian": "Добро пожаловать! Сколько вас человек?"
      },
      ...
    ]
  }'
```

### Conversation guidelines:
1. Each line should have all 5 fields (speaker, turkish, pronunciation, english, russian)
2. Pronunciation uses capital letters for stressed syllables
3. Categories should match tag categories where possible: greetings, restaurant, cafe, shopping, hotel, airport, transport, hospital, pharmacy, work, school
4. Keep beginner conversations to 6-10 lines
5. Include common phrases and vocabulary
6. End conversations with appropriate goodbyes
