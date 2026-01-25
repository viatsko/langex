import { Router } from "express";
import { prisma } from "../services/db.js";
import { askTurkishQuestion } from "../services/anthropic.js";

export const aiRouter = Router();

// Ask a question about Turkish
aiRouter.post("/ask", async (req, res) => {
  try {
    const { question, saveToDictionary = true } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await askTurkishQuestion(question);

    // If there's a translation worth saving and user wants it saved
    if (saveToDictionary && result.shouldSaveToDictionary && result.dictionaryEntry) {
      const entry = result.dictionaryEntry;

      // Check if entry already exists
      const existing = await prisma.dictionaryEntry.findFirst({
        where: {
          turkishWord: entry.turkish,
        },
      });

      if (!existing) {
        await prisma.dictionaryEntry.create({
          data: {
            englishWord: entry.english,
            russianWord: entry.russian,
            turkishWord: entry.turkish,
            pronunciation: entry.pronunciation,
            morphologyBreakdown: entry.morphologyBreakdown,
            isPhrase: entry.english.includes(" ") || entry.russian.includes(" "),
            examples: entry.examples,
          },
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error processing AI question:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

// Get conversation history (for future use)
aiRouter.get("/conversations", async (_, res) => {
  try {
    const conversations = await prisma.aiConversation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});
