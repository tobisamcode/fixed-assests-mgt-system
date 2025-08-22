"use client";

import { useState } from "react";
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
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterNewAssetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      custodian: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: AssetFormData) => {
    setIsLoading(true);
    clearErrors();

    try {
      // Simulate API call - replace with actual asset creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Asset data:", data);

      toast.success("Asset registered successfully!", {
        description: `${data.assetName} has been added to the system.`,
      });

      // Redirect to asset list or dashboard
      router.push("/dashboard");
    } catch {
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

  // Mock data for dropdowns - replace with actual API calls
  const assetCategories = [
    { value: "computer-equipment", label: "Computer Equipment" },
    { value: "office-furniture", label: "Office Furniture" },
    { value: "vehicles", label: "Vehicles" },
    { value: "machinery", label: "Machinery" },
    { value: "building-equipment", label: "Building Equipment" },
  ];

  const departments = [
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "it", label: "Information Technology" },
    { value: "operations", label: "Operations" },
    { value: "marketing", label: "Marketing" },
  ];

  const branches = [
    { value: "head-office", label: "Head Office" },
    { value: "branch-1", label: "Branch 1 - Downtown" },
    { value: "branch-2", label: "Branch 2 - Uptown" },
    { value: "branch-3", label: "Branch 3 - Westside" },
  ];

  const suppliers = [
    { value: "supplier-1", label: "TechCorp Solutions" },
    { value: "supplier-2", label: "Office Plus Ltd" },
    { value: "supplier-3", label: "Industrial Supply Co" },
    { value: "supplier-4", label: "Modern Furniture Inc" },
  ];

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
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Add New Fixed Asset
            </h1>
            <p className="text-muted-foreground">
              Register a new asset in the Fixed Assets Management System
            </p>
          </div>

          {/* Form */}
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
                {/* Basic Information */}
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

                {/* Category and Date */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Asset Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("assetCategory", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.assetCategory ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select asset category" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                {/* Cost and Financial */}
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

                {/* Location Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Department/Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("department", value)}
                    >
                      <SelectTrigger
                        className={errors.department ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={(value) => setValue("branch", value)}
                    >
                      <SelectTrigger
                        className={errors.branch ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.value} value={branch.value}>
                            {branch.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                {/* Supplier and Warranty */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium required">
                      Supplier <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("supplier", value)}
                    >
                      <SelectTrigger
                        className={errors.supplier ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.value}
                            value={supplier.value}
                          >
                            {supplier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                {/* Condition and Depreciation */}
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

                {/* Additional Information */}
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

                  <FormField
                    label="Custodian"
                    placeholder="Enter custodian name"
                    error={errors.custodian}
                    touched={touchedFields.custodian}
                    required
                    {...register("custodian")}
                    description="Person responsible for this asset"
                  />
                </div>

                {/* Form Summary Errors */}
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

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
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
                      Object.keys(errors).length > 0
                    }
                  >
                    {isLoading || isSubmitting ? (
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
