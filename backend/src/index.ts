import express from "express";
import cors from "cors";
import { grammarRouter } from "./routes/grammar.js";
import { dictionaryRouter } from "./routes/dictionary.js";
import { aiRouter } from "./routes/ai.js";
import { translateRouter } from "./routes/translate.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/grammar", grammarRouter);
app.use("/api/dictionary", dictionaryRouter);
app.use("/api/ai", aiRouter);
app.use("/api/translate", translateRouter);

app.listen(PORT, () => {
  console.log(`🚀 Langex backend running on http://localhost:${PORT}`);
});
