"use client";

import { useState, useMemo, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { assetStatuses } from "@/lib/dummy-data";
import {
  useAssetsQuery,
  useAssetByGuidQuery,
  useCustodianHistoryQuery,
} from "@/features/dashboard/assets/services/queries";
import { useUpdateAssetMutation } from "@/features/dashboard/assets/services/mutations";
import {
  Asset as ApiAsset,
  CustodianHistoryRecord,
} from "@/features/dashboard/assets/type";
import {
  exportToCSV,
  formatCurrencyForCSV,
  formatDateForCSV,
  generateTimestamp,
  type ExportColumn,
} from "@/lib/csv-export";
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Power,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  History,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import {
  Contact,
  useContactsQuery,
} from "@/features/dashboard/admin-management";
import { useCategoriesQuery } from "@/features/dashboard/category/services/queries";
import { Category } from "@/features/dashboard/category/type";
import { useDepartmentsQuery } from "@/features/dashboard/departments/services/queries";
import { Department } from "@/features/dashboard/departments/type";
import { useBranches } from "@/features/dashboard/branches/services/queries";
import { Branch } from "@/features/dashboard/branches/type";
import { useSuppliersQuery } from "@/features/dashboard/supplier/services/queries";
import { Supplier } from "@/features/dashboard/supplier/type";

// Asset interface for the component (compatible with existing table structure)
interface Asset {
  id: string;
  tagNumber: string;
  assetName: string;
  serialNumber: string;
  brand: string;
  model: string;
  oem?: string;
  operatingSystemVersion?: string;
  releaseVersion?: string;
  eolEoslDate?: string;
  locationStatus?: string;
  categoryName: string;
  categoryDescription: string;
  departmentName: string;
  departmentDescription: string;
  branchName: string;
  branchAddress: string;
  branchDescription: string;
  supplierName: string;
  supplierContactPerson: string;
  supplierContactNumber: string;
  supplierEmail: string;
  supplierDescription: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentBookValue: number;
  depreciationMethod: string;
  status: "Active" | "Disabled" | "Disposed";
  condition: string;
  custodianGuid: string;
  custodianName: string;
  location: string;
  depreciationStatus: "Current" | "Fully Depreciated" | "Partially Depreciated";
}

export default function AllAssetListPage() {
  const router = useRouter();

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Search terms for resources
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

  // Selected resource GUIDs for editing
  const [selectedCategoryGuid, setSelectedCategoryGuid] = useState<string>("");
  const [selectedDepartmentGuid, setSelectedDepartmentGuid] =
    useState<string>("");
  const [selectedBranchGuid, setSelectedBranchGuid] = useState<string>("");
  const [selectedSupplierGuid, setSelectedSupplierGuid] = useState<string>("");
  const [selectedCustodianGuid, setSelectedCustodianGuid] =
    useState<string>("");

  const handleContactSearch = (search: string) => {
    setContactSearchTerm(search);
  };
  const { data: contactsData, isLoading: contactsLoading } = useContactsQuery(
    contactSearchTerm ? { search: contactSearchTerm } : undefined,
  );

  const contacts = contactsData?.responseData?.records || [];

  // Queries for resources
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoriesQuery({
      pageNumber: 1,
      pageSize: 100,
      ...(categorySearchTerm.trim() && {
        searchKey: categorySearchTerm.trim(),
      }),
    });
  const categories = categoriesData?.responseData?.records || [];

  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartmentsQuery({
      pageNumber: 1,
      pageSize: 100,
      ...(departmentSearchTerm.trim() && {
        searchKey: departmentSearchTerm.trim(),
      }),
    });
  const departments = departmentsData?.responseData?.records || [];

  const { data: branchesData, isLoading: branchesLoading } = useBranches({
    pageNumber: 1,
    pageSize: 100,
    ...(branchSearchTerm.trim() && { searchKey: branchSearchTerm.trim() }),
  });
  const branches = branchesData?.responseData?.records || [];

  const { data: suppliersData, isLoading: suppliersLoading } =
    useSuppliersQuery({
      pageNumber: 1,
      pageSize: 100,
      ...(supplierSearchTerm.trim() && {
        searchKey: supplierSearchTerm.trim(),
      }),
    });
  const suppliers = suppliersData?.responseData?.records || [];

  const contactOptions: SearchableSelectOption[] = contacts.map(
    (contact: Contact) => ({
      value: contact.email,
      label: contact.name,
      description: `${contact.email} • ${contact.username}`,
    }),
  );

  // Resource options for searchable selects
  const categoryOptions: SearchableSelectOption[] = categories.map(
    (category: Category) => ({
      value: category.guid,
      label: category.categoryName,
      description: category.description || "",
    }),
  );

  const departmentOptions: SearchableSelectOption[] = departments.map(
    (department: Department) => ({
      value: department.guid,
      label: department.departmentName,
      description: department.description || "",
    }),
  );

  const branchOptions: SearchableSelectOption[] = branches.map(
    (branch: Branch) => ({
      value: branch.guid,
      label: branch.branchName,
      description: branch.address || "",
    }),
  );

  const supplierOptions: SearchableSelectOption[] = suppliers.map(
    (supplier: Supplier) => ({
      value: supplier.guid,
      label: supplier.supplierName,
      description: `${supplier.contactPerson || ""} • ${supplier.email || ""}`,
    }),
  );

  // API calls
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewAssetGuid, setViewAssetGuid] = useState<string | null>(null);
  const [editAssetGuid, setEditAssetGuid] = useState<string | null>(null);
  const [custodianHistoryGuid, setCustodianHistoryGuid] = useState<
    string | null
  >(null);
  const [custodianHistoryAssetName, setCustodianHistoryAssetName] =
    useState<string>("");

  // Debounce search key to reduce API calls during typing
  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(globalFilter);
    }, 400);
    return () => window.clearTimeout(handler);
  }, [globalFilter]);

  // Reset to first page when search changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch]);
  const {
    data: assetsData,
    isLoading: assetsLoading,
    error: assetsError,
    isFetching: assetsFetching,
  } = useAssetsQuery({
    pageNumber,
    pageSize,
    searchKey: debouncedSearch || "",
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "status", value: "Active" }, // Default to Active assets
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [depreciationFilter, setDepreciationFilter] = useState("All");

  // Map API asset data to component Asset interface
  const mapApiAssetToAssetFactory =
    (custodianName: string | undefined) =>
    (apiAsset: ApiAsset): Asset => {
      const mapStatus = (
        s: string | undefined,
      ): "Active" | "Disabled" | "Disposed" => {
        switch ((s || "").toUpperCase()) {
          case "ACTIVE":
            return "Active";
          case "DISABLED":
            return "Disabled";
          case "DISPOSED":
            return "Disposed";
          default:
            return "Active";
        }
      };
      // Determine depreciation status based on current book value vs acquisition cost
      let depreciationStatus:
        | "Current"
        | "Fully Depreciated"
        | "Partially Depreciated" = "Current";
      if (apiAsset.currentBookValue <= apiAsset.salvageValue) {
        depreciationStatus = "Fully Depreciated";
      } else if (apiAsset.currentBookValue < apiAsset.acquisitionCost) {
        depreciationStatus = "Partially Depreciated";
      }

      return {
        id: apiAsset.guid,
        tagNumber: apiAsset.tagNumber,
        assetName: apiAsset.assetName,
        serialNumber: apiAsset.serialNumber,
        brand: apiAsset.brand || "",
        model: apiAsset.model || "",
        oem: apiAsset.oem || "",
        operatingSystemVersion: apiAsset.operatingSystemVersion || "",
        releaseVersion: apiAsset.releaseVersion || "",
        eolEoslDate: apiAsset.eolEoslDate || "",
        locationStatus: apiAsset.locationStatus || "",
        categoryName: apiAsset.category?.categoryName || "",
        categoryDescription: apiAsset.category?.description || "",
        departmentName: apiAsset.department?.departmentName || "",
        departmentDescription: apiAsset.department?.description || "",
        branchName: apiAsset.branch?.branchName || "",
        branchAddress: apiAsset.branch?.address || "",
        branchDescription: apiAsset.branch?.description || "",
        supplierName: apiAsset.supplier?.supplierName || "",
        supplierContactPerson: apiAsset.supplier?.contactPerson || "",
        supplierContactNumber: apiAsset.supplier?.contactNumber || "",
        supplierEmail: apiAsset.supplier?.email || "",
        supplierDescription: apiAsset.supplier?.description || "",
        acquisitionDate: apiAsset.acquisitionDate,
        acquisitionCost: apiAsset.acquisitionCost,
        currentBookValue: apiAsset.currentBookValue,
        depreciationMethod: apiAsset.depreciationMethod || "",
        status: mapStatus(apiAsset.status as unknown as string),
        condition: apiAsset.condition,
        custodianGuid: selectedCustodianGuid || "",
        custodianName: apiAsset.custodianName || "",
        location: apiAsset.locationDetail,
        depreciationStatus,
      };
    };

  // Transform API data to component data
  const assets = useMemo<Asset[]>(() => {
    const records = assetsData?.responseData?.records as ApiAsset[] | undefined;
    if (!records) return [];
    const mapApiAssetToAsset = mapApiAssetToAssetFactory(selectedContact?.name);
    return records.map(mapApiAssetToAsset);
  }, [assetsData, selectedContact]);

  // Queries for modals (hooks must be at top level)
  const viewAssetQuery = useAssetByGuidQuery(viewAssetGuid || undefined);
  const editAssetQuery = useAssetByGuidQuery(editAssetGuid || undefined);
  const custodianHistoryQuery = useCustodianHistoryQuery(
    custodianHistoryGuid || undefined,
  );
  const updateAssetMutation = useUpdateAssetMutation();

  // Initialize selected resource GUIDs when edit modal opens
  useEffect(() => {
    if (editAssetQuery.data?.responseData) {
      const asset = editAssetQuery.data.responseData;
      // Use categoryGuid or fall back to nested category.guid
      setSelectedCategoryGuid(asset.categoryGuid || asset.category?.guid || "");
      setSelectedDepartmentGuid(
        asset.departmentGuid || asset.department?.guid || "",
      );
      setSelectedBranchGuid(asset.branchGuid || asset.branch?.guid || "");
      setSelectedSupplierGuid(asset.supplierGuid || asset.supplier?.guid || "");
      setSelectedCustodianGuid(asset.custodianGuid || "");
      // Pre-fill custodian search so the current custodian appears in options
      if (asset.custodianName) {
        setContactSearchTerm(asset.custodianName);
      }
    }
  }, [editAssetQuery.data]);

  const handleBack = () => {
    router.back();
  };

  const handleViewAsset = (asset: Asset) => {
    setViewAssetGuid(asset.id);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditAssetGuid(asset.id);
  };

  const handleDisableAsset = (asset: Asset) => {
    toast.warning("Disable Asset", {
      description: `${asset.assetName} has been disabled`,
    });
    // Implement disable logic
  };

  const handleRemoveAsset = (asset: Asset) => {
    toast.error("Remove Asset", {
      description: `${asset.assetName} has been removed`,
    });
    // Implement remove logic
  };

  const handleExportAssets = () => {
    try {
      // Define columns for CSV export
      const exportColumns: ExportColumn[] = [
        { key: "tagNumber", header: "Tag Number" },
        { key: "assetName", header: "Asset Name" },
        { key: "serialNumber", header: "Serial Number" },
        { key: "categoryName", header: "Category" },
        { key: "categoryDescription", header: "Category Description" },
        { key: "departmentName", header: "Department" },
        { key: "departmentDescription", header: "Department Description" },
        { key: "branchName", header: "Branch" },
        { key: "branchAddress", header: "Branch Address" },
        { key: "supplierName", header: "Supplier" },
        { key: "supplierContactPerson", header: "Supplier Contact Person" },
        { key: "supplierContactNumber", header: "Supplier Contact Number" },
        { key: "supplierEmail", header: "Supplier Email" },
        {
          key: "acquisitionDate",
          header: "Acquisition Date",
          formatter: formatDateForCSV,
        },
        {
          key: "acquisitionCost",
          header: "Acquisition Cost",
          formatter: formatCurrencyForCSV,
        },
        {
          key: "currentBookValue",
          header: "Current Book Value",
          formatter: formatCurrencyForCSV,
        },
        { key: "depreciationMethod", header: "Depreciation Method" },
        { key: "status", header: "Status" },
        { key: "condition", header: "Condition" },
        { key: "custodianName", header: "Custodian" },
        { key: "location", header: "Location" },
        { key: "depreciationStatus", header: "Depreciation Status" },
      ];

      // Export filtered data
      const timestamp = generateTimestamp();
      const filename = `assets_export_${timestamp}.csv`;

      exportToCSV(filteredData, exportColumns, filename);

      toast.success("Assets exported successfully!", {
        description: `${filteredData.length} assets exported to ${filename}`,
      });
    } catch {
      toast.error("Export failed", {
        description: "An error occurred while exporting assets data.",
      });
    }
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: "tagNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Tag Number
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <button
            onClick={() => handleViewAsset(asset)}
            className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-orange-50 -mx-3 -my-1.5"
          >
            {asset.tagNumber}
          </button>
        );
      },
    },
    {
      accessorKey: "assetName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Asset Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const assetName = row.getValue("assetName") as string;
        return (
          <div className="max-w-[200px] overflow-hidden">
            <div
              className="font-semibold text-slate-900 mb-1 truncate"
              title={assetName}
            >
              {assetName}
            </div>
            <div
              className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full inline-block max-w-full truncate"
              title={row.original.serialNumber}
            >
              {row.original.serialNumber}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Category
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const categoryName = row.getValue("categoryName") as string;
        const categoryDescription = row.original.categoryDescription;
        const getCategoryColor = (cat: string) => {
          const catLower = cat.toLowerCase();
          if (catLower.includes("computer") || catLower.includes("equipment")) {
            return "bg-blue-100 text-blue-800 border-blue-200";
          } else if (catLower.includes("furniture")) {
            return "bg-green-100 text-green-800 border-green-200";
          } else if (catLower.includes("vehicle")) {
            return "bg-purple-100 text-purple-800 border-purple-200";
          } else if (catLower.includes("office")) {
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          } else if (catLower.includes("building")) {
            return "bg-gray-100 text-gray-800 border-gray-200";
          } else if (catLower.includes("security")) {
            return "bg-red-100 text-red-800 border-red-200";
          } else if (catLower.includes("presentation")) {
            return "bg-indigo-100 text-indigo-800 border-indigo-200";
          }
          return "bg-slate-100 text-slate-800 border-slate-200";
        };
        return (
          <div className="max-w-[200px] overflow-hidden">
            <Badge
              variant="secondary"
              className={`text-xs font-medium border max-w-full truncate ${getCategoryColor(
                categoryName,
              )} hover:shadow-sm transition-shadow duration-200`}
              title={categoryName}
            >
              {categoryName}
            </Badge>
            {categoryDescription && (
              <div
                className="text-xs text-slate-500 mt-1 truncate"
                title={categoryDescription}
              >
                {categoryDescription}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Department
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const departmentName = row.getValue("departmentName") as string;
        const departmentDescription = row.original.departmentDescription;
        return (
          <div className="max-w-[180px] overflow-hidden">
            <div
              className="font-medium text-slate-900 truncate"
              title={departmentName}
            >
              {departmentName}
            </div>
            {departmentDescription && (
              <div
                className="text-xs text-slate-500 truncate"
                title={departmentDescription}
              >
                {departmentDescription}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Branch
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const branchName = row.getValue("branchName") as string;
        const branchAddress = row.original.branchAddress;
        return (
          <div className="max-w-[180px] overflow-hidden">
            <div
              className="font-medium text-slate-900 truncate"
              title={branchName}
            >
              {branchName}
            </div>
            {branchAddress && (
              <div
                className="text-xs text-slate-500 truncate"
                title={branchAddress}
              >
                {branchAddress}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "custodianName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Custodian
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const custodianName = row.getValue("custodianName") as string;
        return (
          <div className="max-w-[180px] overflow-hidden">
            <div
              className="font-medium text-slate-900 truncate"
              title={custodianName || "N/A"}
            >
              {custodianName || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "locationStatus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Location Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const locationStatus = row.getValue("locationStatus") as string;
        const labelMap: Record<string, string> = {
          IN_STORAGE: "In Storage",
          WITH_IT: "With IT",
          IN_USE: "In Use",
          IN_REPAIR: "In Repair",
          DISPOSED: "Disposed",
        };
        const label = labelMap[locationStatus] || locationStatus || "N/A";
        const getLocationStatusStyle = (status: string) => {
          switch (status) {
            case "IN_USE":
              return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "IN_STORAGE":
              return "bg-blue-100 text-blue-800 border-blue-200";
            case "WITH_IT":
              return "bg-purple-100 text-purple-800 border-purple-200";
            case "IN_REPAIR":
              return "bg-amber-100 text-amber-800 border-amber-200";
            case "DISPOSED":
              return "bg-red-100 text-red-800 border-red-200";
            default:
              return "bg-slate-100 text-slate-800 border-slate-200";
          }
        };
        return (
          <div className="max-w-[150px]">
            <Badge
              variant="secondary"
              className={`text-xs font-medium border ${getLocationStatusStyle(
                locationStatus,
              )} hover:shadow-sm transition-shadow duration-200`}
            >
              {label}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "currentBookValue",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Current Book Value
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("currentBookValue") as number;
        return (
          <div className="font-medium text-slate-900">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(value)}
          </div>
        );
      },
    },
    {
      accessorKey: "depreciationMethod",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Depreciation Method
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const method = row.getValue("depreciationMethod") as string;
        return (
          <div className="max-w-[180px]">
            <Badge
              variant="secondary"
              className="text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-200 hover:shadow-sm transition-shadow duration-200"
            >
              {method || "N/A"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusStyle = (status: string) => {
          switch (status) {
            case "Active":
              return "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm";
            case "Disabled":
              return "bg-amber-100 text-amber-800 border-amber-200 shadow-sm";
            case "Disposed":
              return "bg-red-100 text-red-800 border-red-200 shadow-sm";
            default:
              return "bg-slate-100 text-slate-800 border-slate-200";
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "Active"
                  ? "bg-emerald-500"
                  : status === "Disabled"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            />
            <Badge
              variant="secondary"
              className={`text-xs font-medium border ${getStatusStyle(
                status,
              )} hover:shadow-md transition-all duration-200`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const asset = row.original;

        return (
          <TooltipProvider delayDuration={100}>
            <div className="flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAsset(asset)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAsset(asset)}
                    className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Asset</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisableAsset(asset)}
                    className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 rounded-full transition-all duration-200 disabled:opacity-30"
                    disabled={asset.status === "Disabled"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {asset.status === "Disabled"
                      ? "Asset Disabled"
                      : "Disable Asset"}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustodianHistoryGuid(asset.id);
                      setCustodianHistoryAssetName(asset.assetName);
                    }}
                    className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-all duration-200"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Custodian History</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 w-8 p-0 text-red-300 rounded-full transition-all duration-200 cursor-not-allowed opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete is disabled</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return assets.filter((asset: Asset) => {
      const matchesCategory =
        categoryFilter === "All" || asset.categoryName === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || asset.status === statusFilter;
      const matchesDepreciation =
        depreciationFilter === "All" ||
        asset.depreciationStatus === depreciationFilter;

      return matchesCategory && matchesStatus && matchesDepreciation;
    });
  }, [assets, categoryFilter, statusFilter, depreciationFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) => {
      const asset = row.original;
      const searchableFields = [
        asset.assetName,
        asset.serialNumber,
        asset.tagNumber,
        asset.departmentName,
        asset.branchName,
        asset.categoryName,
        asset.supplierName,
      ];

      const query = String(value ?? "").toLowerCase();
      if (!query) return true;

      return searchableFields.some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(query),
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Error handling
  if (assetsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Failed to load assets data. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
                <span>Back</span>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              View/Manage Assets List
            </h1>
            <p className="text-muted-foreground">
              Comprehensive list of all fixed assets in the system
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-orange-600" />
                <span>Search & Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                {/* Global Search */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="search">Search Assets</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, serial, tag, department, branch..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                {/* <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        assetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Results Info */}
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground">
                    {assetsFetching && (
                      <span className="mr-2">Refreshing…</span>
                    )}
                    Showing {table.getRowModel().rows.length} of{" "}
                    {filteredData.length} assets
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleExportAssets}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setGlobalFilter("");
                      setCategoryFilter("All");
                      setStatusFilter("All");
                      setDepreciationFilter("All");
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Scroll Guide */}
              <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200 py-3 px-6">
                <div className="flex items-center justify-center text-sm text-slate-500 font-medium">
                  <ChevronLeft className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Scroll to see all data</span>
                  <ChevronRight className="h-4 w-4 ml-2 animate-pulse" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-0">
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-0 font-semibold text-slate-700 py-4 px-6 first:pl-8 last:pr-8"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {assetsLoading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="border-0">
                          {columns.map((_, colIndex) => (
                            <TableCell
                              key={colIndex}
                              className="py-4 px-6 first:pl-8 last:pr-8 border-0"
                            >
                              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={`
                            border-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-orange-100/30 hover:shadow-sm
                            ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                            group
                          `}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="py-4 px-6 first:pl-8 last:pr-8 border-0"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-32 text-center text-slate-500 bg-slate-50/30"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                              <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="text-sm font-medium">
                              No assets found
                            </div>
                            <div className="text-xs text-slate-400">
                              Try adjusting your search or filters
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t-0">
                <div className="flex-1 text-sm text-slate-600 font-medium">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Rows per page
                    </p>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        const next = parseInt(value, 10);
                        setPageSize(next);
                        setPageNumber(1);
                        table.setPageSize(next);
                      }}
                    >
                      <SelectTrigger className="h-9 w-[75px] border-slate-200 shadow-sm">
                        <SelectValue
                          placeholder={table.getState().pagination.pageSize}
                        />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[140px] items-center justify-center text-sm font-semibold text-slate-700 bg-white rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm">
                    Page {pageNumber} of{" "}
                    {assetsData?.responseData?.meta?.numberOfPages || 1}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      className="hidden h-9 w-9 p-0 lg:flex border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() => setPageNumber(1)}
                      disabled={pageNumber <= 1}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() =>
                        setPageNumber((p) => {
                          const pages =
                            assetsData?.responseData?.meta?.numberOfPages || 1;
                          return Math.min(pages, p + 1);
                        })
                      }
                      disabled={
                        pageNumber >=
                        (assetsData?.responseData?.meta?.numberOfPages || 1)
                      }
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-9 w-9 p-0 lg:flex border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() =>
                        setPageNumber(
                          assetsData?.responseData?.meta?.numberOfPages || 1,
                        )
                      }
                      disabled={
                        pageNumber >=
                        (assetsData?.responseData?.meta?.numberOfPages || 1)
                      }
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      {/* View Asset Modal */}
      <Dialog
        open={!!viewAssetGuid}
        onOpenChange={(open) => !open && setViewAssetGuid(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Asset Details
            </DialogTitle>
          </DialogHeader>
          {viewAssetQuery.isLoading ? (
            <div className="py-12 text-center text-slate-500">
              Loading asset…
            </div>
          ) : viewAssetQuery.data?.responseData ? (
            (() => {
              const asset = viewAssetQuery.data.responseData;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Tag Number</div>
                    <div className="font-medium">{asset.tagNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Asset Name</div>
                    <div className="font-medium">{asset.assetName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Serial Number</div>
                    <div className="font-medium">
                      {asset.serialNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Brand</div>
                    <div className="font-medium">{asset.brand || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Model</div>
                    <div className="font-medium">{asset.model || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">OEM</div>
                    <div className="font-medium">{asset.oem || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">OS Version</div>
                    <div className="font-medium">
                      {asset.operatingSystemVersion || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Release Version
                    </div>
                    <div className="font-medium">
                      {asset.releaseVersion || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">EOL/EOSL Date</div>
                    <div className="font-medium">
                      {asset.eolEoslDate || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Location Status
                    </div>
                    <div className="font-medium">
                      {{
                        IN_STORAGE: "In Storage",
                        WITH_IT: "With IT",
                        IN_USE: "In Use",
                        IN_REPAIR: "In Repair",
                        DISPOSED: "Disposed",
                      }[asset.locationStatus || ""] ||
                        asset.locationStatus ||
                        "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="font-medium">{asset.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="font-medium">
                      {asset.category?.categoryName || "N/A"}
                    </div>
                    {asset.category?.description && (
                      <div className="text-xs text-slate-400 mt-1">
                        {asset.category.description}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Department</div>
                    <div className="font-medium">
                      {asset.department?.departmentName || "N/A"}
                    </div>
                    {asset.department?.description && (
                      <div className="text-xs text-slate-400 mt-1">
                        {asset.department.description}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Branch</div>
                    <div className="font-medium">
                      {asset.branch?.branchName || "N/A"}
                    </div>
                    {asset.branch?.address && (
                      <div className="text-xs text-slate-400 mt-1">
                        {asset.branch.address}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Supplier</div>
                    <div className="font-medium">
                      {asset.supplier?.supplierName || "N/A"}
                    </div>
                    {asset.supplier?.contactPerson && (
                      <div className="text-xs text-slate-400 mt-1">
                        Contact: {asset.supplier.contactPerson}
                      </div>
                    )}
                    {asset.supplier?.contactNumber && (
                      <div className="text-xs text-slate-400">
                        {asset.supplier.contactNumber}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Condition</div>
                    <div className="font-medium">{asset.condition}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Location</div>
                    <div className="font-medium">{asset.locationDetail}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Acquisition Cost
                    </div>
                    <div className="font-medium">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(asset.acquisitionCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Current Book Value
                    </div>
                    <div className="font-medium">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(asset.currentBookValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Depreciation Method
                    </div>
                    <div className="font-medium">
                      {asset.depreciationMethod || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Useful Life (Years)
                    </div>
                    <div className="font-medium">{asset.usefulLifeYears}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Salvage Value</div>
                    <div className="font-medium">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(asset.salvageValue)}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="py-12 text-center text-slate-500">
              No details available.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Asset Modal (skeleton form) */}
      <Dialog
        open={!!editAssetGuid}
        onOpenChange={(open) => !open && setEditAssetGuid(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Edit Asset
            </DialogTitle>
          </DialogHeader>
          {editAssetQuery.isLoading ? (
            <div className="py-12 text-center text-slate-500">Loading…</div>
          ) : editAssetQuery.data?.responseData ? (
            (() => {
              const asset = editAssetQuery?.data?.responseData;
              const nameRef = { current: null as HTMLInputElement | null };
              const serialRef = { current: null as HTMLInputElement | null };
              const tagRef = { current: null as HTMLInputElement | null };
              const brandRef = { current: null as HTMLInputElement | null };
              const modelRef = { current: null as HTMLInputElement | null };
              const oemRef = { current: null as HTMLInputElement | null };
              const osVersionRef = { current: null as HTMLInputElement | null };
              const releaseVersionRef = {
                current: null as HTMLInputElement | null,
              };
              const eolEoslDateRef = {
                current: null as HTMLInputElement | null,
              };
              const locationStatusRef = {
                current: null as HTMLSelectElement | null,
              };
              const conditionRef = { current: null as HTMLInputElement | null };
              const statusRef = { current: null as HTMLInputElement | null };
              const acquisitionDateRef = {
                current: null as HTMLInputElement | null,
              };
              const acquisitionCostRef = {
                current: null as HTMLInputElement | null,
              };
              const currentBookValueRef = {
                current: null as HTMLInputElement | null,
              };
              const locationDetailRef = {
                current: null as HTMLInputElement | null,
              };
              const depreciationMethodRef = {
                current: null as HTMLInputElement | null,
              };
              const usefulLifeYearsRef = {
                current: null as HTMLInputElement | null,
              };
              const salvageValueRef = {
                current: null as HTMLInputElement | null,
              };
              const handleSave = async () => {
                const serialValue = serialRef.current?.value?.trim();
                if (!serialValue) {
                  toast.error("Serial number is required");
                  serialRef.current?.focus();
                  return;
                }
                try {
                  await updateAssetMutation.mutateAsync({
                    guid: asset.guid,
                    assetName: nameRef.current?.value || asset.assetName,
                    serialNumber: serialValue,
                    tagNumber: tagRef.current?.value || asset.tagNumber,
                    categoryGuid:
                      selectedCategoryGuid ||
                      asset.categoryGuid ||
                      asset.category?.guid,
                    departmentGuid:
                      selectedDepartmentGuid ||
                      asset.departmentGuid ||
                      asset.department?.guid,
                    branchGuid:
                      selectedBranchGuid ||
                      asset.branchGuid ||
                      asset.branch?.guid,
                    supplierGuid:
                      selectedSupplierGuid ||
                      asset.supplierGuid ||
                      asset.supplier?.guid,
                    acquisitionDate:
                      acquisitionDateRef.current?.value ||
                      asset.acquisitionDate,
                    acquisitionCost: Number(
                      acquisitionCostRef.current?.value ??
                        asset.acquisitionCost,
                    ),
                    locationDetail:
                      locationDetailRef.current?.value || asset.locationDetail,
                    condition: conditionRef.current?.value || asset.condition,
                    status: statusRef.current?.value || asset.status,
                    depreciationMethod:
                      depreciationMethodRef.current?.value ||
                      asset.depreciationMethod,
                    usefulLifeYears: Number(
                      usefulLifeYearsRef.current?.value ??
                        asset.usefulLifeYears,
                    ),
                    salvageValue: Number(
                      salvageValueRef.current?.value ?? asset.salvageValue,
                    ),
                    t24AssetReference: asset.t24AssetReference || "",
                    lastT24ValuationDate: asset.lastT24ValuationDate || "",
                    custodianGuid:
                      selectedCustodianGuid || asset.custodianGuid || "",
                    oem: oemRef.current?.value || asset.oem || undefined,
                    model: modelRef.current?.value || asset.model,
                    brand: brandRef.current?.value || asset.brand,
                    operatingSystemVersion:
                      osVersionRef.current?.value ||
                      asset.operatingSystemVersion ||
                      undefined,
                    releaseVersion:
                      releaseVersionRef.current?.value ||
                      asset.releaseVersion ||
                      undefined,
                    eolEoslDate:
                      eolEoslDateRef.current?.value ||
                      asset.eolEoslDate ||
                      undefined,
                    locationStatus:
                      locationStatusRef.current?.value ||
                      asset.locationStatus ||
                      undefined,
                  });
                  toast.success("Asset updated successfully");
                  setEditAssetGuid(null);
                } catch {
                  toast.error("Failed to update asset");
                }
              };
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Asset Name
                      </div>
                      <input
                        defaultValue={asset.assetName}
                        ref={nameRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Tag Number
                      </div>
                      <input
                        defaultValue={asset.tagNumber}
                        ref={tagRef}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Brand</div>
                      <input
                        defaultValue={asset.brand || ""}
                        ref={brandRef}
                        placeholder="Enter brand"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Model</div>
                      <input
                        defaultValue={asset.model || ""}
                        ref={modelRef}
                        placeholder="Enter model"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        OEM (Optional)
                      </div>
                      <input
                        defaultValue={asset.oem || ""}
                        ref={oemRef}
                        placeholder="Enter OEM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Serial Number <span className="text-red-500">*</span>
                      </div>
                      <input
                        defaultValue={asset.serialNumber || ""}
                        ref={serialRef}
                        required
                        placeholder="Enter serial number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        OS Version (Optional)
                      </div>
                      <input
                        defaultValue={asset.operatingSystemVersion || ""}
                        ref={osVersionRef}
                        placeholder="Enter OS version"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Release Version (Optional)
                      </div>
                      <input
                        defaultValue={asset.releaseVersion || ""}
                        ref={releaseVersionRef}
                        placeholder="Enter release version"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        EOL/EOSL Date (Optional)
                      </div>
                      <input
                        type="date"
                        defaultValue={asset.eolEoslDate?.slice(0, 10) || ""}
                        ref={eolEoslDateRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Location Status
                      </div>
                      <select
                        defaultValue={asset.locationStatus || ""}
                        ref={locationStatusRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select location status</option>
                        <option value="IN_STORAGE">In Storage</option>
                        <option value="WITH_IT">With IT</option>
                        <option value="IN_USE">In Use</option>
                        <option value="IN_REPAIR">In Repair</option>
                        <option value="DISPOSED">Disposed</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Condition
                      </div>
                      <input
                        defaultValue={asset.condition}
                        ref={conditionRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Status</div>
                      <input
                        defaultValue={asset.status}
                        ref={statusRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Category Name
                      </div>
                      {asset.category?.categoryName && (
                        <div className="text-sm font-medium text-slate-700 mb-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                          Current: {asset.category.categoryName}
                        </div>
                      )}
                      <SearchableSelect
                        options={categoryOptions}
                        value={selectedCategoryGuid}
                        onValueChange={(value) =>
                          setSelectedCategoryGuid(value)
                        }
                        onSearchChange={setCategorySearchTerm}
                        placeholder="Search and select a category..."
                        emptyMessage="No categories found. Try adjusting your search."
                        loading={categoriesLoading}
                        clearable={false}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Department Name
                      </div>
                      {asset.department?.departmentName && (
                        <div className="text-sm font-medium text-slate-700 mb-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                          Current: {asset.department.departmentName}
                        </div>
                      )}
                      <SearchableSelect
                        options={departmentOptions}
                        value={selectedDepartmentGuid}
                        onValueChange={(value) =>
                          setSelectedDepartmentGuid(value)
                        }
                        onSearchChange={setDepartmentSearchTerm}
                        placeholder="Search and select a department..."
                        emptyMessage="No departments found. Try adjusting your search."
                        loading={departmentsLoading}
                        clearable={false}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Branch Name
                      </div>
                      {asset.branch?.branchName && (
                        <div className="text-sm font-medium text-slate-700 mb-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                          Current: {asset.branch.branchName}
                        </div>
                      )}
                      <SearchableSelect
                        options={branchOptions}
                        value={selectedBranchGuid}
                        onValueChange={(value) => setSelectedBranchGuid(value)}
                        onSearchChange={setBranchSearchTerm}
                        placeholder="Search and select a branch..."
                        emptyMessage="No branches found. Try adjusting your search."
                        loading={branchesLoading}
                        clearable={false}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Supplier Name
                      </div>
                      {asset.supplier?.supplierName && (
                        <div className="text-sm font-medium text-slate-700 mb-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                          Current: {asset.supplier.supplierName}
                        </div>
                      )}
                      <SearchableSelect
                        options={supplierOptions}
                        value={selectedSupplierGuid}
                        onValueChange={(value) =>
                          setSelectedSupplierGuid(value)
                        }
                        onSearchChange={setSupplierSearchTerm}
                        placeholder="Search and select a supplier..."
                        emptyMessage="No suppliers found. Try adjusting your search."
                        loading={suppliersLoading}
                        clearable={false}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Acquisition Date
                      </div>
                      <input
                        type="date"
                        defaultValue={asset.acquisitionDate?.slice(0, 10)}
                        ref={acquisitionDateRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Acquisition Cost
                      </div>
                      <input
                        type="number"
                        defaultValue={String(asset.acquisitionCost)}
                        ref={acquisitionCostRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Current Book Value
                      </div>
                      <input
                        type="number"
                        defaultValue={String(asset.currentBookValue)}
                        ref={currentBookValueRef}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Location Detail
                      </div>
                      <input
                        defaultValue={asset.locationDetail}
                        ref={locationDetailRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Depreciation Method
                      </div>
                      <input
                        defaultValue={asset.depreciationMethod}
                        ref={depreciationMethodRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Useful Life (years)
                      </div>
                      <input
                        type="number"
                        defaultValue={String(asset.usefulLifeYears)}
                        ref={usefulLifeYearsRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Salvage Value
                      </div>
                      <input
                        type="number"
                        defaultValue={String(asset.salvageValue)}
                        ref={salvageValueRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Re assign Custodian
                      </div>
                      {asset.custodianName && (
                        <div className="text-sm font-medium text-slate-700 mb-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                          Current: {asset.custodianName}
                        </div>
                      )}
                      <SearchableSelect
                        options={contactOptions}
                        value={selectedCustodianGuid}
                        onValueChange={(value) => {
                          const contact = contacts.find(
                            (c: Contact) => c.email === value,
                          );
                          setSelectedContact(contact || null);
                          setSelectedCustodianGuid(contact?.email || "");
                        }}
                        onSearchChange={handleContactSearch}
                        placeholder="Search and select a contact..."
                        emptyMessage="No contacts found. Try adjusting your search."
                        loading={contactsLoading}
                        clearable={true}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={updateAssetMutation.isPending}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {updateAssetMutation.isPending
                        ? "Saving…"
                        : "Save Changes"}
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="py-12 text-center text-slate-500">No data</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custodian History Modal */}
      <Dialog
        open={!!custodianHistoryGuid}
        onOpenChange={(open) => {
          if (!open) {
            setCustodianHistoryGuid(null);
            setCustodianHistoryAssetName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Custodian History
            </DialogTitle>
            {custodianHistoryAssetName && (
              <p className="text-sm text-slate-500 mt-1">
                Asset:{" "}
                <span className="font-medium text-slate-700">
                  {custodianHistoryAssetName}
                </span>
              </p>
            )}
          </DialogHeader>
          {custodianHistoryQuery.isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              Loading custodian history…
            </div>
          ) : custodianHistoryQuery.data?.responseData &&
            custodianHistoryQuery.data.responseData.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Custodian
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Branch
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Assigned At
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Assigned By
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {custodianHistoryQuery.data.responseData.map(
                      (record: CustodianHistoryRecord, index: number) => (
                        <tr
                          key={record.guid}
                          className={`border-b border-slate-100 ${
                            index === 0 ? "bg-purple-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">
                              {record.custodian?.fullName ||
                                record.custodianName ||
                                "N/A"}
                            </div>
                            {record.custodian?.emailAddress && (
                              <div className="text-xs text-slate-500">
                                {record.custodian.emailAddress}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700">
                              {record.department?.departmentName ||
                                record.custodian?.department?.departmentName ||
                                "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700">
                              {record.branch?.branchName ||
                                record.custodian?.branch?.branchName ||
                                "N/A"}
                            </div>
                            {(record.branch?.address ||
                              record.custodian?.branch?.address) && (
                              <div className="text-xs text-slate-500">
                                {record.branch?.address ||
                                  record.custodian?.branch?.address}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700">
                              {record.assignedAt
                                ? new Date(
                                    record.assignedAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700">
                              {record.assignedBy?.fullName ||
                                record.assignedBy?.displayName ||
                                "N/A"}
                            </div>
                            {record.assignedBy?.emailAddress && (
                              <div className="text-xs text-slate-500">
                                {record.assignedBy.emailAddress}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div
                              className="text-slate-600 max-w-[200px] "
                              title={record.notes || ""}
                            >
                              {record.notes || "-"}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500 text-center pt-2">
                Showing {custodianHistoryQuery.data.responseData.length}{" "}
                record(s)
                {custodianHistoryQuery.data.responseData.length > 0 && (
                  <span className="ml-2">
                    • Most recent assignment highlighted
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <History className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="font-medium">No custodian history found</p>
              <p className="text-sm mt-1">
                This asset has no recorded custodian assignments.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
