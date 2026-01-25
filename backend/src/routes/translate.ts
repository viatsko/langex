import { Router } from "express";
import { googleTranslate } from "../services/translate.js";

export const translateRouter = Router();

// Simple translation endpoint (Google Translate)
translateRouter.post("/", async (req, res) => {
  try {
    const { text, from } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!from || !["en", "ru"].includes(from)) {
      return res.status(400).json({ error: "Source language must be 'en' or 'ru'" });
    }

    const translation = await googleTranslate(text, from);
    res.json({ translation });
  } catch (error) {
    console.error("Error translating:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
});
