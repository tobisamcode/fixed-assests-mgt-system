"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import { assetSchema, type AssetFormData } from "@/lib/validations";
import { useCreateAssetMutation } from "@/features/dashboard/assets/services/mutations";
import type { CreateAssetRequest } from "@/features/dashboard/assets/type";
import { useCategoriesQuery } from "@/features/dashboard/category/services/queries";
import { useDepartmentsQuery } from "@/features/dashboard/departments/services/queries";
import { useBranches } from "@/features/dashboard/branches/services/queries";
import { useSuppliersQuery } from "@/features/dashboard/supplier/services/queries";
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import {
  Contact,
  useContactsQuery,
} from "@/features/dashboard/admin-management";

export default function RegisterNewAssetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const createAssetMutation = useCreateAssetMutation();

  const sanitizeCustodianName = (name: string) => {
    const cleaned = name
      .replace(/[^a-zA-Z\s'.-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned;
  };

  // Search states for each resource type
  const [categorySearch, setCategorySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  // Selected values state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Debounced search states
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

  // Debounce search terms (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorySearchTerm(categorySearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDepartmentSearchTerm(departmentSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [departmentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBranchSearchTerm(branchSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [branchSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSupplierSearchTerm(supplierSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [supplierSearch]);

  // API calls for dropdown data with search support
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery(
    categorySearchTerm ? { searchKey: categorySearchTerm } : undefined
  );
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useDepartmentsQuery(
    departmentSearchTerm ? { searchKey: departmentSearchTerm } : undefined
  );
  const {
    data: branchesData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranches(
    branchSearchTerm ? { searchKey: branchSearchTerm } : undefined
  );
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSuppliersQuery(
    supplierSearchTerm ? { searchKey: supplierSearchTerm } : undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assetName: "",
      serialNumber: "",
      assetCategory: "",
      acquisitionDate: "",
      acquisitionCost: 0,
      department: "",
      branch: "",
      locationDetail: "",
      supplier: "",
      warrantyStart: "",
      warrantyEnd: "",
      condition: "good" as const,
      depreciationMethod: "straight-line" as const,
      usefulLife: 5,
      salvageValue: 0,
      t24AssetId: "",
      // custodian: "",
    },
    mode: "onChange",
  });

  const transformFormDataToApiRequest = (
    data: AssetFormData
  ): CreateAssetRequest => {
    const custodianName = sanitizeCustodianName(
      selectedContact?.name ?? data.custodian
    );
    return {
      assetName: data.assetName,
      serialNumber: data.serialNumber,
      tagNumber: data.serialNumber,
      categoryGuid: data.assetCategory,
      departmentGuid: data.department,
      branchGuid: data.branch,
      supplierGuid: data.supplier,
      acquisitionDate: data.acquisitionDate,
      acquisitionCost: data.acquisitionCost,
      currentBookValue: data.acquisitionCost,
      locationDetail: data.locationDetail,
      condition: data.condition,
      status: "active",
      depreciationMethod: data.depreciationMethod,
      usefulLifeYears: data.usefulLife,
      salvageValue: data.salvageValue,
      t24AssetReference: data.t24AssetId,
      lastT24ValuationDate: new Date().toISOString(),
      custodian: custodianName,
    };
  };

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

  const onSubmit = async (data: AssetFormData) => {
    setIsLoading(true);
    clearErrors();

    try {
      const apiRequest = transformFormDataToApiRequest(data);

      console.log("apiRequest", apiRequest);
      const res = await createAssetMutation.mutateAsync(apiRequest);

      console.log(res);

      if (res.responseCode === "00") {
        toast.success("Asset registered successfully!", {
          description: `${data.assetName} has been added to the system.`,
        });
        router.push("/all-asset-list");
      } else {
        toast.error("Failed to register asset", {
          description: "Please check your data and try again.",
        });
      }
    } catch (error) {
      console.error("Failed to create asset:", error);
      toast.error("Failed to register asset", {
        description: "Please check your data and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Transform API data to SearchableSelectOption format with GUIDs as values
  const assetCategories: SearchableSelectOption[] =
    categoriesData?.responseData?.records?.map((category) => ({
      value: category.guid,
      label: category.categoryName,
      description: category.description || undefined,
    })) || [];

  const departments: SearchableSelectOption[] =
    departmentsData?.responseData?.records?.map((department) => ({
      value: department.guid,
      label: department.departmentName,
      description: department.description || undefined,
    })) || [];

  const branches: SearchableSelectOption[] =
    branchesData?.responseData?.records?.map((branch) => ({
      value: branch.guid,
      label: branch.branchName,
      description: branch.address || branch.description || undefined,
    })) || [];

  const suppliers: SearchableSelectOption[] =
    suppliersData?.responseData?.records?.map((supplier) => ({
      value: supplier.guid,
      label: supplier.supplierName,
      description: supplier.contactPerson
        ? `${supplier.contactPerson} • ${supplier.contactNumber || ""}`
        : supplier.description || undefined,
    })) || [];

  const conditions = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "damaged", label: "Damaged" },
  ];

  const depreciationMethods = [
    { value: "straight-line", label: "Straight Line" },
    { value: "declining-balance", label: "Declining Balance" },
    { value: "sum-of-years", label: "Sum of Years" },
    { value: "units-of-production", label: "Units of Production" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
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

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Add New Fixed Asset
            </h1>
            <p className="text-muted-foreground">
              Register a new asset in the Fixed Assets Management System
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="bg-orange-100 rounded-full p-2">
                  <Save className="h-5 w-5 text-orange-600" />
                </div>
                <span>Asset Information</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="Asset Name"
                    placeholder="Enter asset name"
                    error={errors.assetName}
                    touched={touchedFields.assetName}
                    required
                    {...register("assetName")}
                  />

                  <FormField
                    label="Serial Number"
                    placeholder="Enter serial number"
                    error={errors.serialNumber}
                    touched={touchedFields.serialNumber}
                    required
                    {...register("serialNumber")}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Asset Category <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      options={assetCategories}
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        setValue("assetCategory", value);
                      }}
                      onSearchChange={setCategorySearch}
                      placeholder="Search and select category..."
                      emptyMessage="No categories found. Try a different search."
                      loading={categoriesLoading}
                      disabled={!!categoriesError}
                      clearable
                    />
                    {errors.assetCategory && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.assetCategory.message}
                      </p>
                    )}
                  </div>

                  <FormField
                    label="Acquisition Date"
                    type="date"
                    error={errors.acquisitionDate}
                    touched={touchedFields.acquisitionDate}
                    required
                    {...register("acquisitionDate")}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    label="Acquisition Cost"
                    type="number"
                    placeholder="0.00"
                    error={errors.acquisitionCost}
                    touched={touchedFields.acquisitionCost}
                    required
                    {...register("acquisitionCost", { valueAsNumber: true })}
                  />

                  <FormField
                    label="Useful Life (Years)"
                    type="number"
                    placeholder="5"
                    error={errors.usefulLife}
                    touched={touchedFields.usefulLife}
                    required
                    {...register("usefulLife", { valueAsNumber: true })}
                  />

                  <FormField
                    label="Salvage Value"
                    type="number"
                    placeholder="0.00"
                    error={errors.salvageValue}
                    touched={touchedFields.salvageValue}
                    required
                    {...register("salvageValue", { valueAsNumber: true })}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Department/Unit <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      options={departments}
                      value={selectedDepartment}
                      onValueChange={(value) => {
                        setSelectedDepartment(value);
                        setValue("department", value);
                      }}
                      onSearchChange={setDepartmentSearch}
                      placeholder="Search and select department..."
                      emptyMessage="No departments found. Try a different search."
                      loading={departmentsLoading}
                      disabled={!!departmentsError}
                      clearable
                    />
                    {errors.department && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Branch <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      options={branches}
                      value={selectedBranch}
                      onValueChange={(value) => {
                        setSelectedBranch(value);
                        setValue("branch", value);
                      }}
                      onSearchChange={setBranchSearch}
                      placeholder="Search and select branch..."
                      emptyMessage="No branches found. Try a different search."
                      loading={branchesLoading}
                      disabled={!!branchesError}
                      clearable
                    />
                    {errors.branch && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.branch.message}
                      </p>
                    )}
                  </div>
                </div>

                <FormField
                  label="Location Detail"
                  placeholder="Specific location within the branch"
                  error={errors.locationDetail}
                  touched={touchedFields.locationDetail}
                  required
                  {...register("locationDetail")}
                />

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium required">
                      Supplier <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      options={suppliers}
                      value={selectedSupplier}
                      onValueChange={(value) => {
                        setSelectedSupplier(value);
                        setValue("supplier", value);
                      }}
                      onSearchChange={setSupplierSearch}
                      placeholder="Search and select supplier..."
                      emptyMessage="No suppliers found. Try a different search."
                      loading={suppliersLoading}
                      disabled={!!suppliersError}
                      clearable
                    />
                    {errors.supplier && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.supplier.message}
                      </p>
                    )}
                  </div>

                  <FormField
                    label="Warranty Start"
                    type="date"
                    error={errors.warrantyStart}
                    touched={touchedFields.warrantyStart}
                    required
                    {...register("warrantyStart")}
                  />

                  <FormField
                    label="Warranty End"
                    type="date"
                    error={errors.warrantyEnd}
                    touched={touchedFields.warrantyEnd}
                    required
                    {...register("warrantyEnd")}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Condition <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue(
                          "condition",
                          value as AssetFormData["condition"]
                        )
                      }
                    >
                      <SelectTrigger
                        className={errors.condition ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem
                            key={condition.value}
                            value={condition.value}
                          >
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.condition.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Depreciation Method{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue(
                          "depreciationMethod",
                          value as AssetFormData["depreciationMethod"]
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.depreciationMethod ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select depreciation method" />
                      </SelectTrigger>
                      <SelectContent>
                        {depreciationMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.depreciationMethod && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.depreciationMethod.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="T24 Asset ID"
                    placeholder="Enter T24 Asset ID for linking"
                    error={errors.t24AssetId}
                    touched={touchedFields.t24AssetId}
                    required
                    {...register("t24AssetId")}
                    description="Used for integration with T24 banking system"
                  />

                  <div className="flex flex-col">
                    <p>Custodian</p>
                    <SearchableSelect
                      options={contactOptions}
                      value={selectedContact?.email || ""}
                      onValueChange={(value) => {
                        const contact = contacts.find(
                          (c: Contact) => c.email === value
                        );
                        setSelectedContact(contact || null);
                        setValue(
                          "custodian",
                          sanitizeCustodianName(contact?.name ?? ""),
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          }
                        );
                        if (contact?.name) {
                          clearErrors("custodian");
                        }
                      }}
                      onSearchChange={handleContactSearch}
                      placeholder="Search and select a contact..."
                      emptyMessage="No contacts found. Try adjusting your search."
                      loading={contactsLoading}
                      clearable={true}
                    />
                    {errors.custodian && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.custodian.message}
                      </p>
                    )}
                  </div>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </p>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1 ml-7">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error?.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading || createAssetMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white flex items-center space-x-2"
                    disabled={
                      isLoading ||
                      isSubmitting ||
                      createAssetMutation.isPending ||
                      Object.keys(errors).length > 0
                    }
                  >
                    {isLoading ||
                    isSubmitting ||
                    createAssetMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Asset...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Asset</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
