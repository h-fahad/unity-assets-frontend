/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  Image as ImageIcon,
  FolderOpen,
  ExternalLink
} from "lucide-react";
import { assetService, Asset } from "@/services/assetService";
import { categoryService, Category } from "@/services/categoryService";
import toast from "react-hot-toast";
import DeleteModal from "@/components/DeleteModal";

interface AssetStats {
  total: number;
  active: number;
  inactive: number;
  totalDownloads: number;
}

export default function AdminAssets() {
  const { user } = useUserStore();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>(null);

  // Debounced search state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load user from localStorage on mount
    if (!user) {
      useUserStore.getState().loadUser();
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    loadAssets();
    loadStats();
    loadCategories();
  }, [user, router]);

  // Debounce search query
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  // Reload assets when filters change (including debounced search)
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadAssets(true); // Reset to page 1 when filters change
    }
  }, [debouncedSearchQuery, categoryFilter, statusFilter, sortBy, sortOrder, pageSize]);

  // Reload assets when page changes
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadAssets();
    }
  }, [currentPage]);

  const loadAssets = async (resetPage = false) => {
    try {
      const page = resetPage ? 1 : currentPage;
      if (resetPage) setCurrentPage(1);

      const response = await assetService.getAllAssets({
        page,
        limit: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder
      });

      setAssets(response.assets);
      
      if (response.pagination) {
        setPagination(response.pagination);
        setTotalPages(response.pagination.pages);
        setTotalAssets(response.pagination.total);
      }
    } catch (error) {
      console.error("Failed to load assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await assetService.getAssetStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getActiveCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const openDeleteModal = (asset: Asset) => {
    setDeleteAsset(asset);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteAsset(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAsset) return;

    setIsDeleting(true);
    try {
      await assetService.deleteAsset(deleteAsset._id || parseInt(deleteAsset.id?.toString() || '0'));
      loadAssets();
      loadStats();
      toast.success("Asset deleted successfully!");
      closeDeleteModal();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete asset: ${errorMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAssetStatus = async (asset: Asset) => {
    try {
      await assetService.toggleAssetStatus(asset._id || parseInt(asset.id?.toString() || '0'));
      loadAssets();
      loadStats();
      toast.success(`Asset ${asset.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update asset status: ${errorMsg}`);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You must be logged in as an admin to view this page.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Admin Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets Management</h1>
        <p className="text-gray-600">Manage all Unity assets in your marketplace</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Assets</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Assets</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <EyeOff className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalDownloads}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Action Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search assets by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/admin/upload")}>
              <Plus className="w-4 h-4" />
              Upload Asset
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                placeholder="All Categories"
                className="min-w-[140px]"
                size="sm"
                options={[
                  { value: "all", label: "All Categories" },
                  ...categories.map((category) => ({
                    value: (category._id || category.id).toString(),
                    label: category.name
                  }))
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="All Status"
                className="min-w-[110px]"
                size="sm"
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                placeholder="Date Created"
                className="min-w-[130px]"
                size="sm"
                options={[
                  { value: "createdAt", label: "Date Created" },
                  { value: "name", label: "Name" },
                  { value: "downloadCount", label: "Downloads" },
                  { value: "updatedAt", label: "Last Updated" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Order</label>
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                placeholder="Desc"
                className="min-w-[90px]"
                size="sm"
                options={[
                  { value: "desc", label: "Desc" },
                  { value: "asc", label: "Asc" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Per Page</label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(parseInt(value))}
                placeholder="10"
                className="min-w-[80px]"
                size="sm"
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" }
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              {isSearching && searchQuery.trim() ? (
                "Searching..."
              ) : (
                `${totalAssets || assets.length || 0} assets found`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Assets ({assets.length})
            </div>
            {assets.some(asset => !asset.isActive) && (
              <div className="text-sm font-normal text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {assets.filter(a => a.isActive).length} Active
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {assets.filter(a => !a.isActive).length} Inactive
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold w-2/5">Asset</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Downloads</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset._id || asset.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      !asset.isActive ? "bg-gray-50/50 opacity-75" : ""
                    }`}
                  >
                    <td className="py-4 px-4 w-2/5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {asset.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.thumbnail}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">
                            {asset.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {asset.description}
                          </p>
                          {asset.tags && asset.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {asset.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs px-2 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {asset.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  +{asset.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">
                        {asset.category?.name || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {asset.downloadCount || asset._count?.downloads || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={asset.isActive ? "default" : "secondary"}
                        className={
                          asset.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        }
                      >
                        {asset.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-500">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/assets/${asset._id || asset.id}/edit`)}
                          title="Edit Asset"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={asset.isActive ? "outline" : "default"}
                          onClick={() => handleToggleAssetStatus(asset)}
                          title={asset.isActive ? "Deactivate Asset" : "Activate Asset"}
                          className={
                            asset.isActive 
                              ? "" 
                              : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          }
                        >
                          {asset.isActive ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/assets/${asset._id || asset.id}`, '_blank')}
                          title="View Asset"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteModal(asset)}
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assets found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalAssets || assets.length || 0} total assets)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${deleteAsset?.name}"? This will permanently remove the asset and all associated data. Users will no longer be able to download it.`}
        itemName={deleteAsset?.name}
        isLoading={isDeleting}
        confirmText={isDeleting ? "Deleting..." : "Delete Asset"}
        cancelText="Cancel"
      />
    </main>
  );
}