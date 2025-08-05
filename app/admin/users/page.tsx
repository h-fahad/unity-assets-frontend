"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  userService,
  type UserWithStats,
  type CreateUserData,
} from "@/services/userService";
import {
  Calendar,
  Download,
  User as UserIcon,
  Plus,
  Search,
  Trash2,
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  withActiveSubscriptions: number;
}

export default function AdminUsers() {
  const { user } = useUserStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

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

    loadUsers();
    loadStats();
  }, [user, router, showInactive]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.users);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    try {
      const response = await userService.searchUsers(searchQuery);
      setUsers(response.users);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userService.createUser(createForm);
      setShowCreateForm(false);
      setCreateForm({ name: "", email: "", password: "", role: "USER" });
      loadUsers();
      loadStats();
      toast.success("User created successfully!");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create user: ${errorMsg}`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      loadUsers();
      loadStats();
      toast.success("User deleted successfully!");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete user: ${errorMsg}`);
    }
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await userService.deactivateUser(userId);
      } else {
        await userService.activateUser(userId);
      }
      loadUsers();
      loadStats();
      toast.success(
        `User ${isActive ? "deactivated" : "activated"} successfully!`
      );
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update user status: ${errorMsg}`);
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    try {
      await userService.changeUserRole(userId, newRole as "USER" | "ADMIN");
      loadUsers();
      loadStats();
      toast.success(`User role changed to ${newRole} successfully!`);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to change user role: ${errorMsg}`);
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
          <h1 className="text-4xl font-bold mb-8">Loading Users...</h1>
        </div>
      </main>
    );
  }

  const filteredUsers = users.filter((user) =>
    showInactive ? true : user.isActive
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Admin Dashboard
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-center">User Management</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </div>
              <div className="text-sm text-gray-600">Inactive Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.admins}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.withActiveSubscriptions}
              </div>
              <div className="text-sm text-gray-600">With Subscriptions</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value as "USER" | "ADMIN",
                    })
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">Create User</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Downloads
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData) => (
                  <tr
                    key={userData.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        {userData.name || "No name"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {userData.email}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          userData.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {userData.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={userData.isActive ? "default" : "destructive"}
                      >
                        {userData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {userData._count.downloads}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleChangeRole(userData.id, userData.role)
                          }
                          title={
                            userData.role === "ADMIN"
                              ? "Make User"
                              : "Make Admin"
                          }
                        >
                          {userData.role === "ADMIN" ? (
                            <ShieldOff className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleUserStatus(
                              userData.id,
                              userData.isActive
                            )
                          }
                          title={userData.isActive ? "Deactivate" : "Activate"}
                        >
                          {userData.isActive ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(userData.id)}
                          title="Delete User"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
