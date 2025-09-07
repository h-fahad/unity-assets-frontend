"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { assetService, Asset } from "@/services/assetService";
import { categoryService, Category } from "@/services/categoryService";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Save,
  Image as ImageIcon,
  FileText,
  Tag
} from "lucide-react";

export default function EditAsset() {
  const { user } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    isActive: true,
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadAssetData();
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, assetId]);

  const loadAssetData = async () => {
    try {
      const assetData = await assetService.getAssetById(assetId);
      setAsset(assetData);
      setFormData({
        name: assetData.name || '',
        description: assetData.description || '',
        price: assetData.price || 0,
        categoryId: assetData.categoryId || '',
        isActive: assetData.isActive ?? true,
        tags: assetData.tags || [],
        tagInput: ''
      });
    } catch (error) {
      console.error("Failed to load asset:", error);
      toast.error("Failed to load asset data");
      router.push("/admin/assets");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData.filter(cat => cat.isActive));
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        tags: formData.tags
      };

      await assetService.updateAsset(assetId, updateData);
      toast.success("Asset updated successfully!");
      router.push("/admin/assets");
    } catch (error) {
      console.error("Failed to update asset:", error);
      toast.error("Failed to update asset. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <p>You must be logged in as an admin to view this page.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading Asset...</h1>
        </div>
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Asset Not Found</h1>
          <Button onClick={() => router.push("/admin/assets")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/assets")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assets
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Edit Asset</h1>
        <Badge variant={asset.isActive ? "default" : "secondary"}>
          {asset.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asset Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Asset Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {asset.imageUrl ? (
                <Image
                  src={asset.imageUrl}
                  alt={asset.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  priority={true}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>File Size:</strong> {asset.fileSize ? `${(asset.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                <p><strong>Downloads:</strong> {asset.downloadCount || 0}</p>
                <p><strong>Created:</strong> {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Asset Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter asset name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your asset..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={formData.tagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                      placeholder="Add a tag"
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Asset is active and visible to users
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/admin/assets")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
