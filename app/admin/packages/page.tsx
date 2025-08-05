"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { packageService } from "@/services/packageService";
import { 
  SubscriptionPackage, 
  CreatePackageData, 
  BillingCycle 
} from "@/types/subscription";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Star
} from "lucide-react";
import toast from 'react-hot-toast';

export default function AdminPackages() {
  const { user } = useUserStore();
  const router = useRouter();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState<CreatePackageData>({
    name: '',
    description: '',
    basePrice: 0,
    billingCycle: 'MONTHLY',
    yearlyDiscount: 0,
    dailyDownloadLimit: 10,
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  // Helper function to extract error message from API response
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
      if (response?.data?.message) {
        return response.data.message;
      } else if (response?.data?.error) {
        return response.data.error;
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  };

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

    loadPackages();
  }, [user, router]);

  const loadPackages = async () => {
    try {
      const packagesData = await packageService.getPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      billingCycle: 'MONTHLY',
      yearlyDiscount: 0,
      dailyDownloadLimit: 10,
      features: []
    });
    setFeatureInput('');
    setEditingPackage(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        await packageService.updatePackage(editingPackage.id, formData);
      } else {
        await packageService.createPackage(formData);
      }
      await loadPackages();
      resetForm();
      toast.success(editingPackage ? "Package updated successfully!" : "Package created successfully!");
    } catch (error: unknown) {
      console.error("Failed to save package:", error);
      toast.error(getErrorMessage(error, 'Failed to save package'));
    }
  };

  const handleEdit = (pkg: SubscriptionPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice,
      billingCycle: pkg.billingCycle,
      yearlyDiscount: pkg.yearlyDiscount,
      dailyDownloadLimit: pkg.dailyDownloadLimit,
      features: pkg.features
    });
    setEditingPackage(pkg);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    
    try {
      await packageService.deletePackage(id);
      await loadPackages();
      toast.success("Package deleted successfully!");
    } catch (error: unknown) {
      console.error("Failed to delete package:", error);
      toast.error(getErrorMessage(error, 'Failed to delete package'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await packageService.togglePackageStatus(id);
      await loadPackages();
      toast.success("Package status updated successfully!");
    } catch (error: unknown) {
      console.error("Failed to toggle package status:", error);
      toast.error(getErrorMessage(error, 'Failed to update package status'));
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const getBillingCycleColor = (cycle: BillingCycle) => {
    switch (cycle) {
      case 'WEEKLY': return 'bg-blue-100 text-blue-800';
      case 'MONTHLY': return 'bg-green-100 text-green-800';
      case 'YEARLY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p>Please wait while we verify your authentication.</p>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <p>You must be logged in as an admin to view this page.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading Packages...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Admin Dashboard
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Subscription Packages</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Package Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Basic Plan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as BillingCycle }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this package offers..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Base Price ($)</label>
                  <Input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="9.99"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Yearly Discount (%)</label>
                  <Input
                    type="number"
                    value={formData.yearlyDiscount}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearlyDiscount: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Daily Download Limit</label>
                  <Input
                    type="number"
                    value={formData.dailyDownloadLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyDownloadLimit: parseInt(e.target.value) || 0 }))}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`relative ${!pkg.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {pkg.name}
                  </CardTitle>
                  <Badge className={getBillingCycleColor(pkg.billingCycle)}>
                    {pkg.billingCycle}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStatus(pkg.id)}
                  >
                    {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">${pkg.basePrice}</span>
                  {pkg.billingCycle === 'YEARLY' && pkg.yearlyDiscount > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {pkg.yearlyDiscount}% OFF
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>{pkg.dailyDownloadLimit} downloads/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Billed {pkg.billingCycle.toLowerCase()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Features:
                </h4>
                <ul className="text-sm space-y-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No packages found</h3>
            <p className="text-gray-600 mb-4">Create your first subscription package to get started.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}