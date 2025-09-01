export interface Category {
  id: number;
  _id?: string; // For backward compatibility
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    assets: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description: string;
  slug?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}