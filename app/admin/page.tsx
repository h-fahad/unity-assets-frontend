"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAssets } from "@/services/assetService";
import { subscriptionService } from "@/services/subscriptionService";
import { userService } from "@/services/userService";
import { Users, FileStack, Download, CreditCard, Clock, TrendingUp } from "lucide-react";

interface AdminStats {
  totalAssets: number;
  totalDownloads: number;
  totalUsers: number;
  activeSubscriptions: number;
  recentActivity: Array<{
    type: 'download' | 'subscription' | 'user';
    message: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useUserStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalAssets: 0,
    totalDownloads: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin protection is handled by layout, just load stats
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [assets, adminStats, usersResponse] = await Promise.all([
        getAssets(),
        subscriptionService.getAdminStats().catch(() => ({ 
          totalDownloads: 0, 
          active: 0,
          recentActivity: [] 
        })),
        userService.getAllUsers().catch(() => ({ users: [] }))
      ]);

      setStats({
        totalAssets: assets.length,
        totalDownloads: adminStats.totalDownloads || 0,
        totalUsers: usersResponse.users ? usersResponse.users.length : 0,
        activeSubscriptions: adminStats.active || 0,
        recentActivity: adminStats.recentActivity || []
      });
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    } finally {
      setLoading(false);
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

  // Admin protection is handled by layout

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading Dashboard...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12 text-center">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="items-center text-center">
          <CardHeader className="flex flex-col items-center">
            <FileStack className="w-10 h-10 text-blue-600 mb-2" />
            <CardTitle>Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-blue-700 mb-2">{stats.totalAssets}</div>
          </CardContent>
        </Card>
        
        <Card className="items-center text-center">
          <CardHeader className="flex flex-col items-center">
            <Download className="w-10 h-10 text-green-600 mb-2" />
            <CardTitle>Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-green-700 mb-2">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        
        <Card className="items-center text-center">
          <CardHeader className="flex flex-col items-center">
            <Users className="w-10 h-10 text-purple-600 mb-2" />
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-700 mb-2">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="items-center text-center">
          <CardHeader className="flex flex-col items-center">
            <CreditCard className="w-10 h-10 text-orange-600 mb-2" />
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-orange-700 mb-2">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {stats.recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity to display.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => router.push("/admin/upload")}
              >
                Upload New Asset
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/admin/assets")}
              >
                Manage Assets
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/admin/subscriptions")}
              >
                Create Subscription
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/admin/users")}
              >
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/admin/packages")}
              >
                Manage Packages
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/admin/categories")}
              >
                Manage Categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 