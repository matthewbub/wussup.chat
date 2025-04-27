"use client";

import { useState } from "react";
import Image from "next/image";

export default function OpenAIImageGenPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a unique URL parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/openai-image-gen?t=${timestamp}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageBlob = await response.blob();
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">OpenAI Image Generation</h1>

      <div className="mb-6">
        <button
          onClick={generateImage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? "Generating..." : "Generate Otter Image"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md max-w-md">
          {error}
        </div>
      )}

      <div className="w-full max-w-md aspect-square relative rounded-lg overflow-hidden border border-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Generated otter image"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {loading ? (
              <div className="animate-pulse text-gray-500">
                Generating image...
              </div>
            ) : (
              <div className="text-gray-400">
                Click generate to create an image
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-gray-600 text-sm max-w-md text-center">
        This page uses OpenAI&apos;s image generation API to create a
        children&apos;s book style drawing of a veterinarian examining a baby
        otter.
      </p>
    </div>
  );
}
