"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MessageSquarePlus,
  Search,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/conversation-utils";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  subject?: string | null;
  mode: string;
  updatedAt: Date;
  _count: {
    messages: number;
  };
}

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  refreshTrigger?: number;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  refreshTrigger = 0,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  // Auto-refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadConversations();
    }
  }, [refreshTrigger]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/conversations");
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="flex flex-col h-full border-r bg-card w-16 items-center py-4 gap-4 transition-all duration-300">
        <Button
          variant="ghost"
          className="flex flex-col h-auto py-2 px-1 gap-1"
          onClick={() => setIsOpen(true)}
          title="Open conversation history"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px] font-medium">History</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-card w-80 transition-all duration-300">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold px-1">History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            title="Close conversation history"
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onNewConversation} className="w-full" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={cn(
                "p-3 cursor-pointer hover:bg-accent transition-colors group",
                activeConversationId === conversation.id &&
                  "bg-accent border-primary"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {conversation.subject && (
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                        {conversation.subject}
                      </span>
                    )}
                    <span>{conversation._count.messages} messages</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(new Date(conversation.updatedAt))}
                  </p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(conversation.id, e)}
                  disabled={deletingId === conversation.id}
                >
                  {deletingId === conversation.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
