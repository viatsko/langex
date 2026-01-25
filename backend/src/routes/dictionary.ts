import { Router } from "express";
import { prisma } from "../services/db.js";
import { z } from "zod";
import { translateWithAI } from "../services/anthropic.js";

export const dictionaryRouter = Router();

const createEntrySchema = z.object({
  englishWord: z.string().min(1),
  russianWord: z.string().min(1),
  turkishWord: z.string().min(1),
  partOfSpeech: z.string().optional(),
  pronunciation: z.string().optional(),
  morphologyBreakdown: z.any().optional(),
  isPhrase: z.boolean().default(false),
  examples: z.array(z.any()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// Get all dictionary entries
dictionaryRouter.get("/", async (req, res) => {
  try {
    const { search, sort } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { englishWord: { contains: search as string, mode: "insensitive" } },
        { russianWord: { contains: search as string, mode: "insensitive" } },
        { turkishWord: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const orderBy = sort === "recent"
      ? { createdAt: "desc" as const }
      : { turkishWord: "asc" as const };

    const entries = await prisma.dictionaryEntry.findMany({
      where,
      orderBy,
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching dictionary entries:", error);
    res.status(500).json({ error: "Failed to fetch dictionary entries" });
  }
});

// Normalize Turkish text for comparison
function normalizeTurkish(text: string): string {
  return text
    .normalize("NFC") // Normalize Unicode (combine characters)
    .toLowerCase()
    .replace(/i̇/g, "i") // Handle Turkish dotted i variants
    .replace(/İ/g, "i")
    .replace(/I/g, "ı"); // Turkish uppercase I -> lowercase ı
}

// Lookup word by Turkish text (for hover feature)
dictionaryRouter.get("/lookup/:word", async (req, res) => {
  try {
    const searchWord = normalizeTurkish(decodeURIComponent(req.params.word));

    // Get all entries and find match with normalized comparison
    const entries = await prisma.dictionaryEntry.findMany();
    const entry = entries.find(
      (e) => normalizeTurkish(e.turkishWord) === searchWord
    );

    if (!entry) {
      return res.status(404).json({ found: false });
    }
    res.json({ found: true, entry });
  } catch (error) {
    console.error("Error looking up word:", error);
    res.status(500).json({ error: "Failed to lookup word" });
  }
});

// Get single entry
dictionaryRouter.get("/:id", async (req, res) => {
  try {
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: req.params.id },
    });
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json(entry);
  } catch (error) {
    console.error("Error fetching dictionary entry:", error);
    res.status(500).json({ error: "Failed to fetch dictionary entry" });
  }
});

// Create entry with auto-translation
dictionaryRouter.post("/", async (req, res) => {
  try {
    const { word, autoTranslate } = req.body;

    if (autoTranslate && word) {
      // Use AI to translate and get morphology (auto-detects language)
      const result = await translateWithAI(word);

      // Check for duplicates (normalized Turkish comparison)
      const existingEntries = await prisma.dictionaryEntry.findMany();
      const normalizedNewWord = normalizeTurkish(result.turkish);
      const existing = existingEntries.find(
        (e) => normalizeTurkish(e.turkishWord) === normalizedNewWord
      );

      if (existing) {
        // Return existing entry instead of creating duplicate
        return res.status(200).json(existing);
      }

      const entry = await prisma.dictionaryEntry.create({
        data: {
          englishWord: result.english,
          russianWord: result.russian,
          turkishWord: result.turkish,
          partOfSpeech: result.partOfSpeech,
          pronunciation: result.pronunciation,
          morphologyBreakdown: result.morphologyBreakdown,
          isPhrase: word.includes(" "),
          examples: result.examples,
          tags: result.tags || [],
        },
      });
      return res.status(201).json(entry);
    }

    // Manual entry
    const data = createEntrySchema.parse(req.body);
    const entry = await prisma.dictionaryEntry.create({ data });
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating dictionary entry:", error);
    res.status(500).json({ error: "Failed to create dictionary entry" });
  }
});

// Update entry
dictionaryRouter.put("/:id", async (req, res) => {
  try {
    const data = createEntrySchema.partial().parse(req.body);
    const entry = await prisma.dictionaryEntry.update({
      where: { id: req.params.id },
      data,
    });
    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating dictionary entry:", error);
    res.status(500).json({ error: "Failed to update dictionary entry" });
  }
});

// Refresh entry (re-translate to get updated fields like partOfSpeech)
dictionaryRouter.post("/:id/refresh", async (req, res) => {
  try {
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: req.params.id },
    });
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    // Re-translate using the Turkish word
    const result = await translateWithAI(entry.turkishWord);

    const updated = await prisma.dictionaryEntry.update({
      where: { id: req.params.id },
      data: {
        partOfSpeech: result.partOfSpeech,
        pronunciation: result.pronunciation,
        morphologyBreakdown: result.morphologyBreakdown,
        examples: result.examples,
        tags: result.tags || [],
      },
    });
    res.json(updated);
  } catch (error) {
    console.error("Error refreshing entry:", error);
    res.status(500).json({ error: "Failed to refresh entry" });
  }
});

// Refresh all entries (batch update) - use ?force=true to refresh all, otherwise only those without tags
dictionaryRouter.post("/refresh-all", async (req, res) => {
  try {
    const force = req.query.force === "true";
    const entries = await prisma.dictionaryEntry.findMany({
      where: force ? {} : { tags: { isEmpty: true } },
    });

    const results = [];
    for (const entry of entries) {
      try {
        const result = await translateWithAI(entry.turkishWord);
        await prisma.dictionaryEntry.update({
          where: { id: entry.id },
          data: {
            partOfSpeech: result.partOfSpeech,
            pronunciation: result.pronunciation,
            morphologyBreakdown: result.morphologyBreakdown,
            examples: result.examples,
            tags: result.tags || [],
          },
        });
        results.push({ id: entry.id, word: entry.turkishWord, tags: result.tags, status: "updated" });
      } catch (err) {
        results.push({ id: entry.id, word: entry.turkishWord, status: "failed" });
      }
    }

    res.json({ updated: results.length, results });
  } catch (error) {
    console.error("Error refreshing entries:", error);
    res.status(500).json({ error: "Failed to refresh entries" });
  }
});

// Delete entry
dictionaryRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.dictionaryEntry.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting dictionary entry:", error);
    res.status(500).json({ error: "Failed to delete dictionary entry" });
  }
});
