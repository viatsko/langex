"use client";

import { useState } from "react";
import { Send, Loader2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { aiApi, type AiResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: AiResponse;
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await aiApi.ask(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, data: response },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ask AI</h1>
        <p className="text-muted-foreground mt-1">
          Ask &quot;How do I say X in Turkish?&quot; - translations are auto-saved to
          your dictionary
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6 min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">Try asking:</p>
            <div className="space-y-2">
              <p className="italic">&quot;How do I say hello in Turkish?&quot;</p>
              <p className="italic">&quot;How do I ask where the bathroom is?&quot;</p>
              <p className="italic">&quot;How do I say I love you in Turkish?&quot;</p>
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.data?.turkish && (
                  <div className="mt-4 p-3 bg-background/10 rounded-md">
                    <p className="text-xl font-semibold">{message.data.turkish}</p>
                    {message.data.dictionaryEntry?.pronunciation && (
                      <p className="text-sm opacity-80 italic">
                        /{message.data.dictionaryEntry.pronunciation}/
                      </p>
                    )}
                  </div>
                )}

                {message.data?.dictionaryEntry?.morphologyBreakdown && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium mb-1">Word breakdown:</p>
                    <p className="opacity-80">
                      {message.data.dictionaryEntry.morphologyBreakdown.explanation}
                    </p>
                  </div>
                )}

                {message.data?.shouldSaveToDictionary && (
                  <div className="mt-3 flex items-center gap-2 text-sm opacity-80">
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Saved to dictionary</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask how to say something in Turkish..."
          className="resize-none"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
