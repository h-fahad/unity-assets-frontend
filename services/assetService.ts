import api from '../lib/axios';

export interface Asset {
  _id: string;
  id?: number; // For backward compatibility
  name: string;
  description: string;
  price?: number;
  fileUrl: string;
  thumbnail: string;
  imageUrl?: string;
  fileSize?: number;
  tags: string[];
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  uploadedById?: number;
  uploadedBy: {
    _id?: string;
    id?: number;
    email?: string;
    name: string;
  };
  category: {
    _id?: string;
    id?: number;
    name: string;
    slug: string;
  };
  _count?: {
    downloads: number;
  };
}

export interface CreateAssetData {
  name: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnail: string;
}

export interface UpdateAssetData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isActive?: boolean;
  tags?: string[];
}

export const assetService = {
  async getAssets(): Promise<Asset[]> {
    const response = await api.get('/assets');
    return response.data.data?.assets || response.data.assets || [];
  },

  async getAllAssets(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ assets: Asset[]; pagination?: { page: number; limit: number; total: number; pages: number } }> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/assets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    // Handle MERN backend response format
    return response.data.data || response.data;
  },

  async getAsset(id: number): Promise<Asset> {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async getAssetById(id: string | number): Promise<Asset> {
    const response = await api.get(`/assets/${id}`);
    return response.data.data?.asset || response.data.asset || response.data;
  },

  async searchAssets(query: string): Promise<Asset[]> {
    const response = await api.get(`/assets/search/${encodeURIComponent(query)}`);
    return response.data.assets || response.data;
  },

  async createAsset(data: CreateAssetData): Promise<Asset> {
    const response = await api.post('/assets', data);
    return response.data;
  },

  async updateAsset(id: string | number, data: UpdateAssetData): Promise<Asset> {
    const response = await api.patch(`/assets/${id}`, data);
    return response.data.data?.asset || response.data.asset || response.data;
  },

  async deleteAsset(id: number | string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async toggleAssetStatus(id: number | string): Promise<Asset> {
    const response = await api.patch(`/assets/${id}/status`);
    return response.data.data?.asset || response.data.asset || response.data;
  },

  async getAssetStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalDownloads: number;
  }> {
    const response = await api.get('/assets/stats');
    return response.data.data || response.data;
  },

  async downloadAsset(id: number | string): Promise<{ downloadUrl: string; asset: Asset; message: string; remainingDownloads?: number; downloadLimit?: number }> {
    const response = await api.post(`/downloads/${id}`);
    return response.data.data || response.data;
  },

  async getFeaturedAssets(): Promise<Asset[]> {
    const response = await api.get('/assets/featured');
    return response.data.data?.assets || response.data.assets || [];
  },

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    const response = await api.get(`/assets/category/${encodeURIComponent(category)}`);
    return response.data.assets || response.data;
  }
};

// Legacy function for backward compatibility
export async function getAssets() {
  return assetService.getAssets();
} 