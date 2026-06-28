// Google Cloud Translation API service
// For now, we'll use a simple fetch-based approach
// You'll need to enable the Cloud Translation API and get an API key

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

export async function googleTranslate(
  text: string,
  sourceLanguage: "en" | "ru",
  targetLanguage: "tr" = "tr"
): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error("Google Translate API key not configured");
  }

  const response = await fetch(`${TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: "text",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Translation failed: ${error}`);
  }

  const data = await response.json() as {
    data: { translations: { translatedText: string }[] };
  };
  return data.data.translations[0].translatedText;
}
