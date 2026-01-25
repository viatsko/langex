import { Router } from "express";
import { prisma } from "../services/db.js";
import { z } from "zod";

export const conversationsRouter = Router();

const conversationLineSchema = z.object({
  speaker: z.string(),
  turkish: z.string(),
  pronunciation: z.string(),
  english: z.string(),
  russian: z.string(),
});

const createConversationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  lines: z.array(conversationLineSchema).default([]),
  order: z.number().default(0),
});

// Get all conversations
conversationsRouter.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get single conversation
conversationsRouter.get("/:id", async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Create conversation
conversationsRouter.post("/", async (req, res) => {
  try {
    const data = createConversationSchema.parse(req.body);
    const conversation = await prisma.conversation.create({ data });
    res.status(201).json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Update conversation
conversationsRouter.put("/:id", async (req, res) => {
  try {
    const data = createConversationSchema.partial().parse(req.body);
    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data,
    });
    res.json(conversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Delete conversation
conversationsRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.conversation.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});
