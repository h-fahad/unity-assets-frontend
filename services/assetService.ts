import api from '../lib/axios';

export interface Asset {
  id: number;
  name: string;
  description: string;
  price: number;
  fileUrl: string;
  thumbnail: string;
  tags: string[];
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  uploadedById: number;
  uploadedBy: {
    id: number;
    email: string;
    name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  _count: {
    downloads: number;
  };
}

export interface CreateAssetData {
  name: string;
  description: string;
  category: string;
  price: number;
  fileUrl: string;
  thumbnail: string;
}

export interface UpdateAssetData extends Partial<CreateAssetData> {}

export const assetService = {
  async getAssets(): Promise<Asset[]> {
    const response = await api.get('/assets');
    return response.data.assets;
  },

  async getAsset(id: number): Promise<Asset> {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async searchAssets(query: string): Promise<Asset[]> {
    const response = await api.get(`/assets/search/${encodeURIComponent(query)}`);
    return response.data.assets || response.data;
  },

  async createAsset(data: CreateAssetData): Promise<Asset> {
    const response = await api.post('/assets', data);
    return response.data;
  },

  async updateAsset(id: number, data: UpdateAssetData): Promise<Asset> {
    const response = await api.patch(`/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: number): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async downloadAsset(id: number): Promise<{ downloadUrl: string; asset: Asset; message: string }> {
    const response = await api.post(`/assets/${id}/download`);
    return response.data;
  },

  async getFeaturedAssets(): Promise<Asset[]> {
    const response = await api.get('/assets/featured');
    return response.data.assets || response.data;
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