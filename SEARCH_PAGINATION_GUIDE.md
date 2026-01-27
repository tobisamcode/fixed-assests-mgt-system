# Search & Pagination Implementation Guide

This guide shows how to implement search and pagination for Department, Supplier, Category, and Branch tables.

## API Query Parameters

All four modules now support the following query parameters:

```typescript
{
  searchKey?: string;    // Search term
  pageNumber?: number;   // Page number (default: 1)
  pageSize?: number;     // Items per page (default: 10)
}
```

## Updated Modules

### 1. **Departments**

- Type: `DepartmentQueryParams`
- Hook: `useDepartmentsQuery(params?)`
- API: `departmentApi.getDepartments(params?)`

### 2. **Suppliers**

- Type: `SupplierQueryParams`
- Hook: `useSuppliersQuery(params?)`
- API: `supplierApi.getSuppliers(params?)`

### 3. **Categories**

- Type: `CategoryQueryParams`
- Hook: `useCategoriesQuery(params?)`
- API: `categoryApi.getCategories(params?)`

### 4. **Branches**

- Type: `BranchesQueryParams`
- Hook: `useBranches(params?)`
- API: `branchesApi.getBranches(params?)`

---

## Implementation Example

Here's a complete example for any of the four modules (using Department as example):

### Component Implementation

```tsx
"use client";

import { useState, useEffect } from "react";
import { useDepartmentsQuery } from "@/features/dashboard/departments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function DepartmentsTable() {
  // State for pagination and search
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKey, setSearchKey] = useState("");

  // Debounced search state
  const [debouncedSearchKey, setDebouncedSearchKey] = useState("");

  // Debounce searchKey
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
      setPageNumber(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKey]);

  // Fetch data with query params
  const { data, isLoading, isError } = useDepartmentsQuery({
    pageNumber,
    pageSize,
    ...(debouncedSearchKey.trim() && { searchKey: debouncedSearchKey.trim() }),
  });

  const departments = data?.responseData?.records || [];
  const meta = data?.responseData?.meta;

  return (
    <div className="space-y-6">
      {/* Search and Page Size Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Show:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageNumber(1);
            }}
          >
            <SelectTrigger className="w-20">
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

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-red-500">
                  Error loading departments
                </td>
              </tr>
            ) : departments.length > 0 ? (
              departments.map((dept) => (
                <tr key={dept.guid} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">{dept.departmentName}</td>
                  <td className="px-4 py-3">{dept.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && (
        <div className="flex items-center justify-between">
          {/* Page Info */}
          <div className="text-sm text-slate-600">
            Showing {(meta.page - 1) * meta.perPage + 1} to{" "}
            {Math.min(meta.page * meta.perPage, meta.total)} of {meta.total}{" "}
            results
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(1)}
              disabled={pageNumber <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-3" />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Current Page Info */}
            <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold">
              {pageNumber} / {meta.pageCount}
            </div>

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPageNumber((prev) => Math.min(meta.pageCount, prev + 1))
              }
              disabled={pageNumber >= meta.pageCount || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(meta.pageCount)}
              disabled={pageNumber >= meta.pageCount || isLoading}
            >
              <ChevronRight className="h-4 w-4 -mr-3" />
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Quick Implementation for Each Module

### **Suppliers**

```tsx
import { useSuppliersQuery } from "@/features/dashboard/supplier";

const { data } = useSuppliersQuery({
  searchKey: "search term",
  pageNumber: 1,
  pageSize: 10,
});

const suppliers = data?.responseData?.records || [];
const meta = data?.responseData?.meta;
```

### **Categories**

```tsx
import { useCategoriesQuery } from "@/features/dashboard/category";

const { data } = useCategoriesQuery({
  searchKey: "search term",
  pageNumber: 1,
  pageSize: 10,
});

const categories = data?.responseData?.records || [];
const meta = data?.responseData?.meta;
```

### **Branches**

```tsx
import { useBranches } from "@/features/dashboard/branches";

const { data } = useBranches({
  searchKey: "search term",
  pageNumber: 1,
  pageSize: 10,
});

const branches = data?.responseData?.records || [];
const meta = data?.responseData?.meta;
```

### **Departments**

```tsx
import { useDepartmentsQuery } from "@/features/dashboard/departments";

const { data } = useDepartmentsQuery({
  searchKey: "search term",
  pageNumber: 1,
  pageSize: 10,
});

const departments = data?.responseData?.records || [];
const meta = data?.responseData?.meta;
```

---

## Response Structure

All modules return the same response structure:

```typescript
{
  responseCode: string;
  responseMessage: string;
  errors: any[];
  responseData: {
    meta: {
      page: number;        // Current page
      perPage: number;     // Items per page
      total: number;       // Total items
      pageCount: number;   // Total pages
    };
    records: T[];          // Array of records
  };
}
```

---

## Key Features Implemented

✅ **Search with debouncing** (500ms delay)  
✅ **Server-side pagination**  
✅ **Configurable page sizes**  
✅ **Automatic page reset on search**  
✅ **Loading and error states**  
✅ **Type-safe query parameters**  
✅ **React Query caching and invalidation**

---

## Notes

1. **Debouncing**: Search queries are debounced by 500ms to avoid excessive API calls
2. **Page Reset**: When searching, the page automatically resets to page 1
3. **Trim Search**: Empty or whitespace-only search terms are not sent to the API
4. **Query Keys**: React Query automatically manages cache based on parameters
5. **Stale Time**: All queries have a 5-minute stale time by default

---

## Migration Notes

If you have existing components using these queries without parameters, you can still call them the same way:

```tsx
// Still works - fetches with default parameters
const { data } = useDepartmentsQuery();
```

The parameters are optional, so existing code won't break! 🎉

