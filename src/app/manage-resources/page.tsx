"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Building2,
  Truck,
  FolderOpen,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { toast } from "sonner";

// Import queries for data fetching
import { useDepartmentsQuery } from "@/features/dashboard/departments/services/queries";
import { useSuppliersQuery } from "@/features/dashboard/supplier/services/queries";
import { useCategoriesQuery } from "@/features/dashboard/category/services/queries";
import { useBranches } from "@/features/dashboard/branches/services/queries";

// Import mutations
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/features/dashboard/departments/services/mutations";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "@/features/dashboard/supplier/services/mutations";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/dashboard/category/services/mutations";
import {
  useCreateBranch,
  useUpdateBranch,
} from "@/features/dashboard/branches/services/mutations";

// Import types are used in the component logic

// ResourceTable Component (moved outside to prevent re-creation on every render)
const ResourceTable = ({
  data,
  isLoading,
  resourceType,
  searchKey,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  pageNumber,
  onPageNumberChange,
  meta,
  onOpenCreateModal,
  onOpenEditModal,
}: {
  data: Array<Record<string, unknown>>;
  isLoading: boolean;
  resourceType: string;
  searchKey: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  pageNumber: number;
  onPageNumberChange: (value: number) => void;
  meta?: {
    page?: number;
    pageNumber?: number;
    perPage?: number;
    pageSize?: number;
    total?: number;
    totalCount?: number;
    pageCount?: number;
    numberOfPages?: number;
  };
  onOpenCreateModal: (resourceType: string) => void;
  onOpenEditModal: (
    item: Record<string, unknown>,
    resourceType: string
  ) => void;
}) => {
  // Normalize meta structure to handle different API response formats
  const normalizedMeta = meta
    ? {
        page: meta.page || meta.pageNumber || 1,
        perPage: meta.perPage || meta.pageSize || 10,
        total: meta.total || meta.totalCount || 0,
        pageCount: meta.pageCount || meta.numberOfPages || 1,
      }
    : null;
  const columns =
    data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "guid")
          .filter((key) => !key.toLowerCase().includes("createdat"))
          .map((key) => ({
            key,
            label: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/Id$/, "ID")
              .replace(/At$/, "Date")
              .trim(),
          }))
      : [];

  const getResourceIcon = () => {
    switch (resourceType.toLowerCase()) {
      case "departments":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "suppliers":
        return <Truck className="h-4 w-4 text-green-600" />;
      case "categories":
        return <FolderOpen className="h-4 w-4 text-purple-600" />;
      case "branches":
        return <MapPin className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getButtonColor = () => {
    switch (resourceType.toLowerCase()) {
      case "departments":
        return "bg-blue-600 hover:bg-blue-700";
      case "suppliers":
        return "bg-green-600 hover:bg-green-700";
      case "categories":
        return "bg-purple-600 hover:bg-purple-700";
      case "branches":
        return "bg-orange-600 hover:bg-orange-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <div
              className={`w-8 h-8 ${
                resourceType.toLowerCase() === "departments"
                  ? "bg-blue-100"
                  : resourceType.toLowerCase() === "suppliers"
                  ? "bg-green-100"
                  : resourceType.toLowerCase() === "categories"
                  ? "bg-purple-100"
                  : "bg-orange-100"
              } rounded-lg flex items-center justify-center`}
            >
              {getResourceIcon()}
            </div>
            Manage {resourceType}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Create, edit, and manage {resourceType.toLowerCase()} for your
            organization
          </p>
        </div>
        <Button
          className={`flex text-white items-center space-x-2 ${getButtonColor()}`}
          onClick={() => onOpenCreateModal(resourceType.toLowerCase())}
        >
          <Plus className="h-4 w-4" />
          <span>
            Add{" "}
            {resourceType === "Departments"
              ? "Department"
              : resourceType === "Suppliers"
              ? "Supplier"
              : resourceType === "Categories"
              ? "Category"
              : resourceType === "Branches"
              ? "Branch"
              : ""}
          </span>
        </Button>
      </div>

      {/* Search and Page Size Controls */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-lg border border-gray-200">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${resourceType.toLowerCase()}...`}
            value={searchKey}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageNumberChange(1);
            }}
          >
            <SelectTrigger className="w-20 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 border-3 ${
                resourceType.toLowerCase() === "departments"
                  ? "border-blue-600"
                  : resourceType.toLowerCase() === "suppliers"
                  ? "border-green-600"
                  : resourceType.toLowerCase() === "categories"
                  ? "border-purple-600"
                  : "border-orange-600"
              } border-t-transparent rounded-full animate-spin`}
            ></div>
            <span className="text-gray-600 font-medium">
              Loading {resourceType.toLowerCase()}...
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-16 text-center bg-gray-50/50"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div
                          className={`w-16 h-16 ${
                            resourceType.toLowerCase() === "departments"
                              ? "bg-blue-100"
                              : resourceType.toLowerCase() === "suppliers"
                              ? "bg-green-100"
                              : resourceType.toLowerCase() === "categories"
                              ? "bg-purple-100"
                              : "bg-orange-100"
                          } rounded-full flex items-center justify-center`}
                        >
                          {getResourceIcon()}
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium text-lg">
                            No {resourceType.toLowerCase()} found
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Get started by creating your first{" "}
                            {resourceType.slice(0, -1).toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      key={(item.guid as string) || index}
                      className="hover:bg-gray-50/30 transition-colors duration-150"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 text-sm text-gray-900 font-medium"
                        >
                          {(() => {
                            const value = item[column.key];
                            if (!value)
                              return <span className="text-gray-400">-</span>;

                            // Format dates for likely date fields only
                            const keyLower = column.key.toLowerCase();
                            const isLikelyDateField =
                              keyLower.includes("date") ||
                              keyLower === "createdat" ||
                              keyLower === "updatedat" ||
                              keyLower === "deletedat";
                            if (
                              isLikelyDateField &&
                              typeof value === "string"
                            ) {
                              const timestamp = Date.parse(value);
                              if (!Number.isNaN(timestamp)) {
                                const date = new Date(timestamp);
                                return (
                                  <span className="text-gray-600">
                                    {date.toLocaleDateString()}
                                  </span>
                                );
                              }
                            }

                            return String(value);
                          })()}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-white hover:bg-blue-600 border-blue-200 hover:border-blue-600 transition-all duration-200"
                            onClick={() =>
                              onOpenEditModal(item, resourceType.toLowerCase())
                            }
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-white hover:bg-red-600 border-red-200 hover:border-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {normalizedMeta && normalizedMeta.total > 0 && (
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
          {/* Page Info */}
          <div className="text-sm text-gray-600">
            Showing {(normalizedMeta.page - 1) * normalizedMeta.perPage + 1} to{" "}
            {Math.min(
              normalizedMeta.page * normalizedMeta.perPage,
              normalizedMeta.total
            )}{" "}
            of {normalizedMeta.total} results
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageNumberChange(1)}
              disabled={pageNumber <= 1 || isLoading}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-3" />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageNumberChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1 || isLoading}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Current Page Info */}
            <div
              className={`px-4 py-2 ${
                resourceType.toLowerCase() === "departments"
                  ? "bg-blue-500"
                  : resourceType.toLowerCase() === "suppliers"
                  ? "bg-green-500"
                  : resourceType.toLowerCase() === "categories"
                  ? "bg-purple-500"
                  : "bg-orange-500"
              } text-white rounded-lg font-semibold text-sm`}
            >
              {pageNumber} / {normalizedMeta.pageCount}
            </div>

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageNumberChange(
                  Math.min(normalizedMeta.pageCount, pageNumber + 1)
                )
              }
              disabled={pageNumber >= normalizedMeta.pageCount || isLoading}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageNumberChange(normalizedMeta.pageCount)}
              disabled={pageNumber >= normalizedMeta.pageCount || isLoading}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4 -mr-3" />
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageResourcesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("departments");

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [modalResourceType, setModalResourceType] = useState<string>("");

  // Departments pagination and search
  const [deptPageNumber, setDeptPageNumber] = useState(1);
  const [deptPageSize, setDeptPageSize] = useState(10);
  const [deptSearchKey, setDeptSearchKey] = useState("");
  const [deptDebouncedSearchKey, setDeptDebouncedSearchKey] = useState("");

  // Suppliers pagination and search
  const [supplierPageNumber, setSupplierPageNumber] = useState(1);
  const [supplierPageSize, setSupplierPageSize] = useState(10);
  const [supplierSearchKey, setSupplierSearchKey] = useState("");
  const [supplierDebouncedSearchKey, setSupplierDebouncedSearchKey] =
    useState("");

  // Categories pagination and search
  const [categoryPageNumber, setCategoryPageNumber] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(10);
  const [categorySearchKey, setCategorySearchKey] = useState("");
  const [categoryDebouncedSearchKey, setCategoryDebouncedSearchKey] =
    useState("");

  // Branches pagination and search
  const [branchPageNumber, setBranchPageNumber] = useState(1);
  const [branchPageSize, setBranchPageSize] = useState(10);
  const [branchSearchKey, setBranchSearchKey] = useState("");
  const [branchDebouncedSearchKey, setBranchDebouncedSearchKey] = useState("");

  // Debounce departments search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeptDebouncedSearchKey(deptSearchKey);
      setDeptPageNumber(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [deptSearchKey]);

  // Debounce suppliers search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSupplierDebouncedSearchKey(supplierSearchKey);
      setSupplierPageNumber(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [supplierSearchKey]);

  // Debounce categories search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryDebouncedSearchKey(categorySearchKey);
      setCategoryPageNumber(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [categorySearchKey]);

  // Debounce branches search
  useEffect(() => {
    const timer = setTimeout(() => {
      setBranchDebouncedSearchKey(branchSearchKey);
      setBranchPageNumber(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [branchSearchKey]);

  // Data queries with pagination and search
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartmentsQuery({
      pageNumber: deptPageNumber,
      pageSize: deptPageSize,
      ...(deptDebouncedSearchKey.trim() && {
        searchKey: deptDebouncedSearchKey.trim(),
      }),
    });
  const { data: suppliersData, isLoading: suppliersLoading } =
    useSuppliersQuery({
      pageNumber: supplierPageNumber,
      pageSize: supplierPageSize,
      ...(supplierDebouncedSearchKey.trim() && {
        searchKey: supplierDebouncedSearchKey.trim(),
      }),
    });
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery({
      pageNumber: categoryPageNumber,
      pageSize: categoryPageSize,
      ...(categoryDebouncedSearchKey.trim() && {
        searchKey: categoryDebouncedSearchKey.trim(),
      }),
    });
  const { data: branchesData, isLoading: branchesLoading } = useBranches({
    pageNumber: branchPageNumber,
    pageSize: branchPageSize,
    ...(branchDebouncedSearchKey.trim() && {
      searchKey: branchDebouncedSearchKey.trim(),
    }),
  });

  // Mutations
  const createDepartmentMutation = useCreateDepartmentMutation();
  const updateDepartmentMutation = useUpdateDepartmentMutation();
  const createSupplierMutation = useCreateSupplierMutation();
  const updateSupplierMutation = useUpdateSupplierMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  const handleBack = () => {
    router.push("/dashboard");
  };

  const openCreateModal = (resourceType: string) => {
    setEditingItem(null);
    setModalResourceType(resourceType);
    setIsModalOpen(true);
  };

  const openEditModal = (
    item: Record<string, unknown>,
    resourceType: string
  ) => {
    setEditingItem(item);
    setModalResourceType(resourceType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalResourceType("");
  };

  const departments = departmentsData?.responseData?.records || [];
  const suppliers = suppliersData?.responseData?.records || [];
  const categories = categoriesData?.responseData?.records || [];
  const branches = branchesData?.responseData?.records || [];

  // Resource Modal Component
  const ResourceModal = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

    const [isSubmittingResource, setIsSubmittingResource] = useState(false);

    const getFormFields = () => {
      switch (modalResourceType) {
        case "departments":
          return [
            {
              name: "departmentName",
              label: "Department Name",
              type: "text",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: "text",
              required: true,
            },
          ];
        case "suppliers":
          return [
            {
              name: "supplierName",
              label: "Supplier Name",
              type: "text",
              required: true,
            },
            {
              name: "contactPerson",
              label: "Contact Person",
              type: "text",
              required: true,
            },
            {
              name: "contactNumber",
              label: "Contact Number",
              type: "text",
              required: true,
            },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "description",
              label: "Description",
              type: "text",
              required: true,
            },
          ];
        case "categories":
          return [
            {
              name: "categoryName",
              label: "Category Name",
              type: "text",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: "text",
              required: true,
            },
          ];
        case "branches":
          return [
            {
              name: "branchName",
              label: "Branch Name",
              type: "text",
              required: true,
            },
            { name: "address", label: "Address", type: "text", required: true },
            {
              name: "description",
              label: "Description",
              type: "text",
              required: true,
            },
          ];
        default:
          return [];
      }
    };

    const getMutationPair = () => {
      switch (modalResourceType) {
        case "departments":
          return {
            create: createDepartmentMutation,
            update: updateDepartmentMutation,
          };
        case "suppliers":
          return {
            create: createSupplierMutation,
            update: updateSupplierMutation,
          };
        case "categories":
          return {
            create: createCategoryMutation,
            update: updateCategoryMutation,
          };
        case "branches":
          return { create: createBranchMutation, update: updateBranchMutation };
        default:
          return { create: undefined, update: undefined } as const;
      }
    };

    const onSubmit = async (data: Record<string, unknown>) => {
      try {
        setIsSubmittingResource(true);
        const { create, update } = getMutationPair();
        const mutation = editingItem ? update : create;
        const payload = editingItem
          ? { ...data, guid: editingItem.guid }
          : data;

        if (!mutation) {
          throw new Error("Unknown resource type");
        }

        await mutation.mutateAsync(payload as never);

        // Close only after successful fulfill
        toast.success(
          `${modalResourceType.slice(0, -1)} ${
            editingItem ? "updated" : "created"
          } successfully!`
        );
        closeModal();
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          `Failed to ${
            editingItem ? "update" : "create"
          } ${modalResourceType.slice(0, -1)}`
        );
      } finally {
        setIsSubmittingResource(false);
      }
    };

    const formFields = getFormFields();

    const getResourceIcon = () => {
      switch (modalResourceType) {
        case "departments":
          return <Building2 className="h-5 w-5" />;
        case "suppliers":
          return <Truck className="h-5 w-5" />;
        case "categories":
          return <FolderOpen className="h-5 w-5" />;
        case "branches":
          return <MapPin className="h-5 w-5" />;
        default:
          return <Plus className="h-5 w-5" />;
      }
    };

    const getResourceColor = () => {
      switch (modalResourceType) {
        case "departments":
          return "from-blue-500 to-indigo-600";
        case "suppliers":
          return "from-green-500 to-emerald-600";
        case "categories":
          return "from-purple-500 to-violet-600";
        case "branches":
          return "from-orange-500 to-amber-600";
        default:
          return "from-gray-500 to-slate-600";
      }
    };

    return (
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (!isSubmittingResource) {
              closeModal();
            }
            return;
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${getResourceColor()} rounded-lg flex items-center justify-center text-white text-lg font-bold`}
              >
                {getResourceIcon()}
              </div>
              {editingItem ? "Edit" : "Add"}{" "}
              {modalResourceType === "departments"
                ? "Department"
                : modalResourceType === "suppliers"
                ? "Supplier"
                : modalResourceType === "categories"
                ? "Category"
                : modalResourceType === "branches"
                ? "Branch"
                : ""}
            </DialogTitle>
            <div className="text-gray-600 mt-2">
              {editingItem ? "Update" : "Create a new"}{" "}
              {modalResourceType === "departments"
                ? "Department"
                : modalResourceType === "suppliers"
                ? "Supplier"
                : modalResourceType === "categories"
                ? "Category"
                : modalResourceType === "branches"
                ? "Branch"
                : ""}{" "}
              for your organization
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div
              className={`bg-gradient-to-r ${
                modalResourceType === "departments"
                  ? "from-blue-50 to-indigo-50 border-blue-200"
                  : modalResourceType === "suppliers"
                  ? "from-green-50 to-emerald-50 border-green-200"
                  : modalResourceType === "categories"
                  ? "from-purple-50 to-violet-50 border-purple-200"
                  : "from-orange-50 to-amber-50 border-orange-200"
              } rounded-lg p-4 border`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {modalResourceType === "departments"
                  ? "Department"
                  : modalResourceType === "suppliers"
                  ? "Supplier"
                  : modalResourceType === "categories"
                  ? "Category"
                  : modalResourceType === "branches"
                  ? "Branch"
                  : ""}{" "}
                Information
              </h3>
              <div
                className={`grid grid-cols-1 ${
                  formFields.length > 2 ? "md:grid-cols-2" : ""
                } gap-4`}
              >
                {formFields.map((field) => (
                  <div
                    key={field.name}
                    className={`space-y-2 ${
                      field.name === "description" && formFields.length > 2
                        ? "md:col-span-2"
                        : ""
                    }`}
                  >
                    <label className="text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      defaultValue={(editingItem?.[field.name] as string) || ""}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 ${
                        modalResourceType === "departments"
                          ? "focus:ring-blue-500 focus:border-blue-500"
                          : modalResourceType === "suppliers"
                          ? "focus:ring-green-500 focus:border-green-500"
                          : modalResourceType === "categories"
                          ? "focus:ring-purple-500 focus:border-purple-500"
                          : "focus:ring-orange-500 focus:border-orange-500"
                      }`}
                      {...register(field.name, {
                        required: field.required
                          ? `${field.label} is required`
                          : false,
                        ...(field.type === "email" && {
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        }),
                      })}
                    />
                    {errors[field.name] && (
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
                        {(errors[field.name] as { message: string })?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {editingItem ? "Updating existing" : "Creating new"}{" "}
                {modalResourceType.slice(0, -1)}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`px-6 text-white ${
                    modalResourceType === "departments"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : modalResourceType === "suppliers"
                      ? "bg-green-600 hover:bg-green-700"
                      : modalResourceType === "categories"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                  disabled={isSubmittingResource}
                >
                  {isSubmittingResource ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingItem ? "Updating..." : "Creating..."}</span>
                    </div>
                  ) : (
                    <>
                      {editingItem ? "Update" : "Create"}{" "}
                      {modalResourceType.slice(0, -1).charAt(0).toUpperCase() +
                        modalResourceType.slice(1, -1)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40">
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
                <div className="bg-orange-100 rounded-xl p-3">
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Manage Resources
                  </h1>
                  <p className="text-gray-600">
                    Manage departments, suppliers, categories, and branches for
                    your fixed assets system
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-white to-orange-50/30 border-orange-100 shadow-sm">
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50/50">
                    <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
                      <TabsTrigger
                        value="departments"
                        className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Departments</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="suppliers"
                        className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-200"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Suppliers</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="categories"
                        className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
                      >
                        <FolderOpen className="h-4 w-4" />
                        <span>Categories</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="branches"
                        className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Branches</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="departments" className="mt-0">
                      <ResourceTable
                        data={
                          departments as unknown as Array<
                            Record<string, unknown>
                          >
                        }
                        isLoading={departmentsLoading}
                        resourceType="Departments"
                        searchKey={deptSearchKey}
                        onSearchChange={setDeptSearchKey}
                        pageSize={deptPageSize}
                        onPageSizeChange={setDeptPageSize}
                        pageNumber={deptPageNumber}
                        onPageNumberChange={setDeptPageNumber}
                        meta={departmentsData?.responseData?.meta}
                        onOpenCreateModal={openCreateModal}
                        onOpenEditModal={openEditModal}
                      />
                    </TabsContent>

                    <TabsContent value="suppliers" className="mt-0">
                      <ResourceTable
                        data={
                          suppliers as unknown as Array<Record<string, unknown>>
                        }
                        isLoading={suppliersLoading}
                        resourceType="Suppliers"
                        searchKey={supplierSearchKey}
                        onSearchChange={setSupplierSearchKey}
                        pageSize={supplierPageSize}
                        onPageSizeChange={setSupplierPageSize}
                        pageNumber={supplierPageNumber}
                        onPageNumberChange={setSupplierPageNumber}
                        meta={suppliersData?.responseData?.meta}
                        onOpenCreateModal={openCreateModal}
                        onOpenEditModal={openEditModal}
                      />
                    </TabsContent>

                    <TabsContent value="categories" className="mt-0">
                      <ResourceTable
                        data={
                          categories as unknown as Array<
                            Record<string, unknown>
                          >
                        }
                        isLoading={categoriesLoading}
                        resourceType="Categories"
                        searchKey={categorySearchKey}
                        onSearchChange={setCategorySearchKey}
                        pageSize={categoryPageSize}
                        onPageSizeChange={setCategoryPageSize}
                        pageNumber={categoryPageNumber}
                        onPageNumberChange={setCategoryPageNumber}
                        meta={categoriesData?.responseData?.meta}
                        onOpenCreateModal={openCreateModal}
                        onOpenEditModal={openEditModal}
                      />
                    </TabsContent>

                    <TabsContent value="branches" className="mt-0">
                      <ResourceTable
                        data={
                          branches as unknown as Array<Record<string, unknown>>
                        }
                        isLoading={branchesLoading}
                        resourceType="Branches"
                        searchKey={branchSearchKey}
                        onSearchChange={setBranchSearchKey}
                        pageSize={branchPageSize}
                        onPageSizeChange={setBranchPageSize}
                        pageNumber={branchPageNumber}
                        onPageNumberChange={setBranchPageNumber}
                        meta={branchesData?.responseData?.meta}
                        onOpenCreateModal={openCreateModal}
                        onOpenEditModal={openEditModal}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Resource Modal */}
      <ResourceModal />
    </ProtectedRoute>
  );
}
