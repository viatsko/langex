"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Tag, X, ArrowDownAZ, Clock, MessageSquarePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dictionaryApi, type DictionaryEntry } from "@/lib/api";
import { TurkishText } from "@/components/turkish-text";
import { useToast } from "@/components/ui/use-toast";
import { ConversationPanel } from "@/components/conversation-panel";
import { QuickReference } from "@/components/quick-reference";

function TagEditor({ tags, onTagsChange }: { tags: string[]; onTagsChange: (tags: string[]) => void }) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAddTag} className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag..."
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" variant="outline" disabled={!newTag.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}

function SuggestFixButton({
  entry,
  onFixed
}: {
  entry: DictionaryEntry;
  onFixed: (updated: DictionaryEntry) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setLoading(true);
    try {
      const updated = await dictionaryApi.suggestFix(entry.id, suggestion.trim());
      onFixed(updated);
      setOpen(false);
      setSuggestion("");
      toast({
        title: "Translation updated",
        description: "The translation has been corrected based on your suggestion.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply suggestion";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suggest a fix for this translation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Suggest a fix</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Describe how the translation should be corrected
            </p>
            <Input
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder='e.g., "This means X, not Y" or "Russian should be..."'
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading || !suggestion.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Apply Fix"
              )}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default function DictionaryPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"alphabetical" | "recent">("alphabetical");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [adding, setAdding] = useState(false);

  const [word, setWord] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const data = await dictionaryApi.getAll({ sort: sortBy });
      setEntries(data);
    } catch (error) {
      console.error("Failed to load dictionary:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await dictionaryApi.create({
        word,
        autoTranslate: true,
        tags: selectedTag ? [selectedTag] : undefined,
      });
      setDialogOpen(false);
      setWord("");
      loadEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add word";
      toast({
        variant: "destructive",
        title: "Error adding word",
        description: message,
      });
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

  async function handleUpdateTags(id: string, tags: string[]) {
    try {
      const updated = await dictionaryApi.update(id, { tags });
      setSelectedEntry(updated);
      loadEntries();
    } catch (error) {
      console.error("Failed to update tags:", error);
    }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.englishWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.russianWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.turkishWord.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (e.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Dictionary Section - 2/3 width */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold">Dictionary</h1>
            <p className="text-muted-foreground mt-1">
              Your vocabulary with English, Turkish, and Russian translations
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
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter in English, Russian, or Turkish"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Language is auto-detected. Turkish words typed in Latin alphabet will be corrected automatically.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adding || !word.trim()}>
                    {adding ? "Translating..." : "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in any language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex rounded-md border">
            <button
              onClick={() => setSortBy("alphabetical")}
              className={`px-3 py-2 flex items-center gap-1 text-sm ${
                sortBy === "alphabetical"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-l-md`}
            >
              <ArrowDownAZ className="h-4 w-4" />
              A-Z
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-2 flex items-center gap-1 text-sm ${
                sortBy === "recent"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-r-md`}
            >
              <Clock className="h-4 w-4" />
              Recent
            </button>
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 shrink-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                !selectedTag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable cards area */}
        <div className="overflow-y-auto min-h-0 flex-1 pr-2">
          <QuickReference />
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
            <>
              {/* Entries as Cards */}
              <div className="grid md:grid-cols-2 min-[1800px]:grid-cols-3 gap-4">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-primary">
                          {entry.turkishWord}
                        </CardTitle>
                        {entry.pronunciation && (
                          <p className="text-sm text-muted-foreground italic">/{entry.pronunciation}/</p>
                        )}
                      </div>
                      {entry.partOfSpeech && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {entry.partOfSpeech}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">EN:</span> {entry.englishWord}</p>
                    <p><span className="text-muted-foreground">RU:</span> {entry.russianWord}</p>
                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

              {filteredEntries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No entries found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conversations Section - 1/3 width */}
      <div className="lg:col-span-1 flex flex-col min-h-0">
        <div className="mb-4 shrink-0">
          <h2 className="text-2xl font-bold">Conversations</h2>
          <p className="text-muted-foreground mt-1">
            Practice with sample dialogues
          </p>
        </div>
        <div className="overflow-y-auto min-h-0 flex-1 pr-2">
          <ConversationPanel onWordAdded={loadEntries} />
        </div>
      </div>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEntry && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedEntry.turkishWord}
                    </DialogTitle>
                    {selectedEntry.partOfSpeech && (
                      <span className="text-sm text-muted-foreground italic">
                        {selectedEntry.partOfSpeech}
                      </span>
                    )}
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

              {/* Translations */}
              <div className="space-y-2 py-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground font-medium">English:</span> {selectedEntry.englishWord}</p>
                    <p><span className="text-muted-foreground font-medium">Russian:</span> {selectedEntry.russianWord}</p>
                  </div>
                  <SuggestFixButton
                    entry={selectedEntry}
                    onFixed={(updated) => {
                      setSelectedEntry(updated);
                      loadEntries();
                    }}
                  />
                </div>
              </div>

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
                      <div key={i} className="bg-muted/50 p-3 rounded-md space-y-1">
                        <TurkishText
                          text={ex.turkish}
                          pronunciation={ex.pronunciation}
                          onWordAdded={loadEntries}
                        />
                        <div className="text-sm text-muted-foreground">{ex.english}</div>
                        <div className="text-sm text-muted-foreground">{ex.russian}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <TagEditor
                  tags={selectedEntry.tags || []}
                  onTagsChange={(tags) => handleUpdateTags(selectedEntry.id, tags)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
