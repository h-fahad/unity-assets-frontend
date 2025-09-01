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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6 hover:bg-slate-100 transition-colors duration-200"
          >
            ← Back to Admin Dashboard
          </Button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent mb-3">
                  Subscription Packages
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl">
                  Manage your subscription plans and pricing tiers. Create, edit, and monitor your package offerings.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{packages.filter(p => p.isActive).length} Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span>{packages.filter(p => !p.isActive).length} Inactive</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 px-6 py-3"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Package
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {editingPackage ? '✏️ Edit Package' : '🎁 Create New Package'}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Package Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Premium Pro Plan"
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Billing Cycle
                      </label>
                      <select
                        value={formData.billingCycle}
                        onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as BillingCycle }))}
                        className="w-full h-12 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="WEEKLY">⚡ Weekly</option>
                        <option value="MONTHLY">📅 Monthly</option>
                        <option value="YEARLY">🎯 Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      📝 Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this amazing package offers to your customers..."
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Base Price ($)
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="29.99"
                          className="h-12 pl-8 border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                          step="0.01"
                          min="0"
                          required
                        />
                        <DollarSign className="w-4 h-4 text-green-600 absolute left-3 top-4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        🏷️ Yearly Discount (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.yearlyDiscount}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearlyDiscount: parseInt(e.target.value) || 0 }))}
                        placeholder="25"
                        className="h-12 border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Download className="w-4 h-4 text-blue-600" />
                        Daily Download Limit
                      </label>
                      <Input
                        type="number"
                        value={formData.dailyDownloadLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyDownloadLimit: parseInt(e.target.value) || 0 }))}
                        placeholder="50"
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Package Features
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Add an amazing feature..."
                        className="flex-1 h-12 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500/20"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button 
                        type="button" 
                        onClick={addFeature}
                        className="h-12 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3 min-h-[60px] p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {formData.features.length === 0 ? (
                        <span className="text-slate-400 text-sm italic">No features added yet. Start adding some amazing features!</span>
                      ) : (
                        formData.features.map((feature, index) => (
                          <Badge 
                            key={index} 
                            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 border-blue-200 px-3 py-2 text-sm font-medium flex items-center gap-2 hover:shadow-md transition-shadow duration-200"
                          >
                            ✨ {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-200"
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                    <Button 
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {editingPackage ? '💾 Update Package' : '🎁 Create Package'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1 sm:flex-none h-12 px-8 border-slate-300 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Packages List */}
        <div className="space-y-6">
          {packages.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Your Packages
                <span className="text-sm font-normal text-slate-500">({packages.length} total)</span>
              </h2>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`group relative overflow-hidden bg-white border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  !pkg.isActive ? 'opacity-75 grayscale' : ''
                } animate-in slide-in-from-bottom duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-full h-2 ${pkg.isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}></div>
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          pkg.billingCycle === 'WEEKLY' ? 'bg-blue-100 text-blue-600' :
                          pkg.billingCycle === 'MONTHLY' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {pkg.billingCycle === 'WEEKLY' ? '⚡' :
                           pkg.billingCycle === 'MONTHLY' ? '📅' : '🎯'}
                        </div>
                        {pkg.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getBillingCycleColor(pkg.billingCycle)} border-0 font-medium`}>
                          {pkg.billingCycle === 'WEEKLY' ? '⚡ Weekly' :
                           pkg.billingCycle === 'MONTHLY' ? '📅 Monthly' : '🎯 Yearly'}
                        </Badge>
                        <Badge className={`${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} border-0`}>
                          {pkg.isActive ? '✅ Active' : '⏸️ Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(pkg.id)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                        title={pkg.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(pkg)}
                        className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600 transition-colors duration-200"
                        title="Edit Package"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(pkg.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-6">
                  <p className="text-slate-600 leading-relaxed mb-6">{pkg.description}</p>
                  
                  {/* Pricing Section */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">${pkg.basePrice}</span>
                        <span className="text-slate-500">/{pkg.billingCycle.toLowerCase()}</span>
                      </div>
                      {pkg.billingCycle === 'YEARLY' && pkg.yearlyDiscount > 0 && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                          🔥 {pkg.yearlyDiscount}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Download className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{pkg.dailyDownloadLimit}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-purple-600" />
                        </div>
                        <span>{pkg.billingCycle.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Star className="w-3 h-3 text-yellow-600" />
                      </div>
                      Features
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {pkg.features.length === 0 ? (
                        <span className="text-slate-400 text-sm italic">No features added</span>
                      ) : (
                        pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {packages.length === 0 && (
          <Card className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-lg animate-in fade-in-0 duration-500">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center animate-pulse">
                <Package className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">No packages yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                Start building your subscription business by creating your first package. 
                Define pricing, features, and billing cycles to get started.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 px-8 py-3"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Package
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}