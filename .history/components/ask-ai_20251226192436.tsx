"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  Download,
  Trash2,
  Plus,
  Image,
  History,
  Brain,
  School,
  Verified,
  History as HistoryIcon,
  Sliders,
  Shapes,
  Search,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownMessage } from "./markdown-message";
import { ConversationSidebar } from "./conversation-sidebar";
import { exportConversationAsMarkdown } from "@/lib/conversation-utils";
import { cn } from "@/lib/utils";
import { ModelSelector } from "@/components/model-selector";

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
  { value: "explain", label: "Explain" },
  { value: "socratic", label: "Socratic" },
  { value: "quiz me", label: "Quiz Me" },
];

type OpenRouterModelItem = { id: string; name: string };

interface EnhancedAskAIProps {
  enabledModels?: string[];
}

export function EnhancedAskAI({ enabledModels }: EnhancedAskAIProps) {
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("general");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handlePickMedia = () => {
    mediaInputRef.current?.click();
  };

  const handleMediaSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    // Allow re-selecting the same file(s)
    e.target.value = "";

    if (files.length === 0 || isLoading) return;

    const hasVideo = files.some((f) => f.type.startsWith("video/"));
    if (hasVideo && files.length !== 1) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Only a single video is supported. Please select one video, or upload multiple images.",
          createdAt: new Date(),
        },
      ]);
      return;
    }

    const query = (
      input && input.trim().length > 0 ? input : "Describe the scene"
    ).trim();
    setInput("");

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: `📎 ${query}`,
      createdAt: new Date(),
    };

    const tempAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    setIsLoading(true);

    try {
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        conversationId = await createNewConversation(query);
        if (!conversationId) throw new Error("Failed to create conversation");
      }

      const form = new FormData();
      form.set("query", query);
      for (const f of files) {
        form.append("media", f, f.name);
      }

      const response = await fetch(
        `/api/conversations/${conversationId}/media`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.details || data?.error || "Failed to analyze media"
        );
      }

      const data = (await response.json()) as {
        userMessage: Message;
        aiMessage: Message;
      };

      setMessages((prev) =>
        prev
          .filter(
            (m) => m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
          )
          .concat([data.userMessage, data.aiMessage])
      );

      setRefreshSidebar((prev) => prev + 1);
    } catch (error: any) {
      console.error("Media error:", error);
      setMessages((prev) =>
        prev.filter(
          (m) => m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
        )
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${error.message}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const createNewConversation = async (firstMessage?: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage,
          subject: subject !== "general" ? subject : null,
          mode: subject,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentConversation({ ...data.conversation, messages: [] });
        if (!firstMessage) setMessages([]);
        setRefreshSidebar((prev) => prev + 1);
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
        setSubject(data.conversation.mode || "general");
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setSubject("general");
  };

  const handleDeleteConversation = (id: string) => {
    if (currentConversation?.id === id) handleNewConversation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    setInput("");

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      createdAt: new Date(),
    };

    const tempAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    setIsLoading(true);

    try {
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        conversationId = await createNewConversation(userMessageContent);
        if (!conversationId) throw new Error("Failed to create conversation");
      }

      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessageContent,
            model: selectedModel,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let sseBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          while (true) {
            const eventEndIndex = sseBuffer.indexOf("\n\n");
            if (eventEndIndex === -1) break;
            const rawEvent = sseBuffer.slice(0, eventEndIndex);
            sseBuffer = sseBuffer.slice(eventEndIndex + 2);
            for (const line of rawEvent.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAiMessage.id
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }
              if (data.done) {
                setMessages((prev) =>
                  prev
                    .filter(
                      (m) =>
                        m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
                    )
                    .concat([data.userMessage, data.aiMessage])
                );
                setRefreshSidebar((prev) => prev + 1);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.filter(
          (m) => m.id !== tempUserMessage.id && m.id !== tempAiMessage.id
        )
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${error.message}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = async (newMode: string) => {
    setSubject(newMode);
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Column 2: History Sidebar */}
      <div className="w-64 border-r bg-surface/50 flex flex-col shrink-0">
        <div className="p-4">
          <Button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-6 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationSidebar
            activeConversationId={currentConversation?.id || null}
            onSelectConversation={loadConversation}
            onDeleteConversation={handleDeleteConversation}
            refreshTrigger={refreshSidebar}
          />
        </div>
        <div className="p-3 border-t flex justify-between items-center text-muted-foreground">
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 border-none transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Column 3: Main Chat area */}
      <div className="flex-1 flex flex-col relative bg-background">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">AI Tutor</h2>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
              Online
            </span>
          </div>

          <div className="flex bg-muted rounded-lg p-1">
            {SUBJECTS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleModeChange(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  subject === s.value
                    ? "bg-background shadow-sm font-bold text-foreground"
                    : "text-muted-foreground hover:bg-background/50"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full mt-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-primary-foreground">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-tight opacity-70">
                    Super Student AI
                  </span>
                  <div className="bg-card border p-6 rounded-2xl rounded-tl-none shadow-sm leading-relaxed">
                    <p className="mb-4">
                      Hello Student! 👋 I'm your personal AI Tutor. I'm here to
                      help you master your subjects, explain complex topics, or
                      prepare for upcoming exams.
                    </p>
                    <p className="mb-4 font-semibold text-sm">
                      Here are a few ways I can help right now:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          t: "📝 Summarize Notes",
                          d: "Paste your lecture notes for a quick summary.",
                        },
                        {
                          t: "🧪 Explain a Concept",
                          d: "Stuck on a difficult topic? Let me break it down.",
                        },
                        {
                          t: "📅 Create Study Plan",
                          d: "Organize your week for maximum efficiency.",
                        },
                        {
                          t: "❓ Practice Quiz",
                          d: "Test your knowledge on any subject.",
                        },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setInput(item.t.split(" ").slice(1).join(" "))
                          }
                          className="text-left p-3 rounded-xl border hover:bg-muted transition-colors text-sm"
                        >
                          <span className="block font-bold mb-1">{item.t}</span>
                          <span className="text-muted-foreground text-xs">
                            {item.d}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 w-full",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-[10px] font-bold",
                      message.role === "user"
                        ? "bg-accent"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.role === "user" ? (
                      "ME"
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex flex-col gap-1 max-w-[85%] min-w-0",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-50 px-1">
                      {message.role === "user" ? "You" : "Super Student AI"}
                    </span>
                    <div
                      className={cn(
                        "p-4 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden wrap-break-word w-full",
                        message.role === "user"
                          ? "bg-accent rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      )}
                    >
                      {message.role === "assistant" && !message.content ? (
                        <div className="flex gap-1.5 h-4 items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        <MarkdownMessage
                          content={message.content}
                          role={message.role}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t bg-background/50 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto w-full flex flex-col gap-4"
          >
            <input
              ref={mediaInputRef}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
              multiple
              onChange={handleMediaSelected}
            />
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Ask anything about your studies..."
                className="w-full bg-card border rounded-2xl pl-4 pr-24 py-4 min-h-[80px] max-h-[240px] shadow-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="rounded-xl text-muted-foreground"
                  onClick={handlePickMedia}
                  disabled={isLoading}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-primary hover:brightness-105 text-primary-foreground px-4 rounded-xl shadow-lg transition-all h-10"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase">Send</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-4">
                <ModelSelector
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  enabledModels={enabledModels}
                  hideLabel
                  hideDescription
                  className="w-[200px]"
                />
              </div>
              <span className="text-muted-foreground opacity-50 font-medium">
                Press Enter to send • Shift+Enter for new line
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Column 4: Enhanced Features Sidebar */}
      <aside className="w-80 border-l bg-surface/30 hidden xl:flex flex-col overflow-y-auto">
        <div className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
            <Verified className="w-4 h-4 text-primary" />
            Enhanced Features
          </h3>

          <div className="flex flex-col gap-8">
            {[
              {
                icon: <HistoryIcon className="w-5 h-5" />,
                title: "Smart History",
                desc: "Automatically organizes chats by subject and topic relevance.",
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                icon: <Sliders className="w-5 h-5" />,
                title: "Subject Modes",
                desc: "Switch between Explain, Quiz, and Socratic modes instantly.",
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                icon: <School className="w-5 h-5" />,
                title: "Learning Styles",
                desc: "Adapt responses to visual, auditory, or textual preferences.",
                color: "bg-orange-500/10 text-orange-500",
              },
              {
                icon: <Shapes className="w-5 h-5" />,
                title: "Rich Formatting",
                desc: "LaTeX math support, code blocks, and markdown tables.",
                color: "bg-pink-500/10 text-pink-500",
              },
              {
                icon: <Search className="w-5 h-5" />,
                title: "Smart Search",
                desc: "Search within conversations to find past explanations.",
                color: "bg-teal-500/10 text-teal-500",
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 group">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    feature.color
                  )}
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Pro Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type{" "}
                <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border text-[10px]">
                  /diagram
                </span>{" "}
                to ask the AI to generate a Mermaid.js chart for visual
                learning.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
