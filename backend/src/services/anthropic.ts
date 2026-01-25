import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to extract JSON from markdown code blocks
function parseJsonResponse(text: string): unknown {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse JSON response:", jsonStr.substring(0, 500));
    throw new Error(`Invalid JSON response from AI: ${(error as Error).message}`);
  }
}

// Retry wrapper for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

export interface TranslationResult {
  english: string;
  russian: string;
  turkish: string;
  partOfSpeech: string;
  pronunciation: string;
  tags: string[];
  morphologyBreakdown: {
    root: string;
    affixes: { affix: string; meaning: string; type: string }[];
    explanation: string;
  };
  examples: { turkish: string; pronunciation: string; english: string; russian: string }[];
  detectedLanguage: "en" | "ru" | "tr";
}

export async function translateWithAI(text: string): Promise<TranslationResult> {
  const message = await withRetry(() => anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a language translation assistant. Given the following word or phrase, detect which language it is (English, Russian, or Turkish) and provide translations to all three languages.

Input: "${text}"

Important:
- Auto-detect the input language
- If Turkish is written with Latin alphabet approximations (e.g., "merhaba", "tesekkurler", "nasilsin"), correct it to proper Turkish with special characters (e.g., "merhaba", "teşekkürler", "nasılsın")
- Provide translations to all three languages
- Identify the part of speech
- Assign 1-3 category tags from this list: kitchen, bathroom, bedroom, living-room, office, restaurant, cafe, street, transport, airport, hotel, hospital, pharmacy, shopping, clothing, food, drinks, family, body, emotions, time, weather, numbers, colors, animals, nature, greetings, common-phrases, travel, work, school, sports, music, technology. Only use tags that apply.
- Provide morphological breakdown of the Turkish word

Respond in JSON format only, no markdown:
{
  "detectedLanguage": "en" or "ru" or "tr",
  "english": "the English word/phrase",
  "russian": "the Russian word/phrase (in Cyrillic)",
  "turkish": "the Turkish translation (with proper Turkish characters ş, ı, ğ, ü, ö, ç)",
  "partOfSpeech": "noun/verb/adjective/adverb/pronoun/preposition/conjunction/interjection/phrase",
  "pronunciation": "phonetic pronunciation guide for Turkish",
  "tags": ["relevant", "category", "tags"],
  "morphologyBreakdown": {
    "root": "the Turkish root word(s)",
    "affixes": [
      {"affix": "suffix or prefix", "meaning": "what it means", "type": "suffix/prefix/infix"}
    ],
    "explanation": "Brief explanation of how the Turkish word/phrase is constructed"
  },
  "examples": [
    {"turkish": "example sentence in Turkish", "pronunciation": "phonetic pronunciation of Turkish sentence", "english": "English translation", "russian": "Russian translation"}
  ]
}`,
      },
    ],
  }));

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return parseJsonResponse(content.text) as TranslationResult;
}

export async function askTurkishQuestion(question: string): Promise<{
  answer: string;
  turkish?: string;
  shouldSaveToDictionary: boolean;
  dictionaryEntry?: TranslationResult;
}> {
  const message = await withRetry(() => anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a Turkish language tutor. Answer the following question about Turkish language.

Question: "${question}"

If the question is asking how to say something in Turkish, include the translation with morphological breakdown. Always provide translations in all three languages: English, Russian, and Turkish.

Respond in JSON format only, no markdown:
{
  "answer": "Your helpful answer explaining the Turkish",
  "turkish": "The Turkish translation if applicable",
  "shouldSaveToDictionary": true/false (true if this contains a translation worth saving),
  "dictionaryEntry": {
    "detectedLanguage": "en" or "ru" or "tr",
    "english": "English word/phrase",
    "russian": "Russian word/phrase (in Cyrillic)",
    "turkish": "Turkish translation (with proper Turkish characters)",
    "pronunciation": "phonetic guide for Turkish",
    "morphologyBreakdown": {
      "root": "Turkish root word",
      "affixes": [{"affix": "...", "meaning": "...", "type": "..."}],
      "explanation": "..."
    },
    "examples": [{"turkish": "...", "pronunciation": "...", "english": "...", "russian": "..."}]
  }
}

If the question is not about translating something specific, set shouldSaveToDictionary to false and omit dictionaryEntry.`,
      },
    ],
  }));

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return parseJsonResponse(content.text);
}
