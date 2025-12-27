import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

type SupportedMedia = {
  mime: string;
  contentType: "image_url" | "video_url";
};

const SUPPORTED: Record<string, SupportedMedia> = {
  png: { mime: "image/png", contentType: "image_url" },
  jpg: { mime: "image/jpeg", contentType: "image_url" },
  jpeg: { mime: "image/jpeg", contentType: "image_url" },
  webp: { mime: "image/webp", contentType: "image_url" },
  mp4: { mime: "video/mp4", contentType: "video_url" },
  webm: { mime: "video/webm", contentType: "video_url" },
  mov: { mime: "video/quicktime", contentType: "video_url" },
};

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}

async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not set on the server" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id, userId },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const form = await req.formData();
    const query = String(form.get("query") || "Describe the scene").trim();
    const model = String(
      form.get("model") || process.env.NVIDIA_VISION_MODEL || "nvidia/nemotron-nano-12b-v2-vl"
    ).trim();

    const mediaFiles = form.getAll("media").filter((v): v is File => v instanceof File);

    if (mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "No media files provided" },
        { status: 400 }
      );
    }

    let hasVideo = false;

    const content: any[] = [{ type: "text", text: query }];

    for (const file of mediaFiles) {
      const ext = getExtension(file.name);
      const supported = SUPPORTED[ext];
      if (!supported) {
        return NextResponse.json(
          {
            error: `Unsupported media type: ${file.name}`,
            supportedExtensions: Object.keys(SUPPORTED),
          },
          { status: 400 }
        );
      }

      if (supported.contentType === "video_url") {
        hasVideo = true;
      }

      const base64 = await fileToBase64(file);
      content.push({
        type: supported.contentType,
        [supported.contentType]: {
          url: `data:${supported.mime};base64,${base64}`,
        },
      });
    }

    if (hasVideo && mediaFiles.length !== 1) {
      return NextResponse.json(
        { error: "Only a single video is supported." },
        { status: 400 }
      );
    }

    const systemPrompt = hasVideo ? "/no_think" : "/think";

    const userMessage = await db.conversationMessage.create({
      data: {
        conversationId: id,
        role: "user",
        content: `📎 ${query}`,
      },
    });

    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `NVIDIA error (${res.status})`, details: text },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const assistantText =
      json.choices?.[0]?.message?.content?.trim() || "No response returned.";

    const aiMessage = await db.conversationMessage.create({
      data: {
        conversationId: id,
        role: "assistant",
        content: assistantText,
      },
    });

    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ userMessage, aiMessage });
  } catch (error: any) {
    console.error("[CONVERSATION_MEDIA]", error);
    return NextResponse.json(
      { error: "Internal Error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
