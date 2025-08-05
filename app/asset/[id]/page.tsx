import { getAssets } from '@/services/assetService';
import Image from 'next/image';
import DownloadButton from '@/components/DownloadButton';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';

interface AssetDetailPageProps {
  params: { id: string };
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const assets = await getAssets();
  const asset = assets.find(a => a.id === parseInt(params.id));

  if (!asset) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-[300px]">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border mb-4">
            <Image src={getImageUrl(asset.thumbnail)} alt={asset.name} fill className="object-cover" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold flex-1">{asset.name}</h1>
            <Badge variant="secondary">{asset.category.name}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Price: ${asset.price}</span>
            <span>Downloads: {asset.downloadCount}</span>
          </div>
          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {asset.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
          <p className="text-gray-700 text-lg mt-2">{asset.description}</p>
          <div className="mt-6">
            <DownloadButton assetId={asset.id.toString()} />
          </div>
        </div>
      </div>
    </main>
  );
} 