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
      'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col gap-3',
      'border border-gray-100'
    )}>
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2">
        <Image src={getImageUrl(asset.thumbnail)} alt={asset.name} fill className="object-cover" />
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-lg flex-1 truncate">{asset.name}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-1">
        <Badge variant="outline">{asset.category.name}</Badge>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{asset.description}</p>
      <div className="flex gap-2 mt-auto">
        <Button asChild variant="outline" size="sm">
          <a href={`/asset/${asset.id}`}>View Details</a>
        </Button>
        <DownloadButton assetId={asset.id.toString()} />
      </div>
    </div>
  );
} 