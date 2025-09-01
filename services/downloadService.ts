import api from '../lib/axios';
import { Asset } from './assetService';

export interface DownloadRecord {
  _id: string;
  userId: string;
  assetId: string;
  downloadedAt: string;
  ipAddress?: string;
  userAgent?: string;
  assetId: Asset;
}

export interface DownloadStatus {
  canDownload: boolean;
  isAdmin?: boolean;
  hasSubscription?: boolean;
  dailyDownloads?: number;
  downloadLimit?: number;
  remainingDownloads: number | 'unlimited';
  subscription?: {
    planName: string;
    endDate: string;
  };
  resetsAt?: string;
  message: string;
}

export interface DownloadStats {
  totalDownloads: number;
  uniqueUserCount: number;
  uniqueAssetCount: number;
}

export interface TopAsset {
  assetId: string;
  downloadCount: number;
  assetName: string;
  assetThumbnail: string;
}

export const downloadService = {
  async downloadAsset(assetId: string): Promise<{
    downloadUrl: string;
    asset: Asset;
    remainingDownloads?: number;
    downloadLimit?: number;
    message: string;
  }> {
    const response = await api.post(`/downloads/${assetId}`);
    return response.data.data;
  },

  async getDownloadStatus(): Promise<DownloadStatus> {
    const response = await api.get('/downloads/status');
    return response.data.data;
  },

  async getMyDownloads(page: number = 1, limit: number = 20): Promise<{
    downloads: DownloadRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/downloads/my-downloads?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getDownloadStats(params?: {
    startDate?: string;
    endDate?: string;
    assetId?: string;
  }): Promise<{
    stats: DownloadStats;
    topAssets: TopAsset[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.assetId) queryParams.append('assetId', params.assetId);

    const url = `/downloads/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data.data;
  }
};