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
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteModal from "@/components/DeleteModal";

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
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserWithStats | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUser, setStatusUser] = useState<UserWithStats | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<any>(null);

  // Debounced search state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Edit user form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "USER" as "USER" | "ADMIN",
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
  }, [user, router]);

  // Debounce search query
  useEffect(() => {
    // If there's a difference between searchQuery and debouncedSearchQuery, we're searching
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  // Reload users when filters change (including debounced search)
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadUsers(true); // Reset to page 1 when filters change
    }
  }, [debouncedSearchQuery, roleFilter, statusFilter, sortBy, sortOrder, pageSize]);

  // Reload users when page changes
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadUsers();
    }
  }, [currentPage]);

  const loadUsers = async (resetPage = false) => {
    try {
      const page = resetPage ? 1 : currentPage;
      if (resetPage) setCurrentPage(1);

      const response = await userService.getAllUsers({
        page,
        limit: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder
      });

      setUsers(response.users);
      
      if (response.pagination) {
        setPagination(response.pagination);
        setTotalPages(response.pagination.totalPages);
        setTotalUsers(response.pagination.totalUsers);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
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

  const openDeleteModal = (userData: UserWithStats) => {
    setDeleteUser(userData);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setDeleteUser(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    setIsDeleting(true);
    try {
      const userId = deleteUser._id || deleteUser.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      await userService.deleteUser(userId);
      loadUsers();
      loadStats();
      toast.success("User deleted successfully!");
      closeDeleteModal();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to delete user: ${errorMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const openStatusModal = (userData: UserWithStats) => {
    // If user is active, show confirmation modal for deactivation
    // If user is inactive, activate directly
    if (userData.isActive) {
      setStatusUser(userData);
      setShowStatusModal(true);
    } else {
      handleActivateUser(userData);
    }
  };

  const closeStatusModal = () => {
    if (isChangingStatus) return;
    setStatusUser(null);
    setShowStatusModal(false);
  };

  const handleActivateUser = async (userData: UserWithStats) => {
    try {
      const userId = userData._id || userData.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      await userService.activateUser(userId);
      loadUsers();
      loadStats();
      toast.success("User activated successfully!");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to activate user: ${errorMsg}`);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!statusUser) return;

    setIsChangingStatus(true);
    try {
      const userId = statusUser._id || statusUser.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      await userService.deactivateUser(userId);
      loadUsers();
      loadStats();
      toast.success("User deactivated successfully!");
      closeStatusModal();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to deactivate user: ${errorMsg}`);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusUser) return;

    setIsChangingStatus(true);
    try {
      const userId = statusUser._id || statusUser.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      
      if (statusUser.isActive) {
        await userService.deactivateUser(userId);
        toast.success("User deactivated successfully!");
      } else {
        await userService.activateUser(userId);
        toast.success("User activated successfully!");
      }
      loadUsers();
      loadStats();
      setShowStatusModal(false);
      setStatusUser(null);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to ${statusUser.isActive ? 'deactivate' : 'activate'} user: ${errorMsg}`);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleChangeRole = async (userId: string | number, currentRole: string) => {
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

  const handleEditUser = (userData: UserWithStats) => {
    setEditingUser(userData);
    setEditForm({
      name: userData.name || "",
      email: userData.email,
      role: userData.role as "USER" | "ADMIN",
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      const userId = editingUser._id || editingUser.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      await userService.updateUser(userId, editForm);
      
      // Reset form
      setShowEditForm(false);
      setEditingUser(null);
      setEditForm({ name: "", email: "", role: "USER" });
      
      // Reload data
      loadUsers();
      loadStats();
      toast.success("User updated successfully!");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update user: ${errorMsg}`);
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingUser(null);
    setEditForm({ name: "", email: "", role: "USER" });
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

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Action Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search users by name or email..."
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
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4" />
              Create User
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm min-w-[100px]"
              >
                <option value="all">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm min-w-[100px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border rounded px-3 py-2 text-sm min-w-[100px]"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Per Page</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="border rounded px-3 py-2 text-sm min-w-[80px]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              {isSearching && searchQuery.trim() ? (
                "Searching..."
              ) : (
                `${totalUsers} users found`
              )}
            </span>
          </div>
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

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit User: {editingUser.name || editingUser.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleUpdateUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value as "USER" | "ADMIN",
                    })
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">Update User</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Users ({users.length})
            </div>
            {users.some(user => !user.isActive) && (
              <div className="text-sm font-normal text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {users.filter(u => u.isActive).length} Active
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {users.filter(u => !u.isActive).length} Inactive
                </span>
              </div>
            )}
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
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Downloads
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr
                    key={userData._id || userData.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      !userData.isActive ? "bg-gray-50/50 opacity-75" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className={`w-4 h-4 ${userData.isActive ? "text-gray-500" : "text-gray-400"}`} />
                        <span className={userData.isActive ? "" : "text-gray-600"}>
                          {userData.name || "No name"}
                        </span>
                        {!userData.isActive && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
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
                      {userData.role === "ADMIN" ? (
                        <span className="text-sm text-gray-400 italic">Admin</span>
                      ) : userData.subscription ? (
                        <Badge variant="outline" className="text-xs">
                          {userData.subscription.planName}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {userData.role === "ADMIN" ? (
                        <span className="text-sm text-gray-400 italic">-</span>
                      ) : userData.subscription ? (
                        <span className="text-sm text-gray-600">
                          {new Date(userData.subscription.startDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {userData._count?.downloads || 0}
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
                          onClick={() => handleEditUser(userData)}
                          title="Edit User"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const userId = userData._id || userData.id;
                            if (userId) {
                              handleChangeRole(userId, userData.role);
                            }
                          }}
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
                          variant={userData.isActive ? "outline" : "default"}
                          onClick={() => openStatusModal(userData)}
                          title={userData.isActive ? "Deactivate User" : "Activate User"}
                          className={
                            userData.isActive 
                              ? "" 
                              : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          }
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
                          onClick={() => openDeleteModal(userData)}
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

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalUsers} total users)
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
        title="Delete User"
        message={`Are you sure you want to delete the user "${deleteUser?.name || deleteUser?.email}"? This will permanently remove their account and all associated data.`}
        itemName={deleteUser?.name || deleteUser?.email}
        isLoading={isDeleting}
        confirmText={isDeleting ? "Deleting..." : "Delete User"}
        cancelText="Cancel"
      />

      {/* Status Toggle Modal */}
      <DeleteModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setStatusUser(null);
        }}
        onConfirm={handleToggleStatus}
        title={statusUser?.isActive ? "Deactivate User" : "Activate User"}
        message={statusUser?.isActive 
          ? `Are you sure you want to deactivate "${statusUser?.name || statusUser?.email}"? They will lose access to their account and won't be able to log in.`
          : `Are you sure you want to activate "${statusUser?.name || statusUser?.email}"? They will regain full access to their account.`
        }
        isLoading={isChangingStatus}
        confirmText={statusUser?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
      />
    </main>
  );
}
