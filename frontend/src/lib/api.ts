const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Grammar API
export const grammarApi = {
  getAll: () => fetchAPI<GrammarCard[]>("/api/grammar"),
  getBySlug: (slug: string) => fetchAPI<GrammarCard>(`/api/grammar/${slug}`),
  create: (data: Partial<GrammarCard>) =>
    fetchAPI<GrammarCard>("/api/grammar", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<GrammarCard>) =>
    fetchAPI<GrammarCard>(`/api/grammar/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/api/grammar/${id}`, { method: "DELETE" }),
};

// Dictionary API
export const dictionaryApi = {
  getAll: (params?: { search?: string; language?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.language) searchParams.set("language", params.language);
    const query = searchParams.toString();
    return fetchAPI<DictionaryEntry[]>(`/api/dictionary${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => fetchAPI<DictionaryEntry>(`/api/dictionary/${id}`),
  create: (data: { originalWord: string; originalLanguage: "en" | "ru"; autoTranslate?: boolean }) =>
    fetchAPI<DictionaryEntry>("/api/dictionary", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<DictionaryEntry>) =>
    fetchAPI<DictionaryEntry>(`/api/dictionary/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/api/dictionary/${id}`, { method: "DELETE" }),
};

// AI API
export const aiApi = {
  ask: (question: string, saveToDictionary = true) =>
    fetchAPI<AiResponse>("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({ question, saveToDictionary }),
    }),
};

// Types
export interface GrammarCard {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  examples: { turkish: string; english: string }[];
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MorphologyBreakdown {
  root: string;
  affixes: { affix: string; meaning: string; type: string }[];
  explanation: string;
}

export interface DictionaryEntry {
  id: string;
  originalWord: string;
  originalLanguage: "en" | "ru";
  turkishTranslation: string;
  pronunciation?: string;
  morphologyBreakdown?: MorphologyBreakdown;
  isPhrase: boolean;
  examples: { turkish: string; english: string }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiResponse {
  answer: string;
  turkish?: string;
  shouldSaveToDictionary: boolean;
  dictionaryEntry?: {
    originalWord: string;
    originalLanguage: string;
    turkish: string;
    pronunciation: string;
    morphologyBreakdown: MorphologyBreakdown;
    examples: { turkish: string; english: string }[];
  };
}
