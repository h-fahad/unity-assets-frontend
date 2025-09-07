"use client";

import { useState, useEffect } from 'react';
import { getAssets, type Asset } from '@/services/assetService';
import Image from 'next/image';
import DownloadButton from '@/components/DownloadButton';
import { Badge } from '@/components/ui/badge';
import { notFound, useParams } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const assets = await getAssets();
        const foundAsset = assets.find(a => 
          (a._id && a._id.toString() === id) || 
          (a.id && a.id.toString() === id)
        );
        setAsset(foundAsset || null);
      } catch (error) {
        console.error('Failed to fetch asset:', error);
        setAsset(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchAsset();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) return notFound();

  const description = asset.description || 'No description available for this asset.';
  const shouldShowToggle = description.length > 150;
  const displayDescription = shouldShowToggle && !showFullDescription 
    ? description.substring(0, 150) + '...' 
    : description;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm mb-4 opacity-90">
            <a href="/" className="hover:text-yellow-300 transition-colors">Home</a>
            <span>›</span>
            <a href="/#assets-section" className="hover:text-yellow-300 transition-colors">Assets</a>
            <span>›</span>
            <span className="text-yellow-300">{asset.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{asset.name}</h1>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 text-sm px-3 py-1">
              {asset.category?.name || 'Uncategorized'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column - Image and Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="group relative bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100/50">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image 
                  src={getImageUrl(asset.thumbnail)} 
                  alt={asset.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  priority
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating stats */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span className="text-white text-sm font-medium">{asset.downloadCount || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-sm">{new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 lg:p-8 border border-gray-100/50">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Description
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                  {displayDescription}
                </p>
                {shouldShowToggle && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 group"
                  >
                    <span>{showFullDescription ? 'Show Less' : 'Show More'}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${showFullDescription ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details and Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Download Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-gray-100/50 sticky top-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full px-4 py-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium text-sm">Available Now</span>
                  </div>
                </div>
                
                <div className="h-12">
                  <DownloadButton assetId={asset.id?.toString() || asset._id?.toString() || ''} />
                </div>
                
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                  <button className="group flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors duration-300">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-sm font-medium">Favorite</span>
                  </button>
                  <button className="group flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition-colors duration-300">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Asset Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Asset Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Downloads</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-bold text-gray-900">{asset.downloadCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Category</span>
                  <Badge variant="outline" className="font-semibold">
                    {asset.category?.name || 'Uncategorized'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Added</span>
                  <span className="font-bold text-gray-900">
                    {new Date(asset.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-gray-100/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-300 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-tr from-purple-200/15 to-pink-200/15 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
} 