"use client";
import React, { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/app/ai-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        // Synchronous API response
        const image = data?.output?.choices?.[0]?.message?.content?.[0]?.image;
        setImageUrl(image || null);
      } else {
        setError(data?.error || data?.message || "Failed to generate image.");
      }
    } catch (err: any) {
      setError("Request failed. " + err?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Qwen-Image Generator</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl flex flex-col gap-4 mb-8"
      >
        <textarea
          className="border rounded p-2 text-base min-h-[100px]"
          placeholder="Enter your image prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {imageUrl && (
        <div className="flex flex-col items-center">
          <img
            src={imageUrl}
            alt="Generated"
            className="rounded shadow max-w-full max-h-[500px]"
          />
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-blue-600 underline"
          >
            Open image in new tab
          </a>
        </div>
      )}
    </main>
  );
}
