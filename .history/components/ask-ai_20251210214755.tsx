"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Sparkles, Loader2, Download, Trash2 } from "lucide-react";
import { MarkdownMessage } from "./markdown-message";
import { ConversationSidebar } from "./conversation-sidebar";
import {
  exportConversationAsMarkdown,
  generateConversationTitle,
} from "@/lib/conversation-utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  subject?: string | null;
  mode: string;
  messages: Message[];
}

const SUBJECTS = [
  { value: "general", label: "General" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "programming", label: "Programming" },
  { value: "history", label: "History" },
  { value: "language", label: "Language" },
];

const MODES = [
  { value: "explain", label: "Explain" },
  { value: "practice", label: "Practice" },
  { value: "quiz", label: "Quiz" },
];

export function EnhancedAskAI() {
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("general");
  const [mode, setMode] = useState("explain");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = async (firstMessage?: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage,
          subject: subject !== "general" ? subject : null,
          mode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentConversation({
          ...data.conversation,
          messages: [],
        });
        setMessages([]);
        return data.conversation.id;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
    return null;
  };

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();

      if (response.ok) {
        setCurrentConversation(data.conversation);
        setMessages(data.conversation.messages);
        setSubject(data.conversation.subject || "general");
        setMode(data.conversation.mode);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setSubject("general");
    setMode("explain");
  };

  const handleDeleteConversation = (id: string) => {
    if (currentConversation?.id === id) {
      handleNewConversation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    setInput("");

    // Create temporary user message for immediate display
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      createdAt: new Date(),
    };

    // Create temporary AI message for streaming
    const tempAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    setIsLoading(true);

    try {
      // Create conversation if it doesn't exist
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        conversationId = await createNewConversation(userMessageContent);
        if (!conversationId) {
          throw new Error("Failed to create conversation");
        }
      }

      // Send message and stream AI response
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessageContent }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                accumulatedText += data.text;
                // Update the temporary AI message with accumulated text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAiMessage.id
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }

              if (data.done) {
                // Replace temp messages with saved ones
                setMessages((prev) =>
                  prev
                    .filter(
                      (m) =>
                        m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
                    )
                    .concat([data.userMessage, data.aiMessage])
                );

                // Update conversation title if it's the first message
                if (messages.length === 0 && currentConversation) {
                  setCurrentConversation({
                    ...currentConversation,
                    title: generateConversationTitle(userMessageContent),
                  });
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      // Remove temp messages and show error
      setMessages((prev) =>
        prev.filter(
          (m) => m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
        )
      );

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!currentConversation || messages.length === 0) return;

    exportConversationAsMarkdown(
      currentConversation.title,
      messages,
      currentConversation.subject || undefined,
      currentConversation.mode
    );
  };

  const handleClearConversation = () => {
    if (!confirm("Are you sure you want to clear this conversation?")) return;
    handleNewConversation();
  };

  const handleSubjectChange = async (newSubject: string) => {
    setSubject(newSubject);

    if (currentConversation) {
      try {
        await fetch(`/api/conversations/${currentConversation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: newSubject !== "general" ? newSubject : null,
          }),
        });
      } catch (error) {
        console.error("Error updating subject:", error);
      }
    }
  };

  const handleModeChange = async (newMode: string) => {
    setMode(newMode);

    if (currentConversation) {
      try {
        await fetch(`/api/conversations/${currentConversation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: newMode }),
        });
      } catch (error) {
        console.error("Error updating mode:", error);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      <ConversationSidebar
        activeConversationId={currentConversation?.id || null}
        onSelectConversation={loadConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {currentConversation?.title || "New Conversation"}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select value={subject} onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {messages.length > 0 && (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleExport}
                  title="Export conversation"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleClearConversation}
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0 pt-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 text-primary/50" />
                <p className="font-medium text-lg">Ask me anything!</p>
                <p className="text-sm mt-2 max-w-md">
                  I'm your AI tutor. Choose a subject and learning mode above,
                  then start asking questions. I can explain concepts, generate
                  practice problems, or quiz you on topics.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MarkdownMessage
                    key={message.id}
                    content={message.content}
                    role={message.role}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
