import { Router } from "express";
import { prisma } from "../services/db.js";
import { z } from "zod";

export const grammarRouter = Router();

const createGrammarSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  content: z.string(),
  examples: z.array(z.object({
    turkish: z.string(),
    english: z.string(),
  })).default([]),
  category: z.string(),
  order: z.number().default(0),
});

// Get all grammar cards
grammarRouter.get("/", async (_, res) => {
  try {
    const cards = await prisma.grammarCard.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    res.json(cards);
  } catch (error) {
    console.error("Error fetching grammar cards:", error);
    res.status(500).json({ error: "Failed to fetch grammar cards" });
  }
});

// Get grammar card by slug
grammarRouter.get("/:slug", async (req, res) => {
  try {
    const card = await prisma.grammarCard.findUnique({
      where: { slug: req.params.slug },
    });
    if (!card) {
      return res.status(404).json({ error: "Grammar card not found" });
    }
    res.json(card);
  } catch (error) {
    console.error("Error fetching grammar card:", error);
    res.status(500).json({ error: "Failed to fetch grammar card" });
  }
});

// Create grammar card
grammarRouter.post("/", async (req, res) => {
  try {
    const data = createGrammarSchema.parse(req.body);
    const card = await prisma.grammarCard.create({ data });
    res.status(201).json(card);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating grammar card:", error);
    res.status(500).json({ error: "Failed to create grammar card" });
  }
});

// Update grammar card
grammarRouter.put("/:id", async (req, res) => {
  try {
    const data = createGrammarSchema.partial().parse(req.body);
    const card = await prisma.grammarCard.update({
      where: { id: req.params.id },
      data,
    });
    res.json(card);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating grammar card:", error);
    res.status(500).json({ error: "Failed to update grammar card" });
  }
});

// Delete grammar card
grammarRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.grammarCard.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting grammar card:", error);
    res.status(500).json({ error: "Failed to delete grammar card" });
  }
});
