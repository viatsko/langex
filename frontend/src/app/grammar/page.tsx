"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { grammarApi, type GrammarCard } from "@/lib/api";

export default function GrammarPage() {
  const [cards, setCards] = useState<GrammarCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GrammarCard | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    category: "",
  });

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    try {
      const data = await grammarApi.getAll();
      setCards(data);
    } catch (error) {
      console.error("Failed to load grammar cards:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await grammarApi.create({
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
      });
      setDialogOpen(false);
      setFormData({ title: "", slug: "", description: "", content: "", category: "" });
      loadCards();
    } catch (error) {
      console.error("Failed to create grammar card:", error);
    }
  }

  // Group cards by category
  const cardsByCategory = cards.reduce(
    (acc, card) => {
      const category = card.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(card);
      return acc;
    },
    {} as Record<string, GrammarCard[]>
  );

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Grammar Cards</h1>
          <p className="text-muted-foreground mt-1">
            Learn Turkish grammar concepts with examples
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Grammar Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Asking Questions"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Basics, Verbs, Nouns"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content (Markdown)</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Detailed explanation with examples..."
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No grammar cards yet. Create your first one!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(cardsByCategory).map(([category, categoryCards]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 text-primary">
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryCards.map((card) => (
                  <Card
                    key={card.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedCard(card)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Detail Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCard.title}</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{selectedCard.description}</p>
                <div className="mt-4 whitespace-pre-wrap">{selectedCard.content}</div>
                {selectedCard.examples && selectedCard.examples.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Examples</h4>
                    <div className="space-y-2">
                      {selectedCard.examples.map((ex, i) => (
                        <div key={i} className="bg-muted p-3 rounded-md">
                          <div className="font-medium text-primary">
                            {ex.turkish}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ex.english}
                          </div>
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
    </div>
  );
}
