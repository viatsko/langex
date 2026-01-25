"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dictionaryApi, type DictionaryEntry } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface TurkishWordProps {
  word: string;
  onWordAdded?: () => void;
}

function TurkishWord({ word, onWordAdded }: TurkishWordProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, "").toLowerCase();

  const handleOpenChange = useCallback(async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !entry && !notFound && cleanWord.length > 1) {
      setLoading(true);
      try {
        const result = await dictionaryApi.lookup(cleanWord);
        if (result.found && result.entry) {
          setEntry(result.entry);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
  }, [cleanWord, entry, notFound]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await dictionaryApi.create({ word: cleanWord, autoTranslate: true });
      const result = await dictionaryApi.lookup(cleanWord);
      if (result.found && result.entry) {
        setEntry(result.entry);
        setNotFound(false);
      }
      onWordAdded?.();
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
  };

  // Don't make punctuation or very short words interactive
  if (cleanWord.length <= 1) {
    return <span>{word} </span>;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 transition-colors">
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entry ? (
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-primary">
                {entry.turkishWord}
                {entry.partOfSpeech && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground italic">
                    ({entry.partOfSpeech})
                  </span>
                )}
              </p>
              {entry.pronunciation && (
                <p className="text-xs text-muted-foreground italic">/{entry.pronunciation}/</p>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">EN:</span> {entry.englishWord}</p>
              <p><span className="text-muted-foreground">RU:</span> {entry.russianWord}</p>
            </div>
            {entry.morphologyBreakdown && (
              <div className="text-xs bg-muted p-2 rounded">
                <p className="font-medium mb-1">Morphology</p>
                <p><span className="text-muted-foreground">Root:</span> {entry.morphologyBreakdown.root}</p>
                {entry.morphologyBreakdown.affixes?.length > 0 && (
                  <div className="mt-1">
                    {entry.morphologyBreakdown.affixes.map((affix, i) => (
                      <span key={i} className="inline-block mr-2">
                        <span className="font-mono bg-background px-1 rounded">{affix.affix}</span>
                        <span className="text-muted-foreground ml-1">({affix.meaning})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : notFound ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-3">
              &quot;{cleanWord}&quot; not in dictionary
            </p>
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Dictionary
                </>
              )}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

interface TurkishTextProps {
  text: string;
  pronunciation?: string;
  onWordAdded?: () => void;
}

export function TurkishText({ text, pronunciation, onWordAdded }: TurkishTextProps) {
  const words = text.split(/(\s+)/);

  return (
    <div>
      <p className="font-medium text-primary">
        {words.map((word, i) => {
          // Keep whitespace as-is
          if (/^\s+$/.test(word)) {
            return <span key={i}>{word}</span>;
          }
          return <TurkishWord key={i} word={word} onWordAdded={onWordAdded} />;
        })}
      </p>
      {pronunciation && (
        <p className="text-xs text-muted-foreground italic mt-0.5">/{pronunciation}/</p>
      )}
    </div>
  );
}
