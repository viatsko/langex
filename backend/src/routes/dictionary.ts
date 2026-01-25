import { Router } from "express";
import { prisma } from "../services/db.js";
import { z } from "zod";
import { translateWithAI } from "../services/anthropic.js";

export const dictionaryRouter = Router();

const createEntrySchema = z.object({
  originalWord: z.string().min(1),
  originalLanguage: z.enum(["en", "ru"]),
  turkishTranslation: z.string().min(1),
  pronunciation: z.string().optional(),
  morphologyBreakdown: z.any().optional(),
  isPhrase: z.boolean().default(false),
  examples: z.array(z.any()).default([]),
  notes: z.string().optional(),
});

// Get all dictionary entries
dictionaryRouter.get("/", async (req, res) => {
  try {
    const { search, language } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { originalWord: { contains: search as string, mode: "insensitive" } },
        { turkishTranslation: { contains: search as string, mode: "insensitive" } },
      ];
    }
    if (language) {
      where.originalLanguage = language;
    }

    const entries = await prisma.dictionaryEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching dictionary entries:", error);
    res.status(500).json({ error: "Failed to fetch dictionary entries" });
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
    const { originalWord, originalLanguage, autoTranslate } = req.body;

    if (autoTranslate) {
      // Use AI to translate and get morphology
      const result = await translateWithAI(originalWord, originalLanguage);

      const entry = await prisma.dictionaryEntry.create({
        data: {
          originalWord,
          originalLanguage,
          turkishTranslation: result.turkish,
          pronunciation: result.pronunciation,
          morphologyBreakdown: result.morphologyBreakdown,
          isPhrase: originalWord.includes(" "),
          examples: result.examples,
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
