import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface TranslationResult {
  turkish: string;
  pronunciation: string;
  morphologyBreakdown: {
    root: string;
    affixes: { affix: string; meaning: string; type: string }[];
    explanation: string;
  };
  examples: { turkish: string; english: string }[];
}

export async function translateWithAI(
  text: string,
  fromLanguage: "en" | "ru"
): Promise<TranslationResult> {
  const languageName = fromLanguage === "en" ? "English" : "Russian";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Translate the following ${languageName} text to Turkish and provide a detailed morphological breakdown.

Text: "${text}"

Respond in JSON format only, no markdown:
{
  "turkish": "the Turkish translation",
  "pronunciation": "phonetic pronunciation guide",
  "morphologyBreakdown": {
    "root": "the root word(s)",
    "affixes": [
      {"affix": "suffix or prefix", "meaning": "what it means", "type": "suffix/prefix/infix"}
    ],
    "explanation": "Brief explanation of how the word/phrase is constructed in Turkish"
  },
  "examples": [
    {"turkish": "example sentence", "english": "translation"}
  ]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return JSON.parse(content.text) as TranslationResult;
}

export async function askTurkishQuestion(question: string): Promise<{
  answer: string;
  turkish?: string;
  shouldSaveToDictionary: boolean;
  dictionaryEntry?: TranslationResult & { originalWord: string; originalLanguage: string };
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a Turkish language tutor. Answer the following question about Turkish language.

Question: "${question}"

If the question is asking how to say something in Turkish, include the translation with morphological breakdown.

Respond in JSON format only, no markdown:
{
  "answer": "Your helpful answer explaining the Turkish",
  "turkish": "The Turkish translation if applicable",
  "shouldSaveToDictionary": true/false (true if this contains a translation worth saving),
  "dictionaryEntry": {
    "originalWord": "the original English/Russian word or phrase",
    "originalLanguage": "en or ru",
    "turkish": "Turkish translation",
    "pronunciation": "phonetic guide",
    "morphologyBreakdown": {
      "root": "root word",
      "affixes": [{"affix": "...", "meaning": "...", "type": "..."}],
      "explanation": "..."
    },
    "examples": [{"turkish": "...", "english": "..."}]
  }
}

If the question is not about translating something specific, set shouldSaveToDictionary to false and omit dictionaryEntry.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return JSON.parse(content.text);
}
