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
  assetHistoryData,
  deviceTypes,
  locations,
  deviceStatuses,
  users,
  formatHistoryDate,
  type AssetHistory,
} from "@/lib/asset-history-data";
import {
  exportToCSV,
  formatDateForCSV,
  formatBooleanForCSV,
  generateTimestamp,
  type ExportColumn,
} from "@/lib/csv-export";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  Calendar,
  User,
  MapPin,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetHistoryPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter states
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [movementFilter, setMovementFilter] = useState("All");

  const handleBack = () => {
    router.back();
  };

  const handleViewHistoryDetail = (historyRecord: AssetHistory) => {
    router.push(`/asset-history/${historyRecord.id}`);
  };

  const handleExportHistory = () => {
    try {
      // Define columns for CSV export
      const exportColumns: ExportColumn[] = [
        { key: "serialNumber", header: "S/N" },
        { key: "deviceType", header: "Device Type" },
        { key: "deviceSerialNumber", header: "Device Serial Number" },
        { key: "userDeployedTo", header: "User Deployed To" },
        { key: "locationDeployedTo", header: "Location Deployed To" },
        {
          key: "deviceMovement",
          header: "Device Movement",
          formatter: formatBooleanForCSV,
        },
        { key: "reasonsForUpdate", header: "Reasons For Update/Movement" },
        { key: "deviceStatusAtStartup", header: "Device Status @ Startup" },
        { key: "changedBy", header: "Changed By" },
        {
          key: "changeDate",
          header: "Change Date",
          formatter: formatDateForCSV,
        },
      ];

      // Export filtered data
      const timestamp = generateTimestamp();
      const filename = `asset_history_export_${timestamp}.csv`;

      exportToCSV(filteredData, exportColumns, filename);

      toast.success("Asset history exported successfully!", {
        description: `${filteredData.length} history records exported to ${filename}`,
      });
    } catch {
      toast.error("Export failed", {
        description: "An error occurred while exporting history data.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Live":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case "Faulty":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "Unallocated":
        return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      case "Under Repair":
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Faulty":
        return "bg-red-100 text-red-800 border-red-200";
      case "Unallocated":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Under Repair":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Disposed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Missing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getDeviceTypeColor = (deviceType: string) => {
    switch (deviceType) {
      case "Monitor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CPU":
        return "bg-green-100 text-green-800 border-green-200";
      case "POS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Scanner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Tablets":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "IP Phone":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Printer":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Laptop":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Desktop":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const columns: ColumnDef<AssetHistory>[] = [
    {
      accessorKey: "serialNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            S/N
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
        const historyRecord = row.original;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewHistoryDetail(historyRecord);
            }}
            className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200 px-2 py-1 rounded-md hover:bg-orange-50 -mx-2 -my-1"
          >
            {row.getValue("serialNumber")}
          </button>
        );
      },
    },
    {
      accessorKey: "deviceType",
      header: "Device Type",
      cell: ({ row }) => {
        const deviceType = row.getValue("deviceType") as string;
        if (!deviceType) return <div className="text-slate-400">-</div>;

        return (
          <Badge
            variant="secondary"
            className={`text-xs font-medium border ${getDeviceTypeColor(
              deviceType
            )}`}
          >
            <Smartphone className="h-3 w-3 mr-1" />
            {deviceType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "deviceSerialNumber",
      header: "Device S/N",
      cell: ({ row }) => {
        const serialNumber = row.getValue("deviceSerialNumber") as string;
        if (!serialNumber) return <div className="text-slate-400">-</div>;

        return (
          <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded max-w-[120px] truncate">
            {serialNumber}
          </div>
        );
      },
    },
    {
      accessorKey: "userDeployedTo",
      header: "User Deployed To",
      cell: ({ row }) => {
        const user = row.getValue("userDeployedTo") as string;
        if (!user) return <div className="text-slate-400">-</div>;

        return (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-slate-500" />
            <span className="text-sm text-slate-900">{user}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "locationDeployedTo",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("locationDeployedTo") as string;
        if (!location) return <div className="text-slate-400">-</div>;

        return (
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 text-slate-500" />
            <span className="text-sm text-slate-900 max-w-[100px] truncate">
              {location}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "deviceMovement",
      header: "Movement",
      cell: ({ row }) => {
        const movement = row.getValue("deviceMovement") as number;
        return (
          <div className="text-center">
            <Badge
              variant={movement === 1 ? "default" : "secondary"}
              className={`text-xs font-medium ${
                movement === 1
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {movement === 1 ? "Yes" : "No"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "reasonsForUpdate",
      header: "Reasons For Update/Movement",
      cell: ({ row }) => {
        const reason = row.getValue("reasonsForUpdate") as string;
        if (!reason) return <div className="text-slate-400">-</div>;

        return (
          <div className="max-w-[200px] text-sm text-slate-900">
            <p className="truncate" title={reason}>
              {reason}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "deviceStatusAtStartup",
      header: "Device Status",
      cell: ({ row }) => {
        const status = row.getValue("deviceStatusAtStartup") as string;
        if (!status) return <div className="text-slate-400">-</div>;

        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <Badge
              variant="secondary"
              className={`text-xs font-medium border ${getStatusStyle(status)}`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "changedBy",
      header: "Changed By",
      cell: ({ row }) => {
        const changedBy = row.getValue("changedBy") as string;
        if (!changedBy) return <div className="text-slate-400">-</div>;

        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-orange-700">
                {changedBy.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-900">{changedBy}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "changeDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Change Date
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
        const date = row.getValue("changeDate") as string;
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span className="text-sm text-slate-900">
              {formatHistoryDate(date)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const historyRecord = row.original;

        return (
          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewHistoryDetail(historyRecord);
              }}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
              title="View History Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return assetHistoryData.filter((history) => {
      const matchesDeviceType =
        deviceTypeFilter === "All" || history.deviceType === deviceTypeFilter;
      const matchesLocation =
        locationFilter === "All" ||
        history.locationDeployedTo === locationFilter;
      const matchesStatus =
        statusFilter === "All" ||
        history.deviceStatusAtStartup === statusFilter;
      const matchesUser =
        userFilter === "All" || history.userDeployedTo === userFilter;
      const matchesMovement =
        movementFilter === "All" ||
        (movementFilter === "Yes" && history.deviceMovement === 1) ||
        (movementFilter === "No" && history.deviceMovement === 0);

      // Date range filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const historyDate = new Date(history.changeDate);
        if (dateFromFilter) {
          matchesDateRange =
            matchesDateRange && historyDate >= new Date(dateFromFilter);
        }
        if (dateToFilter) {
          matchesDateRange =
            matchesDateRange && historyDate <= new Date(dateToFilter);
        }
      }

      return (
        matchesDeviceType &&
        matchesLocation &&
        matchesStatus &&
        matchesUser &&
        matchesMovement &&
        matchesDateRange
      );
    });
  }, [
    deviceTypeFilter,
    locationFilter,
    statusFilter,
    userFilter,
    movementFilter,
    dateFromFilter,
    dateToFilter,
  ]);

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
      const history = row.original;
      const searchableFields = [
        history.deviceType,
        history.deviceSerialNumber,
        history.userDeployedTo,
        history.locationDeployedTo,
        history.reasonsForUpdate,
        history.deviceStatusAtStartup,
        history.changedBy,
      ];

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(value.toLowerCase())
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
        pageSize: 15,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
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
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center space-x-3">
              <History className="h-8 w-8 text-orange-600" />
              <span>Asset History & Movement Logs</span>
            </h1>
            <p className="text-muted-foreground">
              Track all asset movements, updates, and status changes across your
              organization
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                {/* Global Search */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="search">Search History</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by device, user, location, reason..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Device Type Filter */}
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select
                    value={deviceTypeFilter}
                    onValueChange={setDeviceTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Device Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* User Filter */}
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Movement Filter */}
                <div className="space-y-2">
                  <Label>Movement</Label>
                  <Select
                    value={movementFilter}
                    onValueChange={setMovementFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Movement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Yes">With Movement</SelectItem>
                      <SelectItem value="No">No Movement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From Filter */}
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>

                {/* Date To Filter */}
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                {/* Results Info */}
                <div className="text-sm text-muted-foreground">
                  Showing {table.getRowModel().rows.length} of{" "}
                  {filteredData.length} history records
                  <span className="block text-xs text-slate-500 mt-1">
                    💡 Click on any row to view detailed information
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleExportHistory}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setGlobalFilter("");
                      setDeviceTypeFilter("All");
                      setLocationFilter("All");
                      setStatusFilter("All");
                      setUserFilter("All");
                      setMovementFilter("All");
                      setDateFromFilter("");
                      setDateToFilter("");
                      toast.success("All filters cleared");
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Clear All Filters</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-0">
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-0 font-semibold text-slate-700 py-4 px-4 first:pl-6 last:pr-6 text-xs whitespace-nowrap"
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
                            border-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-orange-100/30 hover:shadow-sm hover:scale-[1.01]
                            ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                            group cursor-pointer
                          `}
                          onClick={() => handleViewHistoryDetail(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="py-3 px-4 first:pl-6 last:pr-6 border-0 text-xs"
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
                              <History className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="text-sm font-medium">
                              No history records found
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
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t-0 gap-4">
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
                        {[10, 15, 20, 30, 50].map((pageSize) => (
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
