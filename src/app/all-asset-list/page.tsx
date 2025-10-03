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
} from "@/features/dashboard/assets/services/queries";
import { useUpdateAssetMutation } from "@/features/dashboard/assets/services/mutations";
import { Asset as ApiAsset } from "@/features/dashboard/assets/type";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import {
  Contact,
  useContactsQuery,
} from "@/features/dashboard/admin-management";

// Asset interface for the component (compatible with existing table structure)
interface Asset {
  id: string;
  tagNumber: string;
  assetName: string;
  serialNumber: string;
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
  status: "Active" | "Disabled" | "Disposed";
  condition: string;
  custodian: string;
  location: string;
  depreciationStatus: "Current" | "Fully Depreciated" | "Partially Depreciated";
}

export default function AllAssetListPage() {
  const router = useRouter();

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleContactSearch = (search: string) => {
    setContactSearchTerm(search);
  };
  const { data: contactsData, isLoading: contactsLoading } = useContactsQuery(
    contactSearchTerm ? { search: contactSearchTerm } : undefined
  );
  const contacts = contactsData?.responseData?.records || [];

  const contactOptions: SearchableSelectOption[] = contacts.map(
    (contact: Contact) => ({
      value: contact.email,
      label: contact.name,
      description: `${contact.email} • ${contact.username}`,
    })
  );

  // API calls
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewAssetGuid, setViewAssetGuid] = useState<string | null>(null);
  const [editAssetGuid, setEditAssetGuid] = useState<string | null>(null);

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
        s: string | undefined
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
        status: mapStatus(apiAsset.status as unknown as string),
        condition: apiAsset.condition,
        custodian: custodianName || "",
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
  const updateAssetMutation = useUpdateAssetMutation();

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
        { key: "status", header: "Status" },
        { key: "condition", header: "Condition" },
        { key: "custodian", header: "Custodian" },
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
        return (
          <div className="max-w-[200px]">
            <div className="font-semibold text-slate-900 mb-1">
              {row.getValue("assetName")}
            </div>
            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full inline-block">
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
          <div className="max-w-[200px]">
            <Badge
              variant="secondary"
              className={`text-xs font-medium border ${getCategoryColor(
                categoryName
              )} hover:shadow-sm transition-shadow duration-200`}
            >
              {categoryName}
            </Badge>
            {categoryDescription && (
              <div className="text-xs text-slate-500 mt-1 truncate">
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
          <div className="max-w-[180px]">
            <div className="font-medium text-slate-900">{departmentName}</div>
            {departmentDescription && (
              <div className="text-xs text-slate-500 truncate">
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
          <div className="max-w-[180px]">
            <div className="font-medium text-slate-900">{branchName}</div>
            {branchAddress && (
              <div className="text-xs text-slate-500 truncate">
                {branchAddress}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Supplier
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
        const supplierName = row.getValue("supplierName") as string;
        const supplierContactPerson = row.original.supplierContactPerson;
        const supplierContactNumber = row.original.supplierContactNumber;
        const supplierEmail = row.original.supplierEmail;
        return (
          <div className="max-w-[220px]">
            <div className="font-medium text-slate-900">{supplierName}</div>
            {supplierContactPerson && (
              <div className="text-xs text-slate-500 truncate">
                {supplierContactPerson}
              </div>
            )}
            {supplierContactNumber && (
              <div className="text-xs text-slate-500 truncate">
                {supplierContactNumber}
              </div>
            )}
            {supplierEmail && (
              <div className="text-xs text-slate-400 truncate">
                {supplierEmail}
              </div>
            )}
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
                status
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
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewAsset(asset)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditAsset(asset)}
              className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all duration-200"
              title="Edit Asset"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDisableAsset(asset)}
              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 rounded-full transition-all duration-200 disabled:opacity-30"
              disabled={asset.status === "Disabled"}
              title={
                asset.status === "Disabled" ? "Asset Disabled" : "Disable Asset"
              }
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveAsset(asset)}
              className="h-8 w-8 p-0 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full transition-all duration-200"
              title="Remove Asset"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
        asset.custodian,
      ];

      const query = String(value ?? "").toLowerCase();
      if (!query) return true;

      return searchableFields.some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(query)
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
              <div className="overflow-hidden">
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
                                    header.getContext()
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
                                cell.getContext()
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
                          assetsData?.responseData?.meta?.numberOfPages || 1
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
                    <div className="font-medium">{asset.serialNumber}</div>
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
              const conditionRef = { current: null as HTMLInputElement | null };
              const statusRef = { current: null as HTMLInputElement | null };
              const categoryGuidRef = {
                current: null as HTMLInputElement | null,
              };
              const departmentGuidRef = {
                current: null as HTMLInputElement | null,
              };
              const branchGuidRef = {
                current: null as HTMLInputElement | null,
              };
              const supplierGuidRef = {
                current: null as HTMLInputElement | null,
              };
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
              const t24AssetReferenceRef = {
                current: null as HTMLInputElement | null,
              };
              const lastT24ValuationDateRef = {
                current: null as HTMLInputElement | null,
              };
              const handleSave = async () => {
                try {
                  await updateAssetMutation.mutateAsync({
                    guid: asset.guid,
                    assetName: nameRef.current?.value || asset.assetName,
                    serialNumber:
                      serialRef.current?.value || asset.serialNumber,
                    tagNumber: tagRef.current?.value || asset.tagNumber,
                    categoryGuid:
                      categoryGuidRef.current?.value || asset.categoryGuid,
                    departmentGuid:
                      departmentGuidRef.current?.value || asset.departmentGuid,
                    branchGuid:
                      branchGuidRef.current?.value || asset.branchGuid,
                    supplierGuid:
                      supplierGuidRef.current?.value || asset.supplierGuid,
                    acquisitionDate:
                      acquisitionDateRef.current?.value ||
                      asset.acquisitionDate,
                    acquisitionCost: Number(
                      acquisitionCostRef.current?.value ?? asset.acquisitionCost
                    ),
                    currentBookValue: Number(
                      currentBookValueRef.current?.value ??
                        asset.currentBookValue
                    ),
                    locationDetail:
                      locationDetailRef.current?.value || asset.locationDetail,
                    condition: conditionRef.current?.value || asset.condition,
                    status: statusRef.current?.value || asset.status,
                    depreciationMethod:
                      depreciationMethodRef.current?.value ||
                      asset.depreciationMethod,
                    usefulLifeYears: Number(
                      usefulLifeYearsRef.current?.value ?? asset.usefulLifeYears
                    ),
                    salvageValue: Number(
                      salvageValueRef.current?.value ?? asset.salvageValue
                    ),
                    t24AssetReference:
                      t24AssetReferenceRef.current?.value ||
                      asset.t24AssetReference,
                    lastT24ValuationDate:
                      lastT24ValuationDateRef.current?.value ||
                      asset.lastT24ValuationDate,
                    custodian: selectedContact?.name || "",
                  });
                  if (updateAssetMutation.isSuccess) {
                    toast.success("Asset updated successfully");
                  } else {
                    toast.error("Failed to update asset");
                  }
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
                        Serial Number
                      </div>
                      <input
                        defaultValue={asset.serialNumber}
                        ref={serialRef}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
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
                        Category GUID
                      </div>
                      <input
                        defaultValue={asset.categoryGuid}
                        ref={categoryGuidRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Department GUID
                      </div>
                      <input
                        defaultValue={asset.departmentGuid}
                        ref={departmentGuidRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Branch GUID
                      </div>
                      <input
                        defaultValue={asset.branchGuid}
                        ref={branchGuidRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Supplier GUID
                      </div>
                      <input
                        defaultValue={asset.supplierGuid}
                        ref={supplierGuidRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        T24 Asset Reference
                      </div>
                      <input
                        defaultValue={asset.t24AssetReference}
                        ref={t24AssetReferenceRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Last T24 Valuation Date
                      </div>
                      <input
                        type="datetime-local"
                        defaultValue={asset.lastT24ValuationDate?.slice(0, 16)}
                        ref={lastT24ValuationDateRef}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Custodian
                      </div>

                      <SearchableSelect
                        options={contactOptions}
                        value={selectedContact?.email || ""}
                        onValueChange={(value) => {
                          const contact = contacts.find(
                            (c: Contact) => c.email === value
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
    </div>
  );
}
