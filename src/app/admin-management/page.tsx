"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Users,
  Plus,
  Building2,
  UserCheck,
  Search,
  Edit,
} from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { toast } from "sonner";

// Import queries and mutations
import {
  useUsersQuery,
  useCreateUserMutation,
  useContactsQuery,
  usePlatformRolesQuery,
  useAllPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useRolePermissionsQuery,
  useCreateRoleMutation,
  useUpdatePlatformUserMutation,
  useDeactivatePlatformUserMutation,
  adminApi,
} from "@/features/dashboard/admin-management";
import { useDepartmentsQuery } from "@/features/dashboard/departments/services/queries";
import type { Department } from "@/features/dashboard/departments/type";
import type {
  CreateUserPayload,
  Contact,
  PlatformRole,
  User,
  Permission,
  CreateRolePayload,
} from "@/features/dashboard/admin-management";
import { cn } from "@/lib/utils";

interface CreateUserFormData {
  fullName: string;
  emailAddress: string;
  username: string;
  departmentGuid: string;
  roleGuids: string[];
}

interface CreateRoleFormData {
  roleName: string;
  description: string;
}

// Helper function to format text from snake_case to Title Case
const formatText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function AdminManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isRoleDetailsOpen, setIsRoleDetailsOpen] = useState(false);
  const [selectedRoleForDetails, setSelectedRoleForDetails] =
    useState<PlatformRole | null>(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] =
    useState<PlatformRole | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [createRolePermissions, setCreateRolePermissions] = useState<string[]>(
    [],
  );
  const [isDeactivateUserModalOpen, setIsDeactivateUserModalOpen] =
    useState(false);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] =
    useState<User | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null,
  );
  const [editDepartmentGuid, setEditDepartmentGuid] = useState<string>("");
  const [editRoleNames, setEditRoleNames] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Department search states
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");

  // Debounce department search (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDepartmentSearchTerm(departmentSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [departmentSearch]);

  // Data queries
  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useUsersQuery({
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
  });
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartmentsQuery(
      departmentSearchTerm ? { searchKey: departmentSearchTerm } : undefined,
    );
  const { data: contactsData, isLoading: contactsLoading } = useContactsQuery(
    contactSearchTerm ? { search: contactSearchTerm } : undefined,
  );
  const { data: platformRolesData, isLoading: platformRolesLoading } =
    usePlatformRolesQuery();
  const { data: allPermissionsData, isLoading: allPermissionsLoading } =
    useAllPermissionsQuery();
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } =
    useRolePermissionsQuery({
      roleGuid: selectedRoleForDetails?.guid || "",
    });

  // Mutations
  const createUserMutation = useCreateUserMutation();
  const updateRolePermissionsMutation = useUpdateRolePermissionsMutation();
  const createRoleMutation = useCreateRoleMutation();
  const updatePlatformUserMutation = useUpdatePlatformUserMutation();
  const deactivatePlatformUserMutation = useDeactivatePlatformUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>();

  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    reset: resetRole,
    formState: { errors: roleErrors, isSubmitting: isSubmittingRole },
  } = useForm<CreateRoleFormData>();

  const handleBack = () => {
    router.push("/dashboard");
  };

  const openCreateModal = () => {
    reset();
    setSelectedContact(null);
    setSelectedRoles([]);
    setContactSearchTerm("");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedContact(null);
    setSelectedRoles([]);
    setContactSearchTerm("");
    reset();
  };

  const onSubmitCreateUser = async (data: CreateUserFormData) => {
    try {
      if (!selectedContact) {
        toast.error("Please select a contact");
        return;
      }

      const payload: CreateUserPayload = {
        fullName: selectedContact.name,
        emailAddress: selectedContact.email,
        username: selectedContact.username,
        departmentGuid: data.departmentGuid,
        roleGuids: selectedRoles,
      };

      const response = await createUserMutation.mutateAsync(payload);
      if (response.responseCode === "00") {
        toast.success("User created successfully!");
        closeCreateModal();
      } else if (response.responseCode === "02") {
        toast.error("User already exists. Please try again.");
      } else {
        toast.error("Failed to create user. Please try again.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again.");
    }
  };

  const users = usersData?.responseData?.records || [];
  const usersMeta = usersData?.responseData?.meta;
  const departments = departmentsData?.responseData?.records || [];
  const contacts = contactsData?.responseData?.records || [];
  const platformRoles = platformRolesData?.responseData || [];
  const allPermissions = allPermissionsData?.responseData || [];

  // Transform departments to SearchableSelectOption format
  const departmentOptions: SearchableSelectOption[] = departments.map(
    (dept: Department) => ({
      value: dept.guid,
      label: dept.departmentName,
      description: dept.description || undefined,
    }),
  );

  // Prepare contact options for searchable select
  const contactOptions: SearchableSelectOption[] = contacts.map(
    (contact: Contact) => ({
      value: contact.email,
      label: contact.name,
      description: `${contact.email} • ${contact.username}`,
    }),
  );

  const handleContactSearch = (search: string) => {
    setContactSearchTerm(search);
  };

  const handleRoleToggle = (roleGuid: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleGuid)
        ? prev.filter((id) => id !== roleGuid)
        : [...prev, roleGuid],
    );
  };

  const handleViewRoleDetails = (role: PlatformRole) => {
    setSelectedRoleForDetails(role);
    setIsRoleDetailsOpen(true);
  };

  const handleEditRole = async (
    role: PlatformRole,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setSelectedRoleForEdit(role);
    setIsEditRoleModalOpen(true);

    // Fetch the role's current permissions dynamically
    try {
      const roleData = await adminApi.getRolePermissions({
        roleGuid: role.guid,
      });
      const currentPermissions =
        roleData.responseData?.permissions?.map((p) => p.name) || [];
      setEditingPermissions(currentPermissions);
    } catch (error) {
      console.error("Error fetching role permissions for edit:", error);
      // Fallback to empty permissions
      setEditingPermissions([]);
      toast.error("Failed to load current permissions. Please try again.");
    }
  };

  const openEditUserModal = (userRow: User) => {
    setSelectedUserForEdit(userRow);
    setIsEditUserModalOpen(true);
    setEditDepartmentGuid("");
    setEditRoleNames([]);
  };

  const closeEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUserForEdit(null);
    setEditDepartmentGuid("");
    setEditRoleNames([]);
  };

  const handleToggleEditRoleName = (roleGuid: string) => {
    setEditRoleNames((prev) =>
      prev.includes(roleGuid)
        ? prev.filter((r) => r !== roleGuid)
        : [...prev, roleGuid],
    );
  };

  const handleSubmitEditUser = async () => {
    if (!selectedUserForEdit) return;
    if (!editDepartmentGuid) {
      toast.error("Please select a department");
      return;
    }
    try {
      await updatePlatformUserMutation.mutateAsync({
        emailAddress: selectedUserForEdit.email,
        departmentGuid: editDepartmentGuid,
        roles: editRoleNames,
      });
      toast.success("User updated successfully");
      closeEditUserModal();
    } catch (e) {
      console.error("Failed to update user", e);
      toast.error("Failed to update user");
    }
  };

  const openDeactivateUserModal = (userRow: User) => {
    setSelectedUserForDeactivate(userRow);
    setIsDeactivateUserModalOpen(true);
  };

  const closeDeactivateUserModal = () => {
    setIsDeactivateUserModalOpen(false);
    setSelectedUserForDeactivate(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedUserForDeactivate) return;
    try {
      await deactivatePlatformUserMutation.mutateAsync({
        emailAddress: selectedUserForDeactivate.email,
      });
      toast.success("User deactivated successfully");
      closeDeactivateUserModal();
    } catch (e) {
      console.error("Failed to deactivate user", e);
      toast.error("Failed to deactivate user");
    }
  };

  const closeEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setSelectedRoleForEdit(null);
    setEditingPermissions([]);
  };

  const handlePermissionToggle = (permissionName: string) => {
    setEditingPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName],
    );
  };

  const handleUpdateRolePermissions = async () => {
    if (!selectedRoleForEdit) return;

    try {
      await updateRolePermissionsMutation.mutateAsync({
        roleGuid: selectedRoleForEdit.guid,
        permissionEnums: editingPermissions,
      });
      toast.success(
        `Successfully updated permissions for ${formatText(
          selectedRoleForEdit.name,
        )}`,
      );
      closeEditRoleModal();
    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error("Failed to update role permissions. Please try again.");
    }
  };

  const openCreateRoleModal = () => {
    resetRole();
    setCreateRolePermissions([]);
    setIsCreateRoleModalOpen(true);
  };

  const closeCreateRoleModal = () => {
    setIsCreateRoleModalOpen(false);
    setCreateRolePermissions([]);
    resetRole();
  };

  const handleCreateRolePermissionToggle = (permissionName: string) => {
    setCreateRolePermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName],
    );
  };

  const onSubmitCreateRole = async (data: CreateRoleFormData) => {
    try {
      const payload: CreateRolePayload = {
        roleName: data.roleName,
        description: data.description,
        permissionEnums: createRolePermissions,
      };

      const response = await createRoleMutation.mutateAsync(payload);
      if (response.responseCode === "00") {
        toast.success("Role created successfully!");
        closeCreateRoleModal();
      } else if (response.responseCode === "02") {
        toast.error("Role already exists. Please try again.");
      } else {
        toast.error("Failed to create role. Please try again.");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role. Please try again.");
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-100/50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200/50 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div className="bg-blue-100 rounded-xl p-3">
                  <Logo
                    variant="orange"
                    size="md"
                    showText={true}
                    textClassName="hidden sm:flex flex-col"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 text-gray-500">
                <div className="font-semibold text-xs">
                  <p>{user?.fullName}</p>
                  <p>{user?.emailAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  User Management
                </h1>
                <p className="text-gray-600">
                  Manage system users and their access permissions
                </p>
              </div>
            </div>
          </div>

          {/* Roles & Permissions */}
          <Card className="mb-8 bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    Roles & Permissions
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-2">
                    Manage user roles and access permissions across the platform
                  </p>
                </div>
                <Button
                  onClick={openCreateRoleModal}
                  className="flex text-white items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Role</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {platformRolesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded-md mb-4 w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded-md mb-4 w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded-md w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {platformRoles.map((role: PlatformRole) => (
                    <div
                      key={role.guid}
                      className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          {formatText(role.name)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditRole(role, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-4xl font-bold  mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {role.users}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRoleDetails(role)}
                        className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-600 border-blue-200 hover:border-blue-600 transition-all duration-200 font-medium"
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-gradient-to-br from-white to-blue-50/20 border-blue-100 shadow-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    System Users
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Manage and monitor all registered users in the system
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200 w-64"
                  />
                </div>

                <Button
                  onClick={openCreateModal}
                  className="flex text-white items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New User</span>
                </Button>
              </div>
              {/* moved pagination to footer */}
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">
                      Loading users...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                        <TableHead className="font-semibold text-gray-700 py-4 px-6">
                          Username
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 py-4 px-6">
                          Full Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 py-4 px-6">
                          Email Address
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 py-4 px-6">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-16 bg-gray-50/50"
                          >
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-gray-600 font-medium text-lg">
                                  No users found
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                  {searchTerm
                                    ? "Try adjusting your search criteria"
                                    : "No users have been registered yet"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: User, index: number) => (
                          <TableRow
                            key={user.username || index}
                            className="hover:bg-blue-50/30 transition-colors duration-150 border-b border-gray-100/50"
                          >
                            <TableCell className="font-semibold text-gray-900 py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {user.username?.charAt(0).toUpperCase() ||
                                    "U"}
                                </div>
                                <span>{user.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700 py-4 px-6 font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-gray-600 py-4 px-6">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-gray-600 py-4 px-6">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  user.status === "ACTIVE"
                                    ? "text-green-600"
                                    : "text-red-600",
                                )}
                              >
                                {user.status}
                              </p>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {user.status === "ACTIVE" && (
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-600 hover:bg-blue-600 border-blue-200 hover:border-blue-600 transition-all duration-200 font-medium px-4"
                                    onClick={() => openEditUserModal(user)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-600 hover:bg-red-600 border-red-200 hover:border-red-600 transition-all duration-200 font-medium px-4"
                                    onClick={() =>
                                      openDeactivateUserModal(user)
                                    }
                                  >
                                    Deactivate
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-4 py-3 border-top border-gray-100 bg-white/70">
                    <div className="text-sm text-gray-600">
                      {usersFetching && (
                        <span className="mr-2">Refreshing…</span>
                      )}
                      {(() => {
                        const total = usersMeta?.totalCount || 0;
                        const current = usersMeta?.pageNumber || pageNumber;
                        const size = usersMeta?.pageSize || pageSize;
                        const start =
                          total === 0 ? 0 : (current - 1) * size + 1;
                        const end = Math.min(current * size, total);
                        const pages = usersMeta?.numberOfPages || 1;
                        return (
                          <span>
                            Showing {start}-{end} of {total} • Page {current} of{" "}
                            {pages}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows</span>
                        <Select
                          value={String(pageSize)}
                          onValueChange={(val) => {
                            const next = parseInt(val, 10);
                            setPageSize(next);
                            setPageNumber(1);
                          }}
                        >
                          <SelectTrigger className="w-[88px] h-9">
                            <SelectValue placeholder="Rows" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            usersMeta ? usersMeta.pageNumber <= 1 : true
                          }
                          onClick={() => setPageNumber(1)}
                        >
                          «
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            usersMeta ? usersMeta.pageNumber <= 1 : true
                          }
                          onClick={() =>
                            setPageNumber((p) => Math.max(1, p - 1))
                          }
                        >
                          ‹
                        </Button>
                        {(() => {
                          const current = usersMeta?.pageNumber || pageNumber;
                          const totalPages = usersMeta?.numberOfPages || 1;
                          const start = Math.max(1, current - 2);
                          const end = Math.min(totalPages, current + 2);
                          const items: number[] = [];
                          for (let i = start; i <= end; i++) items.push(i);
                          return (
                            <>
                              {start > 1 && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageNumber(1)}
                                  >
                                    1
                                  </Button>
                                  {start > 2 && (
                                    <span className="px-1 text-gray-400">
                                      …
                                    </span>
                                  )}
                                </>
                              )}
                              {items.map((n) => (
                                <Button
                                  key={n}
                                  variant={
                                    n === current ? "default" : "outline"
                                  }
                                  size="sm"
                                  className={
                                    n === current
                                      ? "bg-blue-600 text-white"
                                      : ""
                                  }
                                  onClick={() => setPageNumber(n)}
                                >
                                  {n}
                                </Button>
                              ))}
                              {end < totalPages && (
                                <>
                                  {end < totalPages - 1 && (
                                    <span className="px-1 text-gray-400">
                                      …
                                    </span>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageNumber(totalPages)}
                                  >
                                    {totalPages}
                                  </Button>
                                </>
                              )}
                            </>
                          );
                        })()}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            usersMeta
                              ? usersMeta.pageNumber >=
                                (usersMeta.numberOfPages || 1)
                              : true
                          }
                          onClick={() =>
                            setPageNumber((p) =>
                              usersMeta
                                ? Math.min(
                                    usersMeta.numberOfPages || p + 1,
                                    p + 1,
                                  )
                                : p + 1,
                            )
                          }
                        >
                          ›
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            usersMeta
                              ? usersMeta.pageNumber >=
                                (usersMeta.numberOfPages || 1)
                              : true
                          }
                          onClick={() =>
                            usersMeta && setPageNumber(usersMeta.numberOfPages)
                          }
                        >
                          »
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                Create New Admin User
              </DialogTitle>
              <div className="text-gray-600 mt-2">
                Select a contact and assign roles to create a new admin user
              </div>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmitCreateUser)}
              className="space-y-6 mt-6"
            >
              {/* Contact Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Select Contact
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
                    Organization Contact
                  </label>
                  <SearchableSelect
                    options={contactOptions}
                    value={selectedContact?.email || ""}
                    onValueChange={(value) => {
                      const contact = contacts.find(
                        (c: Contact) => c.email === value,
                      );
                      setSelectedContact(contact || null);
                    }}
                    onSearchChange={handleContactSearch}
                    placeholder="Search and select a contact..."
                    emptyMessage="No contacts found. Try adjusting your search."
                    loading={contactsLoading}
                    clearable={true}
                  />
                </div>

                {selectedContact && (
                  <div className="bg-white/70 p-4 rounded-lg mt-4 border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-3 w-3 text-blue-600" />
                      </div>
                      Selected Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900 font-medium">
                          {selectedContact.name}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Email:
                        </span>
                        <p className="text-gray-900 font-medium">
                          {selectedContact.email}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Username:
                        </span>
                        <p className="text-gray-900 font-medium">
                          {selectedContact.username}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Department Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                    <Building2 className="h-3 w-3 text-orange-600" />
                  </div>
                  Department Assignment
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
                    Select Department
                  </label>
                  <SearchableSelect
                    options={departmentOptions}
                    value={watch("departmentGuid")}
                    onValueChange={(value) => setValue("departmentGuid", value)}
                    onSearchChange={setDepartmentSearch}
                    placeholder="Search and select department..."
                    emptyMessage="No departments found. Try a different search."
                    loading={departmentsLoading}
                    clearable
                  />
                  <input
                    {...register("departmentGuid", {
                      required: "Department is required",
                    })}
                    type="hidden"
                  />
                  {errors.departmentGuid && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <svg
                        className="w-3 h-3 mr-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.departmentGuid.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Platform Roles Selection */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-purple-600" />
                    </div>
                    Platform Roles & Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedRoles.length} roles selected • Select roles to
                    assign to this user
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {platformRoles.map((role: PlatformRole) => (
                      <div
                        key={role.guid}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={role.guid}
                            checked={selectedRoles.includes(role.guid)}
                            onCheckedChange={() => handleRoleToggle(role.guid)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={role.guid}
                              className="text-sm font-semibold text-gray-900 cursor-pointer block"
                            >
                              {formatText(role.name)}
                            </label>
                            {role.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {role.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {role.users} users currently assigned
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedRoles.length > 0 && (
                  <div className="p-4 bg-blue-50 border-t border-blue-100">
                    <p className="text-sm font-semibold text-blue-900">
                      {selectedRoles.length} role
                      {selectedRoles.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      User will be granted permissions from all selected roles
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm">
                  {!selectedContact ? (
                    <span className="text-amber-600 font-medium">
                      ⚠ Please select a contact
                    </span>
                  ) : selectedRoles.length === 0 ? (
                    <span className="text-amber-600 font-medium">
                      ⚠ Please select at least one role
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ✓ Contact selected • {selectedRoles.length} role
                      {selectedRoles.length > 1 ? "s" : ""} assigned
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreateModal}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      createUserMutation.isPending ||
                      !selectedContact ||
                      selectedRoles.length === 0
                    }
                    className="px-6 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting || createUserMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Admin User"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deactivate User Modal */}
        <Dialog
          open={isDeactivateUserModalOpen}
          onOpenChange={setIsDeactivateUserModalOpen}
        >
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-red-600" />
                </div>
                Deactivate User
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to deactivate this user?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
                <div className="text-gray-600">Email</div>
                <div className="font-medium text-gray-900">
                  {selectedUserForDeactivate?.email}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closeDeactivateUserModal}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmDeactivate}
                disabled={deactivatePlatformUserMutation.isPending}
              >
                {deactivatePlatformUserMutation.isPending
                  ? "Deactivating..."
                  : "Deactivate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog
          open={isEditUserModalOpen}
          onOpenChange={setIsEditUserModalOpen}
        >
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  <Edit className="h-5 w-5" />
                </div>
                Update Platform User
              </DialogTitle>
              <div className="text-gray-600 mt-2">
                Modify department and roles for this user
              </div>
            </DialogHeader>

            {selectedUserForEdit && (
              <div className="space-y-6 mt-4">
                {/* Email (readonly) */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={selectedUserForEdit.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Department Selection */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-orange-600" />
                    </div>
                    Department
                  </h3>
                  <div className="space-y-2">
                    <SearchableSelect
                      options={departmentOptions}
                      value={editDepartmentGuid}
                      onValueChange={setEditDepartmentGuid}
                      onSearchChange={setDepartmentSearch}
                      placeholder="Search and select department..."
                      emptyMessage="No departments found. Try a different search."
                      loading={departmentsLoading}
                      clearable
                    />
                  </div>
                </div>

                {/* Roles Selection */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                        <UserCheck className="h-3 w-3 text-purple-600" />
                      </div>
                      Assign Roles
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editRoleNames.length} roles selected
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {platformRoles.map((role: PlatformRole) => (
                        <div
                          key={role.guid}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`edit-role-${role.guid}`}
                              checked={editRoleNames.includes(role.guid)}
                              onCheckedChange={() =>
                                handleToggleEditRoleName(role.guid)
                              }
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`edit-role-${role.guid}`}
                                className="text-sm font-semibold text-gray-900 cursor-pointer block"
                              >
                                {formatText(role.name)}
                              </label>
                              {role.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {role.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {selectedUserForEdit.email}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeEditUserModal}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitEditUser}
                      disabled={
                        updatePlatformUserMutation.isPending ||
                        !editDepartmentGuid
                      }
                      className="px-6 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {updatePlatformUserMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        "Update User"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Role Details Sheet */}
        <Sheet open={isRoleDetailsOpen} onOpenChange={setIsRoleDetailsOpen}>
          <SheetContent className="w-[500px] sm:w-[600px] bg-white max-h-[100vh] overflow-y-auto">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  {selectedRoleForDetails?.name?.charAt(0).toUpperCase() || "R"}
                </div>
                {selectedRoleForDetails
                  ? formatText(selectedRoleForDetails.name)
                  : "Role Details"}
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                View detailed information about this role and its permissions
              </SheetDescription>
            </SheetHeader>

            {selectedRoleForDetails && (
              <div className="flex-1 space-y-6 px-4">
                {rolePermissionsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading role details...
                      </span>
                    </div>
                  </div>
                ) : rolePermissionsData?.responseData ? (
                  <>
                    {/* Role Overview */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Role Overview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Role Name:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatText(rolePermissionsData.responseData.name)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Users Assigned:
                          </span>
                          <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {rolePermissionsData.responseData.users}
                          </span>
                        </div>
                        {rolePermissionsData.responseData.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-600 block mb-1">
                              Description
                            </span>
                            <p className="text-sm text-gray-700 bg-white/70 p-3 rounded-md border border-gray-300">
                              {rolePermissionsData.responseData.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permissions List */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                            <UserCheck className="h-3 w-3 text-green-600" />
                          </div>
                          Permissions
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {rolePermissionsData.responseData.permissions
                            ?.length || 0}{" "}
                          permissions assigned to this role
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {rolePermissionsData.responseData.permissions &&
                        rolePermissionsData.responseData.permissions.length >
                          0 ? (
                          <div className="divide-y divide-gray-100">
                            {rolePermissionsData.responseData.permissions.map(
                              (permission: Permission, index: number) => (
                                <div
                                  key={permission.guid || index}
                                  className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 text-sm">
                                        {formatText(permission.name)}
                                      </h4>
                                      {permission.description && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {permission.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 mt-2">
                                        {permission.requireChecker && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                            Requires Checker
                                          </span>
                                        )}
                                        {permission.noOfCheckerRequired > 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {permission.noOfCheckerRequired}{" "}
                                            Checker
                                            {permission.noOfCheckerRequired > 1
                                              ? "s"
                                              : ""}{" "}
                                            Required
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <UserCheck className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">
                              No permissions assigned
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              This role doesn&apos;t have any specific
                              permissions configured
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserCheck className="h-6 w-6 text-red-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      Failed to load role details
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Please try again later
                    </p>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit Role Permissions Modal */}
        <Dialog
          open={isEditRoleModalOpen}
          onOpenChange={setIsEditRoleModalOpen}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  <Edit className="h-5 w-5" />
                </div>
                Edit Role Permissions
              </DialogTitle>
              {selectedRoleForEdit && (
                <div className="text-gray-600 mt-2">
                  Managing permissions for{" "}
                  <span className="font-semibold text-gray-800">
                    {formatText(selectedRoleForEdit.name)}
                  </span>{" "}
                  role
                </div>
              )}
            </DialogHeader>

            {selectedRoleForEdit && (
              <div className="space-y-6 mt-6">
                {/* Role Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {formatText(selectedRoleForEdit.name)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedRoleForEdit.description ||
                          "No description available"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRoleForEdit.users}
                      </div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                  </div>
                </div>

                {/* Permissions Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        Available Permissions
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Click to add permissions to this role
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {allPermissionsLoading ? (
                        <div className="p-8 text-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-gray-600">
                            Loading permissions...
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {allPermissions
                            .filter(
                              (permission) =>
                                !editingPermissions.includes(permission.name),
                            )
                            .map((permission: Permission) => (
                              <div
                                key={permission.guid}
                                onClick={() =>
                                  handlePermissionToggle(permission.name)
                                }
                                className="p-4 hover:bg-green-50 cursor-pointer transition-colors group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                      {formatText(permission.name)}
                                    </h4>
                                    {permission.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {permission.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      {permission.requireChecker && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                          Requires Checker
                                        </span>
                                      )}
                                      {permission.noOfCheckerRequired > 0 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                          {permission.noOfCheckerRequired}{" "}
                                          Checker
                                          {permission.noOfCheckerRequired > 1
                                            ? "s"
                                            : ""}{" "}
                                          Required
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Plus className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          {allPermissions.filter(
                            (p) => !editingPermissions.includes(p.name),
                          ).length === 0 && (
                            <div className="p-8 text-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserCheck className="h-6 w-6 text-gray-400" />
                              </div>
                              <p className="text-gray-600 font-medium">
                                All permissions assigned
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                This role has all available permissions
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200 bg-blue-50">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                          <UserCheck className="h-3 w-3 text-blue-600" />
                        </div>
                        Current Permissions
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {editingPermissions.length} permissions assigned • Click
                        to remove
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {editingPermissions.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">
                            No permissions assigned
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Add permissions from the available list
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {editingPermissions.map((permissionName: string) => {
                            const permission = allPermissions.find(
                              (p) => p.name === permissionName,
                            );
                            return (
                              <div
                                key={permissionName}
                                onClick={() =>
                                  handlePermissionToggle(permissionName)
                                }
                                className="p-4 hover:bg-red-50 cursor-pointer transition-colors group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                                      {formatText(permissionName)}
                                    </h4>
                                    {permission?.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {permission.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      {permission?.requireChecker && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                          Requires Checker
                                        </span>
                                      )}
                                      {permission &&
                                        permission.noOfCheckerRequired > 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {permission.noOfCheckerRequired}{" "}
                                            Checker
                                            {permission.noOfCheckerRequired > 1
                                              ? "s"
                                              : ""}{" "}
                                            Required
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                  <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ×
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {editingPermissions.length} of {allPermissions.length}{" "}
                    permissions selected
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeEditRoleModal}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateRolePermissions}
                      disabled={updateRolePermissionsMutation.isPending}
                      className="px-6 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {updateRolePermissionsMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        "Update Permissions"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Role Modal */}
        <Dialog
          open={isCreateRoleModalOpen}
          onOpenChange={setIsCreateRoleModalOpen}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  <Plus className="h-5 w-5" />
                </div>
                Create New Role
              </DialogTitle>
              <div className="text-gray-600 mt-2">
                Create a new role and assign permissions to control user access
              </div>
            </DialogHeader>

            <form
              onSubmit={handleSubmitRole(onSubmitCreateRole)}
              className="space-y-6 mt-6"
            >
              {/* Role Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Role Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
                      Role Name
                    </label>
                    <input
                      {...registerRole("roleName", {
                        required: "Role name is required",
                        minLength: {
                          value: 2,
                          message: "Role name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      placeholder="Enter role name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {roleErrors.roleName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <svg
                          className="w-3 h-3 mr-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {roleErrors.roleName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      {...registerRole("description")}
                      type="text"
                      placeholder="Enter role description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Selection */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-green-600" />
                    </div>
                    Assign Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {createRolePermissions.length} permissions selected • Click
                    to add/remove permissions
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {allPermissionsLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600">Loading permissions...</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {allPermissions.map((permission: Permission) => (
                        <div
                          key={permission.guid}
                          className={`p-4 transition-colors group ${
                            createRolePermissions.includes(permission.name)
                              ? "bg-green-50 hover:bg-green-100"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={createRolePermissions.includes(
                                  permission.name,
                                )}
                                onCheckedChange={() =>
                                  handleCreateRolePermissionToggle(
                                    permission.name,
                                  )
                                }
                              />
                              <div className="flex-1">
                                <h4
                                  className={`font-medium text-sm transition-colors ${
                                    createRolePermissions.includes(
                                      permission.name,
                                    )
                                      ? "text-green-700"
                                      : "text-gray-900 group-hover:text-green-700"
                                  }`}
                                >
                                  {formatText(permission.name)}
                                </h4>
                                {permission.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {permission.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  {permission.requireChecker && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                      Requires Checker
                                    </span>
                                  )}
                                  {permission.noOfCheckerRequired > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                      {permission.noOfCheckerRequired} Checker
                                      {permission.noOfCheckerRequired > 1
                                        ? "s"
                                        : ""}{" "}
                                      Required
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {allPermissions.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">
                            No permissions available
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Please contact your administrator
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {createRolePermissions.length} of {allPermissions.length}{" "}
                  permissions selected
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreateRoleModal}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingRole || createRoleMutation.isPending}
                    className="px-6 bg-green-600 text-white hover:bg-green-700"
                  >
                    {isSubmittingRole || createRoleMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
