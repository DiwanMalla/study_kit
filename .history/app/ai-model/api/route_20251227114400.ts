import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.ALIBABA_MODEL_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not set." }), {
      status: 500,
    });
  }

  const response = await fetch(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-image-plus",
        input: {
          messages: [
            {
              role: "user",
              content: [{ text: prompt }],
            },
          ],
        },
        parameters: {
          negative_prompt: "",
          prompt_extend: true,
          watermark: false,
          size: "1328*1328",
        },
      }),
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}
