"use client";

import { useEffect, useState } from "react";
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
  Eye, 
  EyeOff,
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/assets")}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <nav className="text-sm text-gray-600">
              <span>Admin</span>
              <span className="mx-2">›</span>
              <span>Assets</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">Edit</span>
            </nav>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Asset</h1>
                <p className="text-gray-600">Update your asset information and settings</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={asset.isActive ? "default" : "secondary"}
                  className={`text-sm px-3 py-1 ${
                    asset.isActive 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {asset.isActive ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Asset Preview Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <Card className="overflow-hidden shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    Asset Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    {asset.thumbnail ? (
                      <div className="relative group">
                        <img
                          src={asset.thumbnail}
                          alt={asset.name}
                          className="w-full h-48 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No preview available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Asset Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">File Size:</span>
                          <span className="font-medium text-gray-900">
                            {asset.fileSize ? `${(asset.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Downloads:</span>
                          <span className="font-medium text-gray-900">{asset.downloadCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium text-gray-900">
                            {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-gray-900">
                            {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {asset.tags && asset.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Current Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Edit Form */}
          <div className="xl:col-span-3">
            <Card className="overflow-hidden shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Basic Information
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Asset Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter asset name"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Description
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Asset Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide a detailed description of your asset..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                        rows={6}
                        required
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Tags & Keywords
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            value={formData.tagInput}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                            placeholder="Add a tag (e.g., 'fantasy', '2D', 'characters')"
                            onKeyPress={handleKeyPress}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleAddTag} 
                          variant="outline"
                          className="h-12 px-6 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          Add Tag
                        </Button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-3">Click on a tag to remove it:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors duration-200 px-3 py-1"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                {tag} ×
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Visibility Settings
                      </h3>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor="isActive" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                            Active Asset
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            When checked, this asset will be visible to users and available for download
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push("/admin/assets")}
                      className="px-8 py-3 h-12 font-semibold border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
