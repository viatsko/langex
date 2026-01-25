"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, BookText, MessageCircle, Plus, Send, Loader2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  grammarApi,
  dictionaryApi,
  aiApi,
  type GrammarCard,
  type DictionaryEntry,
  type AiResponse,
} from "@/lib/api";
import { TurkishText } from "@/components/turkish-text";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: AiResponse;
}

export default function Home() {
  const { toast } = useToast();

  // Grammar state
  const [grammarCards, setGrammarCards] = useState<GrammarCard[]>([]);
  const [grammarLoading, setGrammarLoading] = useState(true);
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarCard | null>(null);

  // Dictionary state
  const [dictEntries, setDictEntries] = useState<DictionaryEntry[]>([]);
  const [dictLoading, setDictLoading] = useState(true);
  const [dictDialogOpen, setDictDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [addingWord, setAddingWord] = useState(false);
  const [newWord, setNewWord] = useState("");

  // Ask AI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadGrammar();
    loadDictionary();
  }, []);

  async function loadGrammar() {
    try {
      const data = await grammarApi.getAll();
      setGrammarCards(data);
    } catch (error) {
      console.error("Failed to load grammar:", error);
    } finally {
      setGrammarLoading(false);
    }
  }

  async function loadDictionary() {
    try {
      const data = await dictionaryApi.getAll();
      setDictEntries(data);
    } catch (error) {
      console.error("Failed to load dictionary:", error);
    } finally {
      setDictLoading(false);
    }
  }

  async function handleAddWord(e: React.FormEvent) {
    e.preventDefault();
    setAddingWord(true);
    try {
      await dictionaryApi.create({ word: newWord, autoTranslate: true });
      setDictDialogOpen(false);
      setNewWord("");
      loadDictionary();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add word";
      toast({
        variant: "destructive",
        title: "Error adding word",
        description: message,
      });
    } finally {
      setAddingWord(false);
    }
  }

  async function handleAskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const question = aiInput.trim();
    setAiInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setAiLoading(true);

    try {
      const response = await aiApi.ask(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, data: response },
      ]);
      // Refresh dictionary if word was saved
      if (response.shouldSaveToDictionary) {
        loadDictionary();
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Langex</h1>
        <p className="text-muted-foreground">Your Turkish language learning dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Grammar Column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Grammar</h2>
            </div>
            <Link href="/grammar">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {grammarLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : grammarCards.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">No grammar cards yet</p>
                  <Link href="/grammar">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Card
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              grammarCards.slice(0, 10).map((card) => (
                <Card
                  key={card.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedGrammar(card)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{card.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Dictionary Column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Dictionary</h2>
            </div>
            <div className="flex gap-1">
              <Dialog open={dictDialogOpen} onOpenChange={setDictDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Dictionary</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddWord} className="space-y-4">
                    <Input
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Enter word in any language"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Language is auto-detected. Turkish in Latin alphabet will be corrected.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDictDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addingWord || !newWord.trim()}>
                        {addingWord ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Link href="/dictionary">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {dictLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : dictEntries.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">No words yet</p>
                  <Button size="sm" onClick={() => setDictDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Word
                  </Button>
                </CardContent>
              </Card>
            ) : (
              dictEntries.slice(0, 15).map((entry) => (
                <Card
                  key={entry.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-primary">{entry.turkishWord}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.englishWord} / {entry.russianWord}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Ask AI Column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Ask AI</h2>
            </div>
            <Link href="/ask">
              <Button variant="ghost" size="sm">Full View</Button>
            </Link>
          </div>
          <div className="flex-1 flex flex-col min-h-0 border rounded-lg p-3">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <p className="mb-2">Ask how to say something in Turkish</p>
                  <p className="italic text-xs">&quot;How do I say hello?&quot;</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm ${msg.role === "user" ? "text-right" : ""}`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg max-w-[90%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.data?.turkish && (
                        <p className="font-semibold mt-1">{msg.data.turkish}</p>
                      )}
                      {msg.data?.shouldSaveToDictionary && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                          <BookmarkPlus className="h-3 w-3" />
                          <span>Saved</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
            <form onSubmit={handleAskSubmit} className="flex gap-2">
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask in Turkish..."
                className="text-sm"
              />
              <Button type="submit" size="icon" disabled={aiLoading || !aiInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Grammar Detail Dialog */}
      <Dialog open={!!selectedGrammar} onOpenChange={() => setSelectedGrammar(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGrammar && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedGrammar.title}</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{selectedGrammar.description}</p>
                <div className="mt-4 whitespace-pre-wrap">{selectedGrammar.content}</div>
                {selectedGrammar.examples?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Examples</h4>
                    <div className="space-y-2">
                      {selectedGrammar.examples.map((ex, i) => (
                        <div key={i} className="bg-muted p-3 rounded-md">
                          <div className="font-medium text-primary">{ex.turkish}</div>
                          <div className="text-sm text-muted-foreground">{ex.english}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dictionary Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {selectedEntry.turkishWord}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p><span className="text-muted-foreground">English:</span> {selectedEntry.englishWord}</p>
                  <p><span className="text-muted-foreground">Russian:</span> {selectedEntry.russianWord}</p>
                  {selectedEntry.pronunciation && (
                    <p className="italic text-muted-foreground">/{selectedEntry.pronunciation}/</p>
                  )}
                </div>
                {selectedEntry.morphologyBreakdown && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Morphology</p>
                    <p><span className="text-muted-foreground">Root:</span> {selectedEntry.morphologyBreakdown.root}</p>
                    <p className="text-muted-foreground mt-1">{selectedEntry.morphologyBreakdown.explanation}</p>
                  </div>
                )}
                {selectedEntry.examples?.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Examples</p>
                    {selectedEntry.examples.slice(0, 2).map((ex, i) => (
                      <div key={i} className="bg-muted/50 p-2 rounded text-sm mb-1">
                        <TurkishText
                          text={ex.turkish}
                          pronunciation={ex.pronunciation}
                          onWordAdded={loadDictionary}
                        />
                        <p className="text-xs text-muted-foreground">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
