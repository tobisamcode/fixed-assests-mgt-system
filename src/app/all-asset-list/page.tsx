"use client";

import { useState, useMemo } from "react";
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
import {
  dummyAssets,
  assetCategories,
  assetStatuses,
  depreciationStatuses,
  formatCurrency,
  formatDate,
  type Asset,
} from "@/lib/dummy-data";
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

export default function AllAssetListPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "status", value: "Active" }, // Default to Active assets
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [depreciationFilter, setDepreciationFilter] = useState("All");

  const handleBack = () => {
    router.back();
  };

  const handleViewAsset = (asset: Asset) => {
    toast.info("View Asset", {
      description: `Viewing details for ${asset.assetName}`,
    });
    // Navigate to asset detail page
    router.push(`/asset-details/${asset.id}`);
  };

  const handleEditAsset = (asset: Asset) => {
    toast.info("Edit Asset", {
      description: `Editing ${asset.assetName}`,
    });
    // Navigate to edit asset page
    router.push(`/edit-asset/${asset.id}`);
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
        { key: "category", header: "Category" },
        { key: "department", header: "Department" },
        { key: "branch", header: "Branch" },
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
        { key: "supplier", header: "Supplier" },
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const getCategoryColor = (cat: string) => {
          switch (cat) {
            case "Computer Equipment":
              return "bg-blue-100 text-blue-800 border-blue-200";
            case "Office Furniture":
              return "bg-green-100 text-green-800 border-green-200";
            case "Vehicles":
              return "bg-purple-100 text-purple-800 border-purple-200";
            case "Office Equipment":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Building Equipment":
              return "bg-gray-100 text-gray-800 border-gray-200";
            case "Security Equipment":
              return "bg-red-100 text-red-800 border-red-200";
            case "Presentation Equipment":
              return "bg-indigo-100 text-indigo-800 border-indigo-200";
            default:
              return "bg-slate-100 text-slate-800 border-slate-200";
          }
        };
        return (
          <Badge
            variant="secondary"
            className={`text-xs font-medium border ${getCategoryColor(
              category
            )} hover:shadow-sm transition-shadow duration-200`}
          >
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => {
        const branch = row.getValue("branch") as string;
        return <div className="max-w-[150px] truncate">{branch}</div>;
      },
    },
    {
      accessorKey: "acquisitionDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Acquisition Date
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
        return formatDate(row.getValue("acquisitionDate"));
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
            Book Value
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
        const amount = row.getValue("currentBookValue") as number;
        return (
          <div className="text-right font-medium">{formatCurrency(amount)}</div>
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
    return dummyAssets.filter((asset) => {
      const matchesCategory =
        categoryFilter === "All" || asset.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || asset.status === statusFilter;
      const matchesDepreciation =
        depreciationFilter === "All" ||
        asset.depreciationStatus === depreciationFilter;

      return matchesCategory && matchesStatus && matchesDepreciation;
    });
  }, [categoryFilter, statusFilter, depreciationFilter]);

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
        asset.department,
        asset.branch,
        asset.category,
        asset.custodian,
      ];

      return searchableFields.some((field) =>
        field.toLowerCase().includes(value.toLowerCase())
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
                <div className="space-y-2">
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
                      {assetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                {/* Depreciation Status Filter */}
                <div className="space-y-2">
                  <Label>Depreciation Status</Label>
                  <Select
                    value={depreciationFilter}
                    onValueChange={setDepreciationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select depreciation status" />
                    </SelectTrigger>
                    <SelectContent>
                      {depreciationStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Info */}
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground">
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
                    {table.getRowModel().rows?.length ? (
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
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
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
                  <div className="flex w-[100px] items-center justify-center text-sm font-semibold text-slate-700 bg-white rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      className="hidden h-9 w-9 p-0 lg:flex border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-9 w-9 p-0 lg:flex border-slate-200 hover:bg-slate-50 shadow-sm rounded-lg"
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      disabled={!table.getCanNextPage()}
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
    </div>
  );
}
