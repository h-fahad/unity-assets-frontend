"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AssetCard from "@/components/AssetCard";
import AssetFilters from "@/components/AssetFilters";
import { assetService, type Asset } from "@/services/assetService";
import { useUserStore } from "@/store/useUserStore";
import Carousel from "@/components/Carousel";

export default function LandingPageClient() {
  const router = useRouter();
  const { user } = useUserStore();
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
    .filter(asset => !category || asset.category?.name === category)
    .sort((a, b) => {
      if (sort === "Most Downloaded") return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sort === "Latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  // For featured, we'll show the most recent or most downloaded assets
  const featured = assets
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, 3);

  const handleBrowseAssets = () => {
    const assetsSection = document.getElementById('assets-section');
    if (assetsSection) {
      assetsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to bottom of page where assets are
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleStartCreating = () => {
    if (user && user.role === 'ADMIN') {
      router.push('/admin/upload');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Unity Assets
              <span className="block text-yellow-300">Marketplace</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
              Discover premium Unity assets, tools, and resources to accelerate your game development. 
              <span className="hidden sm:inline"> Browse thousands of high-quality assets from talented creators worldwide.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              <button 
                onClick={handleBrowseAssets}
                className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-6 sm:px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Browse Assets
              </button>
              {user && user.role === 'ADMIN' && (
                <button 
                  onClick={handleStartCreating}
                  className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 font-semibold py-3 px-6 sm:px-8 rounded-full transition-all duration-300"
                >
                  Start Creating
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </section>

      {/* Carousel Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel />
        </div>
      </section>

      {/* Featured Assets Section */}
      {featured.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Featured Assets
              </h2>
              <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
              <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto">
                Handpicked premium assets that developers love
              </p>
            </div>
            
            {/* Mobile: Horizontal scroll, Desktop: Grid */}
            <div className="sm:hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {featured.map(asset => (
                  <div key={asset._id || asset.id} className="min-w-[320px] flex-shrink-0 snap-center">
                    <AssetCard asset={asset} isFeatured={true} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featured.map(asset => (
                <div key={asset._id || asset.id}>
                  <AssetCard asset={asset} isFeatured={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Section */}
      <section id="assets-section" className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8 sm:mb-12">
            <AssetFilters
              category={category}
              sort={sort}
              onCategoryChange={setCategory}
              onSortChange={setSort}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="text-gray-600 mt-4 sm:mt-6 font-medium">Loading amazing assets...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 text-lg sm:text-xl font-semibold">{error}</p>
              <p className="text-gray-500 mt-2">Please try refreshing the page</p>
            </div>
          )}

          {/* Assets Grid */}
          {!loading && !error && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filtered.map(asset => (
                  <AssetCard key={asset._id || asset.id} asset={asset} />
                ))}
              </div>
              
              {/* Empty State */}
              {filtered.length === 0 && (
                <div className="text-center py-16 sm:py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No assets found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or browse all available categories
                  </p>
                  <button 
                    onClick={() => {setCategory(""); setSort("Most Downloaded");}} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 