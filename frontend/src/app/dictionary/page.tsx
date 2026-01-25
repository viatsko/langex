"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dictionaryApi, type DictionaryEntry } from "@/lib/api";

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    originalWord: "",
    originalLanguage: "en" as "en" | "ru",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await dictionaryApi.getAll();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load dictionary:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await dictionaryApi.create({
        ...formData,
        autoTranslate: true,
      });
      setDialogOpen(false);
      setFormData({ originalWord: "", originalLanguage: "en" });
      loadEntries();
    } catch (error) {
      console.error("Failed to add entry:", error);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await dictionaryApi.delete(id);
      setSelectedEntry(null);
      loadEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  }

  const filteredEntries = entries.filter(
    (e) =>
      e.originalWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.turkishTranslation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const words = filteredEntries.filter((e) => !e.isPhrase);
  const phrases = filteredEntries.filter((e) => e.isPhrase);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dictionary</h1>
          <p className="text-muted-foreground mt-1">
            Your personal vocabulary with morphology breakdowns
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Dictionary</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Word or Phrase</label>
                <Input
                  value={formData.originalWord}
                  onChange={(e) =>
                    setFormData({ ...formData, originalWord: e.target.value })
                  }
                  placeholder="Enter a word or phrase"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Source Language</label>
                <Select
                  value={formData.originalLanguage}
                  onValueChange={(v) =>
                    setFormData({ ...formData, originalLanguage: v as "en" | "ru" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                AI will auto-translate and provide morphology breakdown
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding ? "Translating..." : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search dictionary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {entries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your dictionary is empty. Add your first word!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredEntries.length})</TabsTrigger>
            <TabsTrigger value="words">Words ({words.length})</TabsTrigger>
            <TabsTrigger value="phrases">Phrases ({phrases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <EntryGrid entries={filteredEntries} onSelect={setSelectedEntry} />
          </TabsContent>
          <TabsContent value="words" className="mt-4">
            <EntryGrid entries={words} onSelect={setSelectedEntry} />
          </TabsContent>
          <TabsContent value="phrases" className="mt-4">
            <EntryGrid entries={phrases} onSelect={setSelectedEntry} />
          </TabsContent>
        </Tabs>
      )}

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEntry && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedEntry.turkishTranslation}
                    </DialogTitle>
                    <p className="text-muted-foreground">
                      {selectedEntry.originalWord} (
                      {selectedEntry.originalLanguage === "en" ? "English" : "Russian"})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(selectedEntry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </DialogHeader>

              {selectedEntry.pronunciation && (
                <div className="text-lg text-muted-foreground italic">
                  /{selectedEntry.pronunciation}/
                </div>
              )}

              {selectedEntry.morphologyBreakdown && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Morphology Breakdown</h4>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Root:</span>{" "}
                    {selectedEntry.morphologyBreakdown.root}
                  </p>
                  {selectedEntry.morphologyBreakdown.affixes?.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {selectedEntry.morphologyBreakdown.affixes.map((affix, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-mono bg-background px-1 rounded">
                            {affix.affix}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            ({affix.type}) - {affix.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedEntry.morphologyBreakdown.explanation}
                  </p>
                </div>
              )}

              {selectedEntry.examples?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Examples</h4>
                  <div className="space-y-2">
                    {selectedEntry.examples.map((ex, i) => (
                      <div key={i} className="bg-muted/50 p-3 rounded-md">
                        <div className="font-medium text-primary">{ex.turkish}</div>
                        <div className="text-sm text-muted-foreground">
                          {ex.english}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryGrid({
  entries,
  onSelect,
}: {
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No entries found</p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(entry)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{entry.turkishTranslation}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {entry.originalWord}
              <span className="ml-2 text-xs uppercase">
                {entry.originalLanguage}
              </span>
            </p>
          </CardHeader>
          {entry.pronunciation && (
            <CardContent className="pt-0">
              <p className="text-sm italic text-muted-foreground">
                /{entry.pronunciation}/
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
