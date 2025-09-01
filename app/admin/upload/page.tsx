"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/category";
import { authService } from "@/lib/auth";
import { api } from "@/lib/axios";
import { 
  Upload, 
  Image, 
  FileText, 
  Tag, 
  FolderOpen, 
  Crown,
  Check,
  AlertTriangle,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUploadPage() {
  const { user } = useUserStore();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tagArray, setTagArray] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getActiveCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !categoryId) {
        setCategoryId(categoriesData[0]._id);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle cover image change with preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTags(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setTagArray(tags);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tagArray.filter(tag => tag !== tagToRemove);
    setTagArray(newTags);
    setTags(newTags.join(', '));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <p>You must be logged in as an admin to view this page.</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cover || !assetFile || !categoryId) {
      toast.error("Please select cover image, asset file, and category");
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading asset...");

    const formData = new FormData();
    formData.append("name", title.trim());
    formData.append("description", description.trim());
    formData.append("categoryId", categoryId);
    formData.append("thumbnail", cover);
    formData.append("assetFile", assetFile);
    
    if (tagArray.length > 0) {
      tagArray.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag.trim());
      });
    }

    try {
      const response = await api.post("/assets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Asset uploaded successfully!", { id: loadingToast });
        // Reset form
        setTitle("");
        setDescription("");
        setCategoryId(categories.length > 0 ? categories[0]._id : null);
        setTags("");
        setTagArray([]);
        setIsPremium(false);
        setCover(null);
        setAssetFile(null);
        setCoverPreview(null);
      } else {
        toast.error(`Upload failed: ${response.statusText}`, { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  }

  if (categoriesLoading) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <p>Loading categories...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (categories.length === 0) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Categories Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="mb-4">You need to create at least one category before uploading assets.</p>
            <Button onClick={() => router.push("/admin/categories")}>
              Create Categories
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all"
          >
            ← Back to Admin Dashboard
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Upload New Asset</h1>
            <p className="text-lg text-gray-600">Share your Unity asset with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Asset Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title for your asset"
                    className="text-lg py-3 border-2 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your asset in detail. What does it include? How can developers use it?"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <Select
                      value={categoryId || ""}
                      onValueChange={setCategoryId}
                      placeholder="Choose a category..."
                      className="pl-12"
                      options={categories.map((cat) => ({
                        value: cat._id || cat.id?.toString() || "",
                        label: cat.name
                      }))}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Don't see the right category?{' '}
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-800 font-medium underline" 
                      onClick={() => router.push("/admin/categories")}
                    >
                      Create one here
                    </button>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Premium Asset
                  </label>
                  <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-yellow-400 transition-colors">
                    <input
                      id="isPremium"
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="isPremium" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <Crown className={`w-4 h-4 ${isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
                      Requires subscription to download
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Tag className="w-6 h-6 text-green-600" />
                Tags & Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <Input
                  value={tags}
                  onChange={handleTagsChange}
                  placeholder="e.g. nature, stylized, trees, environment"
                  className="py-3 border-2 focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">Help users find your asset with relevant tags</p>
                
                {tagArray.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tagArray.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Image className="w-6 h-6 text-purple-600" />
                Files & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                      required
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-purple-50 hover:bg-purple-100"
                    >
                      {coverPreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={coverPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium">Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Image className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-purple-600">Click to upload cover image</p>
                          <p className="text-xs text-purple-500 mt-1">PNG, JPG, or MP4</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {cover && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>{cover.name}</strong> ({formatFileSize(cover.size)})
                    </div>
                  )}
                </div>

                {/* Asset File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unity Package <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".unitypackage"
                      onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="asset-upload"
                      required
                    />
                    <label
                      htmlFor="asset-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        assetFile 
                          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-center">
                        {assetFile ? (
                          <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className={`text-sm font-medium ${assetFile ? 'text-green-600' : 'text-gray-600'}`}>
                          {assetFile ? 'File uploaded!' : 'Click to upload Unity package'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">.unitypackage files only</p>
                      </div>
                    </label>
                  </div>
                  {assetFile && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>{assetFile.name}</strong> ({formatFileSize(assetFile.size)})
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={isUploading}
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading Asset...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Asset
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
