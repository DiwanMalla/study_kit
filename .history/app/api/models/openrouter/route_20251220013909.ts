import { NextResponse } from "next/server";

type OpenRouterModel = {
  id: string;
  name?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
};

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      // We intentionally avoid sending any API key here.
      // This endpoint is public and returns the model catalog.
      headers: {
        Accept: "application/json",
      },
      // Reasonable cache; the catalog doesn’t change minute-to-minute.
      cache: "no-store",
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Failed to fetch OpenRouter models",
          details: details || res.statusText,
        },
        { status: 502 }
      );
    }

    const json = (await res.json()) as { data?: OpenRouterModel[] };
    const models = Array.isArray(json.data) ? json.data : [];

    // We expose only models that are free to use via OpenRouter pricing metadata.
    // OpenRouter uses string values for pricing.
    const freeModels = models
      .filter(
        (m) =>
          m?.id &&
          m?.pricing?.prompt === "0" &&
          m?.pricing?.completion === "0"
      )
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const response = NextResponse.json({ models: freeModels });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=3600"
    );
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch OpenRouter models",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
