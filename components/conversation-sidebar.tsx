"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Trash2,
  Loader2,
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
  onDeleteConversation,
  refreshTrigger = 0,
}: Omit<ConversationSidebarProps, "onNewConversation">) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (response.ok) setConversations(data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      setDeletingId(id);
      const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
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

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 pb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface/50 border-none h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-xs font-medium text-muted-foreground opacity-60">
              {searchQuery ? "No matches found" : "No recent conversations"}
            </p>
          </div>
        ) : (
          <>
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2">
              Recent Chats
            </h3>
            {filteredConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "w-full flex flex-col items-start gap-1 p-3 rounded-xl transition-all group text-left relative",
                    isActive 
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className={cn(
                      "text-sm font-semibold truncate flex-1",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {conversation.title}
                    </span>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/10"
                      onClick={(e) => handleDelete(conversation.id, e)}
                      disabled={deletingId === conversation.id}
                    >
                      {deletingId === conversation.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {formatRelativeTime(new Date(conversation.updatedAt))}
                    </span>
                    {conversation.subject && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/5 text-primary rounded-md font-bold uppercase tracking-wider">
                        {conversation.subject}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

