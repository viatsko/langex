"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { conversationsApi, type Conversation, type ConversationLine } from "@/lib/api";
import { TurkishText } from "@/components/turkish-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ConversationLineItemProps {
  line: ConversationLine;
  onWordAdded?: () => void;
}

function ConversationLineItem({ line, onWordAdded }: ConversationLineItemProps) {
  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
          {line.speaker.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{line.speaker}</p>
          <TurkishText
            text={line.turkish}
            pronunciation={line.pronunciation}
            onWordAdded={onWordAdded}
          />
          <div className="mt-2 text-sm space-y-0.5">
            <p className="text-muted-foreground">
              <span className="text-xs font-medium">EN:</span> {line.english}
            </p>
            <p className="text-muted-foreground">
              <span className="text-xs font-medium">RU:</span> {line.russian}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConversationCardProps {
  conversation: Conversation;
  onWordAdded?: () => void;
}

function ConversationCard({ conversation, onWordAdded }: ConversationCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-base">{conversation.title}</CardTitle>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[conversation.difficulty]}`}
              >
                {conversation.difficulty}
              </span>
            </div>
            {conversation.description && (
              <p className="text-sm text-muted-foreground ml-6">
                {conversation.description}
              </p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {conversation.lines.map((line, index) => (
              <ConversationLineItem
                key={index}
                line={line}
                onWordAdded={onWordAdded}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface ConversationPanelProps {
  onWordAdded?: () => void;
}

export function ConversationPanel({ onWordAdded }: ConversationPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await conversationsApi.getAll();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No conversation samples yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group conversations by category
  const grouped = conversations.reduce((acc, conv) => {
    if (!acc[conv.category]) {
      acc[conv.category] = [];
    }
    acc[conv.category].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, convs]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {category}
          </h3>
          <div className="space-y-4">
            {convs.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onWordAdded={onWordAdded}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
