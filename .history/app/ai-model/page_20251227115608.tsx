"use client";
import React, { useState } from "react";

export default function Page() {
  // Image generation state
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null);
  const [videoPolling, setVideoPolling] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/ai-model", {
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

  // Video generation handlers
  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    setVideoTaskId(null);
    setVideoPolling(false);
    try {
      const res = await fetch("/api/wan-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt,
          size: "1280*720",
          duration: 10,
          prompt_extend: true,
          shot_type: "multi"
        }),
      });
      const data = await res.json();
      if (res.ok && data?.output?.task_id) {
        setVideoTaskId(data.output.task_id);
        setVideoPolling(true);
      } else {
        setVideoError(data?.error || data?.message || "Failed to start video generation.");
      }
    } catch (err: any) {
      setVideoError("Request failed. " + err?.message);
    } finally {
      setVideoLoading(false);
    }
  }

  // Poll for video result
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (videoPolling && videoTaskId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/wan-video?task_id=${videoTaskId}`);
          const data = await res.json();
          if (data?.output?.task_status === "SUCCEEDED" && data?.output?.video_url) {
            setVideoUrl(data.output.video_url);
            setVideoPolling(false);
          } else if (data?.output?.task_status === "FAILED" || data?.output?.task_status === "CANCELED") {
            setVideoError("Video generation failed or was canceled.");
            setVideoPolling(false);
          }
        } catch (err: any) {
          setVideoError("Polling failed. " + err?.message);
          setVideoPolling(false);
        }
      }, 15000); // poll every 15 seconds
    }
    return () => interval && clearInterval(interval);
  }, [videoPolling, videoTaskId]);

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

      <hr className="my-8 w-full max-w-xl border-t-2" />

      <h2 className="text-3xl font-bold mb-4">Wan Text-to-Video Generator</h2>
      <form
        onSubmit={handleVideoSubmit}
        className="w-full max-w-xl flex flex-col gap-4 mb-8"
      >
        <textarea
          className="border rounded p-2 text-base min-h-[100px]"
          placeholder="Enter your video prompt..."
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={videoLoading || !videoPrompt.trim() || videoPolling}
        >
          {videoLoading ? "Starting..." : videoPolling ? "Generating... (this may take a few minutes)" : "Generate Video"}
        </button>
      </form>
      {videoError && <div className="text-red-600 mb-4">{videoError}</div>}
      {videoPolling && (
        <div className="text-blue-600 mb-4">Video is being generated. This may take a few minutes...</div>
      )}
      {videoUrl && (
        <div className="flex flex-col items-center">
          <video controls className="rounded shadow max-w-full max-h-[500px]">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-green-600 underline"
          >
            Open video in new tab
          </a>
        </div>
      )}
    </main>
  );
}
