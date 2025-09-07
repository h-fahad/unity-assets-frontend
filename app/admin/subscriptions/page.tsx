"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionService, type SubscriptionPlan, type AssignSubscriptionData } from "@/services/subscriptionService";
import { userService, type UserWithStats } from "@/services/userService";
import toast from "react-hot-toast";

export default function AdminSubscriptions() {
  const { user } = useUserStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssignSubscriptionData>({
    userId: "",
    planId: "",
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [usersData, plansData] = await Promise.all([
        userService.getAllUsers(),
        subscriptionService.getPlans(),
      ]);
      // Filter out admin users - they don't need subscriptions
      const nonAdminUsers = usersData.users.filter(user => user.role !== "ADMIN");
      setUsers(nonAdminUsers);
      setPlans(plansData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.planId) {
      toast.error("Please select both user and plan");
      return;
    }

    setLoading(true);
    try {
      await subscriptionService.assignPlan(formData);
      toast.success("Subscription assigned successfully!");
      setFormData({
        userId: "",
        planId: "",
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Failed to assign subscription:", error);
      toast.error("Failed to assign subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssignSubscriptionData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <p>You must be logged in as an admin to view this page.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Admin Dashboard
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold mb-12 text-center">Create Subscription</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Assign Subscription to User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select User
              </label>
              <select
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user._id || user.id} value={user._id || user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Plan
              </label>
              <select
                value={formData.planId}
                onChange={(e) => handleInputChange('planId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a plan...</option>
                {plans.map(plan => (
                  <option key={plan._id || plan.id} value={plan._id || plan.id}>
                    {plan.name} - ${plan.basePrice} ({plan.billingCycle}) - {plan.dailyDownloadLimit} downloads/day
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date (optional)
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to start immediately</p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Subscription..." : "Create Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}