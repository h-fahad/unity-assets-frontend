import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DownloadButton from "./DownloadButton";
import { cn, getImageUrl } from '@/lib/utils';
import type { Asset } from '@/services/assetService';

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  return (
    <div className={cn(
      'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden',
      'border border-gray-100/50 backdrop-blur-sm hover:-translate-y-1'
    )}>
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image 
          src={getImageUrl(asset.thumbnail)} 
          alt={asset.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant="secondary" 
            className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border-0 shadow-sm"
          >
            {asset.category?.name || 'Unknown'}
          </Badge>
        </div>
        
        {/* Quick action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {asset.name}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed">
            {asset.description}
          </p>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>{asset.downloadCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1 group-hover:border-indigo-200 group-hover:text-indigo-600">
            <a href={`/asset/${asset._id || asset.id}`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </a>
          </Button>
          <div className="flex-1">
            <DownloadButton assetId={(asset._id || asset.id)?.toString() || ''} />
          </div>
        </div>
      </div>
    </div>
  );
} 