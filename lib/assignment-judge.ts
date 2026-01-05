import { Groq } from "groq-sdk";
import { AssignmentModelConfig } from "./assignment-models";
import { qwenChatCompletion } from "./ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface GeneratedResponse {
  model: string;
  content: string;
  score?: number;
}

interface JudgeResult {
  bestResponse: string;
  scores: Array<{ model: string; score: number; reason: string }>;
  winner: string;
}

/**
 * Generate assignment solution using a specific model
 */
async function generateWithModel(
  prompt: string,
  modelConfig: AssignmentModelConfig
): Promise<string> {
  if (modelConfig.provider === "Groq") {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert academic tutor providing detailed, accurate, and well-structured solutions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  } else if (modelConfig.provider === "OpenRouter") {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Super Student Kit",
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic tutor providing detailed, accurate, and well-structured solutions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "";
  } else if (modelConfig.provider === "Alibaba") {
    const completion = await qwenChatCompletion({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert academic tutor providing detailed, accurate, and well-structured solutions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  }

  throw new Error(`Unsupported provider: ${modelConfig.provider}`);
}

/**
 * Judge multiple responses and select the best one
 */
async function judgeResponses(
  responses: GeneratedResponse[],
  originalPrompt: string
): Promise<JudgeResult> {
  const judgePrompt = `You are an expert academic evaluator. Compare the following assignment solutions and select the best one.

Original Assignment Prompt:
${originalPrompt}

Solutions to Evaluate:
${responses
  .map(
    (r, i) => `
Solution ${i + 1} (Model: ${r.model}):
${r.content}
`
  )
  .join("\n---\n")}

Evaluate each solution based on:
1. Accuracy and correctness
2. Clarity and explanation quality
3. Completeness (addresses all parts of the assignment)
4. Structure and organization
5. Academic rigor and depth

Provide your evaluation in the following JSON format:
{
  "evaluations": [
    {
      "model": "model_name",
      "score": 0-100,
      "reason": "brief explanation of the score"
    }
  ],
  "winner": "model_name",
  "best_response_summary": "brief summary of why this response is best"
}`;

  const judgeResponse = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert academic evaluator. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: judgePrompt,
      },
    ],
    model: "qwen-3-32b",
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const judgeContent = judgeResponse.choices[0]?.message?.content || "{}";
  const judgeResult = JSON.parse(judgeContent);

  // Find the best response
  const bestEvaluation = judgeResult.evaluations?.reduce(
    (best: any, current: any) => (current.score > best.score ? current : best)
  );

  const bestResponse = responses.find((r) => r.model === bestEvaluation?.model);

  return {
    bestResponse: bestResponse?.content || responses[0].content,
    scores: judgeResult.evaluations || [],
    winner: judgeResult.winner || responses[0].model,
  };
}

/**
 * Generate assignment solution with optional AI judge
 */
export async function generateAssignmentSolutionWithJudge(
  title: string,
  description: string | null,
  fileContent: string,
  useJudge: boolean = false,
  models?: AssignmentModelConfig[]
): Promise<{ solution: string; judgeResult?: JudgeResult; modelUsed: string }> {
  const prompt = `You are an expert academic tutor. Provide a comprehensive solution for the following assignment.

Assignment Title: ${title}
${description ? `Description: ${description}` : ""}

File Content:
${fileContent.slice(0, 30000)}

Instructions:
- Solve the assignment step-by-step with clear explanations
- Provide detailed reasoning for each step
- If code is required, provide clean, well-commented code
- Include at least 3-5 academic references or sources
- Format the response in Markdown with clear headings:
  - # Solution
  - # Explanation
  - # References
- Make the solution ready to submit (professional, well-formatted)
- If diagrams or images would help, indicate where they should be placed with [DIAGRAM: description]`;

  if (!useJudge || !models || models.length === 1) {
    // Single model generation
    const model = models?.[0] || {
      model: "llama-3.3-70b-versatile",
      provider: "Groq",
      temperature: 0.4,
      maxTokens: 4096,
    };

    const solution = await generateWithModel(prompt, model);

    return {
      solution,
      modelUsed: model.model,
    };
  }

  // Multi-model generation with judge
  const responses: GeneratedResponse[] = [];

  for (const modelConfig of models) {
    try {
      const content = await generateWithModel(prompt, modelConfig);
      responses.push({
        model: modelConfig.model,
        content,
      });
    } catch (error) {
      console.error(`Error generating with ${modelConfig.model}:`, error);
    }
  }

  if (responses.length === 0) {
    throw new Error("Failed to generate any responses");
  }

  if (responses.length === 1) {
    return {
      solution: responses[0].content,
      modelUsed: responses[0].model,
    };
  }

  // Judge the responses
  const judgeResult = await judgeResponses(responses, prompt);

  return {
    solution: judgeResult.bestResponse,
    judgeResult,
    modelUsed: judgeResult.winner,
  };
}
