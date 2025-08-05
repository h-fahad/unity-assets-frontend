"use client";

import { useEffect, useState } from "react";
import AssetCard from "@/components/AssetCard";
import AssetFilters from "@/components/AssetFilters";
import { assetService, type Asset } from "@/services/assetService";
import Carousel from "@/components/Carousel";

export default function LandingPageClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("Most Downloaded");

  useEffect(() => {
    async function fetchAssets() {
      try {
        const data = await assetService.getAssets();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setAssets(data);
        } else {
          console.error('Expected array but got:', data);
          setAssets([]);
          setError("Invalid data format received");
        }
      } catch (err: unknown) {
        setError("Failed to load assets");
        console.error(err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  // Filter and sort assets client-side
  const filtered = assets
    .filter(asset => !category || asset.category.name === category)
    .sort((a, b) => {
      if (sort === "Most Downloaded") return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sort === "Latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "Price Low to High") return a.price - b.price;
      if (sort === "Price High to Low") return b.price - a.price;
      return 0;
    });

  // For featured, we'll show the most recent or most downloaded assets
  const featured = assets
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, 3);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">Unity Assets Marketplace</h1>
        <p className="text-lg text-gray-600 mb-6">Browse, preview, and download high-quality Unity assets. Subscribe for unlimited access!</p>
        <Carousel />
      </section>
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Featured Assets</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {featured.map(asset => (
              <div key={asset.id} className="min-w-[320px] max-w-xs flex-shrink-0">
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        </section>
      )}
      <AssetFilters
        category={category}
        sort={sort}
        onCategoryChange={setCategory}
        onSortChange={setSort}
      />
      {loading && (
        <div className="text-center py-8">Loading assets...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-600">{error}</div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No assets found matching your criteria.
            </div>
          )}
        </div>
      )}
    </main>
  );
} 