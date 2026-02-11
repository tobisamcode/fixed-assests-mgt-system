"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
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
  useAuditLogsQuery,
  AuditRecord,
  AuditAction,
} from "@/features/dashboard/audit";
import {
  exportToCSV,
  formatDateForCSV,
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
  Activity,
  XCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// Action display names
const ACTION_DISPLAY_NAMES: Record<AuditAction, string> = {
  ASSIGN_ROLE: "Assign Role",
  CHANGE_PASSWORD: "Change Password",
  PLATFORM_USER_LOGIN: "User Login",
  CREATE_PLATFORM_USER: "Create User",
  CREATE_PLATFORM_ROLE: "Create Role",
  SET_ROLE_PERMISSIONS: "Set Role Permissions",
  CREATE_ROLE_PERMISSION_MAPPING: "Create Role Permission Mapping",
  OTP_REQUEST: "OTP Request",
  UPDATE_SYSTEM_CONFIGURATION: "Update System Config",
  CREATE_ASSET: "Create Asset",
  UPDATE_ASSET: "Update Asset",
  CREATE_CATEGORY: "Create Category",
  UPDATE_CATEGORY: "Update Category",
  CREATE_DEPARTMENT: "Create Department",
  UPDATE_DEPARTMENT: "Update Department",
  CREATE_BRANCH: "Create Branch",
  UPDATE_BRANCH: "Update Branch",
  CREATE_SUPPLIER: "Create Supplier",
  UPDATE_SUPPLIER: "Update Supplier",
  ADD_PERMISSIONS_TO_ROLE: "Add Permissions to Role",
  DEACTIVATE_PLATFORM_USER: "Deactivate User",
  UPDATE_PLATFORM_USER: "Update User",
};

// All available actions for filter
const ALL_ACTIONS: AuditAction[] = [
  "ASSIGN_ROLE",
  "CHANGE_PASSWORD",
  "PLATFORM_USER_LOGIN",
  "CREATE_PLATFORM_USER",
  "CREATE_PLATFORM_ROLE",
  "SET_ROLE_PERMISSIONS",
  "CREATE_ROLE_PERMISSION_MAPPING",
  "OTP_REQUEST",
  "UPDATE_SYSTEM_CONFIGURATION",
  "CREATE_ASSET",
  "UPDATE_ASSET",
  "CREATE_CATEGORY",
  "UPDATE_CATEGORY",
  "CREATE_DEPARTMENT",
  "UPDATE_DEPARTMENT",
  "CREATE_BRANCH",
  "UPDATE_BRANCH",
  "CREATE_SUPPLIER",
  "UPDATE_SUPPLIER",
  "ADD_PERMISSIONS_TO_ROLE",
  "DEACTIVATE_PLATFORM_USER",
  "UPDATE_PLATFORM_USER",
];

export default function AssetHistoryPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // API Query parameters
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchKey, setSearchKey] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "All">("All");
  const [actorFilter, setActorFilter] = useState("");

  // Debounced search and actor filter
  const [debouncedSearchKey, setDebouncedSearchKey] = useState("");
  const [debouncedActorFilter, setDebouncedActorFilter] = useState("");

  // Debounce searchKey
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
      setPageNumber(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedActorFilter(actorFilter);
      setPageNumber(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [actorFilter]);

  useEffect(() => {
    setPageNumber(1);
  }, [actionFilter]);

  const { data, isLoading, isError, error } = useAuditLogsQuery({
    pageNumber,
    pageSize,
    ...(debouncedSearchKey.trim() && { searchKey: debouncedSearchKey.trim() }),
    ...(actionFilter !== "All" && { action: actionFilter as AuditAction }),
    ...(debouncedActorFilter.trim() && { actor: debouncedActorFilter.trim() }),
  });

  const auditRecords = data?.responseData?.records || [];
  const meta = data?.responseData?.meta;

  const handleBack = () => {
    router.back();
  };

  const handleViewHistoryDetail = (record: AuditRecord) => {
    toast.info("Detail view", {
      description: `Viewing details for audit log: ${record.id}`,
    });
  };

  const handleExportHistory = () => {
    try {
      if (!auditRecords.length) {
        toast.error("No data to export", {
          description: "There are no audit log records to export.",
        });
        return;
      }

      const exportColumns: ExportColumn[] = [
        { key: "id", header: "ID" },
        { key: "guid", header: "GUID" },
        { key: "actor", header: "Actor" },
        {
          key: "action",
          header: "Action",
          formatter: (value: unknown) =>
            ACTION_DISPLAY_NAMES[value as AuditAction] || String(value),
        },
        { key: "actionMessage", header: "Action Message" },
        { key: "entity", header: "Entity" },
        { key: "entityId", header: "Entity ID" },
        { key: "ipAddress", header: "IP Address" },
        {
          key: "actionDateTime",
          header: "Action Date & Time",
          formatter: formatDateForCSV,
        },
      ];

      // Export current page data
      const timestamp = generateTimestamp();
      const filename = `audit_logs_export_${timestamp}.csv`;

      exportToCSV(auditRecords, exportColumns, filename);

      toast.success("Audit logs exported successfully!", {
        description: `${auditRecords.length} audit log records exported to ${filename}`,
      });
    } catch {
      toast.error("Export failed", {
        description: "An error occurred while exporting audit log data.",
      });
    }
  };

  const getActionColor = (action: AuditAction) => {
    // Asset-related actions
    if (action.includes("ASSET")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    // User-related actions
    if (action.includes("USER") || action.includes("LOGIN")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    // Role and permission actions
    if (action.includes("ROLE") || action.includes("PERMISSION")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    // Category, Department, Branch, Supplier actions
    if (
      action.includes("CATEGORY") ||
      action.includes("DEPARTMENT") ||
      action.includes("BRANCH") ||
      action.includes("SUPPLIER")
    ) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    // Password and OTP
    if (action.includes("PASSWORD") || action.includes("OTP")) {
      return "bg-pink-100 text-pink-800 border-pink-200";
    }
    // System config
    if (action.includes("SYSTEM")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
    // Default
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "-";
    try {
      const date = new Date(dateTime);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTime;
    }
  };

  const columns: ColumnDef<AuditRecord>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            ID
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
        const record = row.original;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewHistoryDetail(record);
            }}
            className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 -mx-2 -my-1 border border-transparent hover:border-orange-200 hover:shadow-sm"
          >
            #{row.getValue("id")}
          </button>
        );
      },
    },
    {
      accessorKey: "actor",
      header: "Actor",
      cell: ({ row }) => {
        const actor = row.getValue("actor") as string;
        if (!actor) return <div className="text-slate-400 text-sm">-</div>;

        return (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-orange-100">
              <span className="text-sm font-bold text-white">
                {actor.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900">{actor}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.getValue("action") as AuditAction;
        if (!action) return <div className="text-slate-400 text-sm">-</div>;

        return (
          <Badge
            variant="secondary"
            className={`text-xs font-semibold border shadow-sm px-3 py-1.5 rounded-lg ${getActionColor(
              action
            )}`}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            {ACTION_DISPLAY_NAMES[action] || action}
          </Badge>
        );
      },
    },
    {
      accessorKey: "actionMessage",
      header: "Action Message",
      cell: ({ row }) => {
        const message = row.getValue("actionMessage") as string;
        if (!message) return <div className="text-slate-400">-</div>;

        return (
          <div className="max-w-[250px] text-sm text-slate-900">
            <p className="truncate" title={message}>
              {message}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => {
        const entity = row.getValue("entity") as string;
        if (!entity) return <div className="text-slate-400 text-sm">-</div>;

        return (
          <div className="text-sm text-slate-700 font-mono bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm max-w-[120px] truncate font-medium">
            {entity}
          </div>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => {
        const ip = row.getValue("ipAddress") as string;
        if (!ip) return <div className="text-slate-400 text-sm">-</div>;

        return (
          <div className="text-sm text-slate-600 font-mono bg-gradient-to-r from-blue-50 to-indigo-50/50 px-3 py-1.5 rounded-lg border border-blue-200/40 shadow-sm font-medium">
            {ip}
          </div>
        );
      },
    },
    {
      accessorKey: "actionDateTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Date & Time
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
        const date = row.getValue("actionDateTime") as string;
        return (
          <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-lg border border-emerald-200/40 shadow-sm w-fit">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">
              {formatDateTime(date)}
            </span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: auditRecords,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: meta?.numberOfPages || 0,
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
              <span>Audit Logs & Activity History</span>
            </h1>
            <p className="text-muted-foreground">
              Track all system activities, user actions, and administrative
              changes across your organization
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {/* Global Search */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="search">Search Audit Logs</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by actor, action, entity, message..."
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={actionFilter}
                    onValueChange={(value) =>
                      setActionFilter(value as AuditAction | "All")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Actions</SelectItem>
                      {ALL_ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {ACTION_DISPLAY_NAMES[action]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {/* Actor Filter */}
                <div className="space-y-2">
                  <Label htmlFor="actor">Actor (Username/Email)</Label>
                  <Input
                    id="actor"
                    placeholder="Filter by actor..."
                    value={actorFilter}
                    onChange={(e) => setActorFilter(e.target.value)}
                  />
                </div>

                {/* Page Size */}
                <div className="space-y-2">
                  <Label>Rows per page</Label>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPageNumber(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 30, 50, 100].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size} rows
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                {/* Results Info */}
                <div className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <span>Loading...</span>
                  ) : isError ? (
                    <span className="text-red-600">Error loading data</span>
                  ) : (
                    <>
                      Showing{" "}
                      {meta && meta.totalCount !== undefined
                        ? `${
                            (meta.pageNumber - 1) * meta.pageSize + 1
                          }-${Math.min(
                            meta.pageNumber * meta.pageSize,
                            meta.totalCount
                          )} of ${meta.totalCount}`
                        : "0"}{" "}
                      audit log records
                      <span className="block text-xs text-slate-500 mt-1">
                        💡 Click on any row to view detailed information
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleExportHistory}
                    className="flex items-center space-x-2"
                    disabled={isLoading || !auditRecords.length}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchKey("");
                      setActionFilter("All");
                      setActorFilter("");
                      setPageNumber(1);
                      toast.success("All filters cleared");
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

          {/* Audit Logs Table */}
          <Card className="bg-white shadow-xl border border-slate-200/60 overflow-hidden rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="border-b border-slate-200"
                      >
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              className="bg-gradient-to-br from-slate-50 via-slate-50 to-orange-50/30 border-0 font-bold text-slate-800 py-5 px-6 first:pl-8 last:pr-8 text-xs uppercase tracking-wider whitespace-nowrap"
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
                    {isLoading ? (
                      // Glass Skeleton Loader
                      Array.from({ length: 8 }).map((_, index) => (
                        <TableRow
                          key={index}
                          className="border-b border-slate-100/50 animate-pulse"
                          style={{
                            animationDelay: `${index * 75}ms`,
                          }}
                        >
                          {/* ID Column */}
                          <TableCell className="py-4 px-6 first:pl-8">
                            <div className="relative h-8 w-16 overflow-hidden rounded-lg bg-gradient-to-r from-orange-100/40 via-orange-50/60 to-orange-100/40 backdrop-blur-sm">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                            </div>
                          </TableCell>

                          {/* Actor Column */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-2.5">
                              <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-gradient-to-br from-orange-200/50 via-orange-100/70 to-orange-200/50 backdrop-blur-sm shadow-sm">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                              <div className="relative h-5 w-32 overflow-hidden rounded-md bg-gradient-to-r from-slate-200/40 via-slate-100/60 to-slate-200/40 backdrop-blur-sm">
                                <div
                                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                                  style={{ animationDelay: "100ms" }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Action Column */}
                          <TableCell className="py-4 px-6">
                            <div className="relative h-7 w-40 overflow-hidden rounded-lg bg-gradient-to-r from-blue-100/40 via-indigo-50/60 to-blue-100/40 backdrop-blur-sm shadow-sm">
                              <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                style={{ animationDelay: "150ms" }}
                              />
                            </div>
                          </TableCell>

                          {/* Action Message Column */}
                          <TableCell className="py-4 px-6">
                            <div
                              className="relative h-5 overflow-hidden rounded-md bg-gradient-to-r from-slate-200/40 via-slate-100/60 to-slate-200/40 backdrop-blur-sm"
                              style={{
                                width: `${Math.random() * 40 + 60}%`,
                              }}
                            >
                              <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                                style={{ animationDelay: "200ms" }}
                              />
                            </div>
                          </TableCell>

                          {/* Entity Column */}
                          <TableCell className="py-4 px-6">
                            <div className="relative h-6 w-28 overflow-hidden rounded-lg bg-gradient-to-r from-slate-200/50 via-slate-100/70 to-slate-200/50 backdrop-blur-sm shadow-sm">
                              <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                style={{ animationDelay: "250ms" }}
                              />
                            </div>
                          </TableCell>

                          {/* IP Address Column */}
                          <TableCell className="py-4 px-6">
                            <div className="relative h-6 w-32 overflow-hidden rounded-lg bg-gradient-to-r from-blue-100/40 via-indigo-50/60 to-blue-100/40 backdrop-blur-sm shadow-sm">
                              <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </TableCell>

                          {/* Date & Time Column */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="relative h-6 w-36 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-100/40 via-teal-50/60 to-emerald-100/40 backdrop-blur-sm shadow-sm">
                                <div
                                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                  style={{ animationDelay: "350ms" }}
                                />
                              </div>
                            </div>
                          </TableCell>

                        </TableRow>
                      ))
                    ) : isError ? (
                      // Error state
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-48 text-center"
                        >
                          <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
                              <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-base font-semibold text-red-900">
                                Error loading audit logs
                              </div>
                              <div className="text-sm text-red-600">
                                {error?.message || "Please try again later"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={`
                            border-b border-slate-100/50 transition-all duration-300 ease-in-out
                            hover:bg-gradient-to-r hover:from-orange-50/70 hover:to-amber-50/50 
                            hover:shadow-[0_2px_8px_rgba(251,146,60,0.15)]
                            hover:border-orange-200/30
                            ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                            group cursor-pointer relative
                            hover:-translate-y-[1px]
                          `}
                          onClick={() => handleViewHistoryDetail(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="py-4 px-6 first:pl-8 last:pr-8 text-sm transition-colors duration-200"
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
                          className="h-48 text-center"
                        >
                          <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                              <History className="h-8 w-8 text-slate-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-base font-semibold text-slate-700">
                                No audit log records found
                              </div>
                              <div className="text-sm text-slate-500">
                                Try adjusting your search or filters
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-br from-slate-50/80 via-white to-orange-50/20 border-t border-slate-200/60 gap-6">
                {/* Page Info */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
                      <span className="text-white font-bold text-sm">
                        {meta?.pageNumber || 0}
                      </span>
                    </div>
                    <div className="h-5 w-px bg-slate-300" />
                    <div className="text-sm">
                      <span className="text-slate-500 font-medium">of</span>
                      <span className="text-slate-700 font-bold ml-1.5">
                        {meta?.numberOfPages || 0}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block text-sm text-slate-600 font-medium">
                    {meta && meta.totalCount !== undefined ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-500">Total:</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
                          {meta.totalCount.toLocaleString()}
                        </span>
                        <span className="text-slate-500">records</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">No data</span>
                    )}
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex h-10 w-10 p-0 rounded-xl border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPageNumber(1)}
                    disabled={!meta || pageNumber <= 1 || isLoading}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-3" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() =>
                      setPageNumber((prev) => Math.max(1, prev - 1))
                    }
                    disabled={!meta || pageNumber <= 1 || isLoading}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="hidden md:flex items-center gap-1">
                    {meta && meta.numberOfPages > 0 && (
                      <>
                        {/* Show first page */}
                        {pageNumber > 2 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 text-sm font-medium transition-all duration-200"
                              onClick={() => setPageNumber(1)}
                            >
                              1
                            </Button>
                            {pageNumber > 3 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                          </>
                        )}

                        {/* Show previous page */}
                        {pageNumber > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 text-sm font-medium transition-all duration-200"
                            onClick={() => setPageNumber(pageNumber - 1)}
                          >
                            {pageNumber - 1}
                          </Button>
                        )}

                        {/* Current page */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                          disabled
                        >
                          {pageNumber}
                        </Button>

                        {/* Show next page */}
                        {pageNumber < meta.numberOfPages && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 text-sm font-medium transition-all duration-200"
                            onClick={() => setPageNumber(pageNumber + 1)}
                          >
                            {pageNumber + 1}
                          </Button>
                        )}

                        {/* Show last page */}
                        {pageNumber < meta.numberOfPages - 1 && (
                          <>
                            {pageNumber < meta.numberOfPages - 2 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 text-sm font-medium transition-all duration-200"
                              onClick={() => setPageNumber(meta.numberOfPages)}
                            >
                              {meta.numberOfPages}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() =>
                      setPageNumber((prev) =>
                        Math.min(meta?.numberOfPages || 1, prev + 1)
                      )
                    }
                    disabled={
                      !meta ||
                      pageNumber >= (meta?.numberOfPages || 1) ||
                      isLoading
                    }
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex h-10 w-10 p-0 rounded-xl border-slate-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPageNumber(meta?.numberOfPages || 1)}
                    disabled={
                      !meta ||
                      pageNumber >= (meta?.numberOfPages || 1) ||
                      isLoading
                    }
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronRight className="h-4 w-4 -mr-3" />
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
