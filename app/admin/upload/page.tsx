"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/category";
import { authService } from "@/lib/auth";

export default function AdminUploadPage() {
  const { user } = useUserStore();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
        setCategoryId(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setCategoriesLoading(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cover || !assetFile || !categoryId) {
      alert("Please select cover image, asset file, and category");
      return;
    }

    const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description);
    formData.append("categoryId", categoryId.toString());
    formData.append("price", price.toString());
    formData.append("thumbnail", cover);
    formData.append("assetFile", assetFile);

    try {
      const token = authService.getToken();
      const response = await fetch("http://localhost:3001/assets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Asset uploaded successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setCategoryId(categories.length > 0 ? categories[0].id : null);
        setPrice(0);
        setTags("");
        setIsPremium(false);
        setCover(null);
        setAssetFile(null);
      } else {
        const error = await response.text();
        alert(`Upload failed: ${error}`);
      }
    } catch (error) {
      alert(`Upload failed: ${error}`);
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
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Admin Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload New Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium required">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter asset name"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium required">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your asset..."
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium required">Category</label>
              <select
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={categoryId || ''}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                required
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Don't see the category you need? <button type="button" className="text-blue-500 hover:underline" onClick={() => router.push("/admin/categories")}>Create one here</button>
              </p>
            </div>

            <div>
              <label className="block mb-1 font-medium">Price ($)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Set to 0 for free assets</p>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">
                Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. nature, stylized, trees"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="isPremium"
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPremium" className="font-medium">
                Premium Asset (requires subscription)
              </label>
            </div>
            
            <div>
              <label className="block mb-1 font-medium required">Cover Image</label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
                required
                key={cover ? "cover-selected" : "cover-empty"}
              />
              <p className="text-xs text-gray-500 mt-1">Supports images and videos</p>
            </div>
            
            <div>
              <label className="block mb-1 font-medium required">
                Asset File (.unitypackage)
              </label>
              <Input
                type="file"
                accept=".unitypackage"
                onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                required
                key={assetFile ? "asset-selected" : "asset-empty"}
              />
            </div>
            
            <Button type="submit" className="w-full mt-2">
              Upload Asset
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
