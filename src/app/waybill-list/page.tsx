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
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  dummyWaybills,
  waybillStatuses,
  formatWaybillDate,
  getStatusColor,
  type Waybill,
} from "@/lib/waybill-data";

export default function WaybillListPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");

  const handleBack = () => {
    router.back();
  };

  const handleViewWaybill = (waybill: Waybill) => {
    toast.info("View Waybill", {
      description: `Viewing waybill ${waybill.waybillNumber}`,
    });
    // Navigate to waybill detail page
    router.push(`/waybill-details/${waybill.id}`);
  };

  const handleEditWaybill = (waybill: Waybill) => {
    if (waybill.status === "Delivered" || waybill.status === "Cancelled") {
      toast.error("Cannot edit waybill", {
        description: `Waybill ${
          waybill.waybillNumber
        } is ${waybill.status.toLowerCase()} and cannot be edited`,
      });
      return;
    }

    toast.info("Edit Waybill", {
      description: `Editing waybill ${waybill.waybillNumber}`,
    });
    // Navigate to edit waybill page
    router.push(`/waybill/edit/${waybill.id}`);
  };

  const handleDeleteWaybill = (waybill: Waybill) => {
    if (waybill.status !== "Draft") {
      toast.error("Cannot delete waybill", {
        description: `Only draft waybills can be deleted`,
      });
      return;
    }

    toast.error("Delete Waybill", {
      description: `Waybill ${waybill.waybillNumber} has been deleted`,
    });
    // Implement delete logic
  };

  const handleCreateNew = () => {
    router.push("/waybill");
  };

  const columns: ColumnDef<Waybill>[] = [
    {
      accessorKey: "waybillNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Waybill Number
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
        const waybill = row.original;
        return (
          <button
            onClick={() => handleViewWaybill(waybill)}
            className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-orange-50 -mx-3 -my-1.5"
          >
            {waybill.waybillNumber}
          </button>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Date
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
        return formatWaybillDate(row.getValue("date"));
      },
    },
    {
      accessorKey: "fromLocation",
      header: "From",
      cell: ({ row }) => {
        const location = row.getValue("fromLocation") as string;
        return (
          <div className="max-w-[200px] truncate" title={location}>
            {location}
          </div>
        );
      },
    },
    {
      accessorKey: "toLocation",
      header: "To",
      cell: ({ row }) => {
        const location = row.getValue("toLocation") as string;
        return (
          <div className="max-w-[200px] truncate" title={location}>
            {location}
          </div>
        );
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const purpose = row.getValue("purpose") as string;
        return (
          <div className="max-w-[150px] truncate" title={purpose}>
            {purpose}
          </div>
        );
      },
    },
    {
      accessorKey: "deliveredBy",
      header: "Delivered By",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        return (
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "Draft"
                  ? "bg-gray-500"
                  : status === "Approved"
                  ? "bg-green-500"
                  : status === "In Transit"
                  ? "bg-blue-500"
                  : status === "Delivered"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />
            <Badge
              variant="secondary"
              className={`text-xs font-medium border ${getStatusColor(
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
        const waybill = row.original;

        return (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewWaybill(waybill)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-200"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditWaybill(waybill)}
              className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all duration-200"
              disabled={
                waybill.status === "Delivered" || waybill.status === "Cancelled"
              }
              title="Edit Waybill"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteWaybill(waybill)}
              className="h-8 w-8 p-0 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full transition-all duration-200"
              disabled={waybill.status !== "Draft"}
              title="Delete Waybill"
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
    return dummyWaybills.filter((waybill) => {
      const matchesStatus =
        statusFilter === "All" || waybill.status === statusFilter;
      return matchesStatus;
    });
  }, [statusFilter]);

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
      const waybill = row.original;
      const searchableFields = [
        waybill.waybillNumber,
        waybill.deliveredBy,
        waybill.authorisedBy,
        waybill.receivedBy,
        waybill.fromLocation,
        waybill.toLocation,
        waybill.purpose,
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

            <Button
              onClick={handleCreateNew}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Waybill</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Waybill Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all asset transfer waybills
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
              <div className="grid gap-4 md:grid-cols-3">
                {/* Global Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search Waybills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by number, personnel, location..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {waybillStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Info & Actions */}
                <div className="flex items-end justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of{" "}
                    {filteredData.length} waybills
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGlobalFilter("");
                      setStatusFilter("All");
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

          {/* Waybills Table */}
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
                              <FileText className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="text-sm font-medium">
                              No waybills found
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
