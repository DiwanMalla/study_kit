import { saveAs } from "file-saver";

/**
 * Generate a conversation title from the first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters and add ellipsis if longer
  const maxLength = 50;
  const cleaned = firstMessage.trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Try to break at a word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Export conversation to markdown format
 */
export function exportConversationAsMarkdown(
  title: string,
  messages: Array<{ role: string; content: string; createdAt: Date }>,
  subject?: string,
  mode?: string
): void {
  let markdown = `# ${title}\n\n`;
  
  if (subject) {
    markdown += `**Subject:** ${subject}\n`;
  }
  
  if (mode) {
    markdown += `**Mode:** ${mode.charAt(0).toUpperCase() + mode.slice(1)}\n`;
  }
  
  markdown += `**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
  
  messages.forEach((message) => {
    const role = message.role === "user" ? "**You**" : "**AI Tutor**";
    const timestamp = new Date(message.createdAt).toLocaleTimeString();
    
    markdown += `### ${role} (${timestamp})\n\n`;
    markdown += `${message.content}\n\n`;
  });
  
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.md`;
  saveAs(blob, filename);
}

/**
 * Export conversation to JSON format
 */
export function exportConversationAsJSON(
  conversation: {
    title: string;
    subject?: string;
    mode?: string;
    messages: Array<{ role: string; content: string; createdAt: Date }>;
  }
): void {
  const json = JSON.stringify(conversation, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const filename = `${conversation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.json`;
  saveAs(blob, filename);
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

/**
 * Subject-specific system prompts
 */
export const SUBJECT_PROMPTS: Record<string, string> = {
  mathematics: `You are an expert mathematics tutor. When explaining concepts:
- Use clear mathematical notation and LaTeX formatting for equations
- Break down complex problems into step-by-step solutions
- Provide visual examples when helpful
- Encourage understanding of underlying principles, not just memorization`,

  science: `You are an expert science tutor. When explaining concepts:
- Use precise scientific terminology
- Explain the "why" behind phenomena
- Relate concepts to real-world applications
- Use diagrams and examples to illustrate abstract ideas`,

  programming: `You are an expert programming tutor. When helping with code:
- Write clean, well-commented code examples
- Explain the logic and reasoning behind solutions
- Highlight best practices and common pitfalls
- Encourage problem-solving skills and debugging techniques`,

  history: `You are an expert history tutor. When teaching:
- Provide historical context and connections
- Explain cause-and-effect relationships
- Use specific dates, names, and events
- Help students understand different perspectives and interpretations`,

  language: `You are an expert language tutor. When teaching:
- Explain grammar rules clearly with examples
- Provide context for vocabulary and usage
- Encourage practice through examples
- Explain cultural nuances when relevant`,

  general: `You are a helpful AI study assistant. You help students with their questions, provide clear explanations, and support their learning journey. Be concise, clear, and encouraging.`,
};

/**
 * Learning mode instructions
 */
export const MODE_INSTRUCTIONS: Record<string, string> = {
  explain: `Focus on clear, thorough explanations. Break down complex topics into understandable parts.`,
  
  practice: `After explaining the concept, generate 2-3 practice problems for the student to work through. Provide hints if they get stuck.`,
  
  quiz: `Create quiz-style questions to test understanding. After the student answers, provide feedback and explanations for both correct and incorrect responses.`,
};
