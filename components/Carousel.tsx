"use client";

import { useState, useEffect } from "react";
import { assetService, type Asset } from "@/services/assetService";
import { getImageUrl } from "@/lib/utils";

export default function Carousel() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedAssets() {
      try {
        // Try to get featured assets first, fallback to recent assets
        let featured;
        try {
          featured = await assetService.getFeaturedAssets();
        } catch {
          // Fallback to getting recent assets if featured endpoint doesn't exist
          const allAssets = await assetService.getAssets();
          featured = allAssets
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
        }
        setAssets(featured);
      } catch (error) {
        console.error("Failed to load featured assets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedAssets();
  }, []);

  const total = assets.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  if (loading) {
    return (
      <div className="relative w-full max-w-2xl mx-auto mb-8">
        <div className="overflow-hidden rounded-xl border bg-gray-100 shadow">
          <div className="w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">Loading featured assets...</span>
          </div>
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="relative w-full max-w-2xl mx-auto mb-8">
        <div className="overflow-hidden rounded-xl border bg-gray-100 shadow">
          <div className="w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">No featured assets available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <img
          src={getImageUrl(assets[current].thumbnail)}
          alt={assets[current].name}
          className="w-full h-64 object-cover object-center"
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <span className="bg-black/70 text-white px-4 py-1 rounded text-lg font-semibold">
            {assets[current].name}
          </span>
        </div>
      </div>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow border"
        onClick={prev}
        aria-label="Previous slide"
      >
        &#8592;
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow border"
        onClick={next}
        aria-label="Next slide"
      >
        &#8594;
      </button>
      <div className="flex justify-center gap-2 mt-2">
        {assets.map((_, idx) => (
          <span
            key={idx}
            className={`inline-block w-2 h-2 rounded-full ${idx === current ? "bg-black" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
} 