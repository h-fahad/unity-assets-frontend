import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DownloadButton from "./DownloadButton";
import { cn, getImageUrl } from '@/lib/utils';
import type { Asset } from '@/services/assetService';

interface AssetCardProps {
  asset: Asset;
  isFeatured?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function AssetCard({ asset, isFeatured = false, variant = 'default' }: AssetCardProps) {
  const cardVariants = {
    default: "w-full",
    compact: "w-full",
    detailed: "w-full max-w-lg"
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden',
      'border border-gray-100/50 backdrop-blur-sm hover:-translate-y-2 hover:scale-[1.02]',
      isFeatured && 'ring-2 ring-gradient-to-r from-indigo-500 to-purple-500',
      cardVariants[variant]
    )}>
      
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-12">
              ⭐ FEATURED
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm opacity-70 animate-pulse"></div>
          </div>
        </div>
      )}

      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image 
          src={getImageUrl(asset.thumbnail)} 
          alt={asset.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          priority={isFeatured}
        />
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant="secondary" 
            className="bg-white/95 backdrop-blur-md text-gray-800 hover:bg-white border-0 shadow-lg font-semibold px-3 py-1.5 text-xs"
          >
            {asset.category?.name || 'Uncategorized'}
          </Badge>
        </div>
        
        {/* Enhanced quick actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <button className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

        {/* Download count overlay */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span className="text-white text-sm font-medium">{asset.downloadCount || 0}</span>
          </div>
        </div>
      </div>
      
      <div className={cn("space-y-4", isCompact ? "p-4" : "p-5")}>
        {/* Title and description */}
        <div className="space-y-2">
          <h3 className={cn(
            "font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1",
            isCompact ? "text-lg" : "text-xl"
          )}>
            {asset.name}
          </h3>
          <p className={cn(
            "text-gray-600 leading-relaxed",
            isCompact ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
          )}>
            {asset.description || 'No description available'}
          </p>
        </div>

        {/* Enhanced stats row */}
        <div className={cn(
          "flex items-center justify-between text-gray-500 bg-gray-50/80 rounded-xl",
          isCompact ? "text-[10px] px-3 py-2" : "text-xs px-4 py-2.5"
        )}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{asset.downloadCount || 0} downloads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className={cn("flex gap-2", isCompact ? "pt-1" : "pt-2")}>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 group-hover:border-indigo-300 group-hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 border-2",
              isCompact && "h-8 text-xs px-2"
            )}
          >
            <a href={`/asset/${asset._id || asset.id}`} className="flex items-center justify-center gap-1.5">
              <svg className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className={cn(isCompact && "hidden sm:inline")}>Preview</span>
            </a>
          </Button>
          <div className="flex-1">
            <DownloadButton assetId={(asset._id || asset.id)?.toString() || ''} compact={isCompact} />
          </div>
        </div>
      </div>

      {/* Decorative background pattern for featured cards */}
      {isFeatured && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
        </div>
      )}
    </div>
  );
} 