import type { NextRequest } from "next/server";

// Step 1: Create a video generation task (returns task_id)
export async function POST(req: NextRequest) {
  const { prompt, audio_url, size = "1280*720", duration = 10, prompt_extend = true, shot_type = "multi" } = await req.json();
  const apiKey = process.env.ALIBABA_MODEL_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not set." }), { status: 500 });
  }

  const response = await fetch(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan2.6-t2v",
        input: {
          prompt,
          ...(audio_url ? { audio_url } : {})
        },
        parameters: {
          size,
          duration,
          prompt_extend,
          shot_type
        }
      })
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}

// Step 2: Poll for the result using task_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const task_id = searchParams.get("task_id");
  const apiKey = process.env.ALIBABA_MODEL_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not set." }), { status: 500 });
  }
  if (!task_id) {
    return new Response(JSON.stringify({ error: "Missing task_id" }), { status: 400 });
  }

  const response = await fetch(
    `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${task_id}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    }
  );
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}
