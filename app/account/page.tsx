"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { userService, type UserProfile } from '@/services/userService';
import { subscriptionService } from '@/services/subscriptionService';
import { authService } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
  User, 
  Calendar, 
  Download, 
  Crown, 
  Shield, 
  Mail, 
  Clock, 
  Package,
  Edit3,
  Save,
  X
} from 'lucide-react';



interface UserStats {
  downloads: number;
  assets: number;
}

export default function AccountPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      console.log('Loading profile for user:', user);
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);
      console.log('User name:', user?.name);
      console.log('User role:', user?.role);
      
      // First try to get the profile from the API
      const profileData = await userService.getProfile();
      console.log('Profile data from API:', profileData);
      console.log('Profile name:', profileData.name);
      console.log('Profile email:', profileData.email);
      console.log('Profile createdAt:', profileData.createdAt);
      
      setProfile(profileData);
      setEditForm({
        name: profileData.name || '',
        email: profileData.email
      });
      
      // Extract stats from profile data
      if (profileData && '_count' in profileData) {
        console.log('Profile _count data:', profileData._count);
        setStats((profileData as { _count: UserStats })._count);
      } else {
        console.log('No _count data in profile, setting default stats');
        setStats({ downloads: 0, assets: 0 });
      }

      // Refresh user store to get updated subscription info
      useUserStore.getState().refreshUser();
    } catch (error) {
      console.error('Failed to load profile from API, using stored data:', error);
      
      // Fallback to stored user data
      const storedUser = authService.getUser();
      console.log('Stored user data:', storedUser);
      console.log('Stored user name:', storedUser?.name);
      console.log('Stored user email:', storedUser?.email);
      console.log('Stored user createdAt:', storedUser?.createdAt);
      
      if (storedUser) {
        setProfile({
          id: storedUser.id,
          name: storedUser.name || '',
          email: storedUser.email,
          role: storedUser.role,
          createdAt: storedUser.createdAt || new Date().toISOString(),
          userSubscriptions: []
        });
        setEditForm({
          name: storedUser.name || '',
          email: storedUser.email
        });
        setStats({ downloads: 0, assets: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      // Use _id (MongoDB) or id (SQL) as fallback
      const userId = user._id || user.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      
      await userService.updateUser(userId, editForm);
      setEditing(false);
      loadProfile();
      // Refresh user store with updated data
      useUserStore.getState().refreshUser();
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update profile: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  type SubscriptionType = NonNullable<UserProfile['userSubscriptions']>[0];

  const getSubscriptionStatus = (subscription: SubscriptionType | undefined) => {
    if (!subscription) return { status: 'NONE', label: 'No Subscription', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    if (endDate > now && subscription.isActive) {
      return { status: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'EXPIRED', label: 'Expired', color: 'bg-red-100 text-red-800' };
    }
  };

  const getTimeRemaining = (subscription: SubscriptionType | undefined) => {
    if (!subscription) return null;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  if (!user) {
    return (
      <main className="max-w-md mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-6">Please sign in to view your account dashboard.</p>
        <Button onClick={() => router.push('/signin')}>Sign In</Button>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading Profile...</h1>
        </div>
      </main>
    );
  }

  const activeSubscription = profile?.userSubscriptions?.find(sub => 
    sub.isActive && new Date(sub.endDate) > new Date()
  );
  const subscriptionStatus = getSubscriptionStatus(activeSubscription);
  const daysRemaining = getTimeRemaining(activeSubscription);

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Account Dashboard</h1>
        <p className="text-gray-600">Manage your profile and view your subscription details</p>
      </div>

      {/* Profile Information */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!profile?.name && !editing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>Complete your profile:</strong> Add your name to personalize your experience.
              </p>
            </div>
          )}
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleUpdateProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{profile?.name || 'No name provided'}</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge variant={profile?.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {profile?.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge className={subscriptionStatus.color}>
                  {subscriptionStatus.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan</p>
                <p className="font-medium">{activeSubscription.plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Daily Downloads</p>
                <p className="font-medium">{activeSubscription.plan.dailyDownloadLimit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={`font-medium ${daysRemaining && daysRemaining <= 7 ? 'text-red-600' : ''}`}>
                    {daysRemaining ? `${daysRemaining} days` : 'Expired'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                <p className="font-medium capitalize">{activeSubscription.plan.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="font-medium">${activeSubscription.plan.basePrice}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">Subscribe to a plan to download assets</p>
              <Button onClick={() => router.push('/packages')}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Your Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.downloads}</p>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.assets}</p>
                  <p className="text-sm text-gray-600">Assets Uploaded</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/packages')}
          className="flex-1"
        >
          <Crown className="w-4 h-4 mr-2" />
          Manage Subscription
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/packages')}
          className="flex-1"
        >
          <Package className="w-4 h-4 mr-2" />
          Browse Assets
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="flex-1"
        >
          Sign Out
        </Button>
      </div>
    </main>
  );
} 