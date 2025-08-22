"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  dummyAssets,
  formatCurrency,
  formatDate,
  type Asset,
} from "@/lib/dummy-data";
import {
  ArrowLeft,
  Edit,
  Power,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  Package,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const assetId = params.id as string;
    // Find asset by ID
    const foundAsset = dummyAssets.find((a) => a.id === assetId);
    setAsset(foundAsset || null);
    setLoading(false);
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  const handleEditAsset = () => {
    if (asset) {
      toast.info("Edit Asset", {
        description: `Editing ${asset.assetName}`,
      });
      // router.push(`/edit-asset/${asset.id}`);
    }
  };

  const handleDisableAsset = () => {
    if (asset) {
      toast.warning("Disable Asset", {
        description: `${asset.assetName} has been disabled`,
      });
      // Implement disable logic
    }
  };

  const handleRemoveAsset = () => {
    if (asset) {
      toast.error("Remove Asset", {
        description: `${asset.assetName} has been removed`,
      });
      // Implement remove logic
      router.push("/all-asset-list");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
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

        <main className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Asset Not Found
              </h1>
              <p className="text-slate-600 mb-6">
                The asset you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <Button onClick={handleBack} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "Disabled":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "Disposed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Disabled":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Disposed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleEditAsset}
                className="flex-1 sm:flex-none flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDisableAsset}
                disabled={asset.status === "Disabled"}
                className="flex-1 sm:flex-none flex items-center space-x-2"
              >
                <Power className="h-4 w-4" />
                <span>
                  {asset.status === "Disabled" ? "Disabled" : "Disable"}
                </span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveAsset}
                className="flex-1 sm:flex-none flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Asset Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {asset.assetName}
                </h1>
                <p className="text-muted-foreground">
                  Tag:{" "}
                  <span className="font-mono font-medium text-orange-600">
                    {asset.tagNumber}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(asset.status)}
                <Badge
                  variant="secondary"
                  className={`text-sm font-medium border ${getStatusStyle(
                    asset.status
                  )}`}
                >
                  {asset.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Asset Details Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Asset Name
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {asset.assetName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Serial Number
                    </label>
                    <p className="text-base font-mono bg-slate-100 px-3 py-1 rounded mt-1">
                      {asset.serialNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Category
                    </label>
                    <Badge
                      variant="secondary"
                      className={`mt-1 text-xs font-medium border ${getCategoryColor(
                        asset.category
                      )}`}
                    >
                      {asset.category}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Condition
                    </label>
                    <p className="text-base text-slate-900 mt-1 capitalize">
                      {asset.condition}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Department
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {asset.department}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Branch
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {asset.branch}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Location
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <p className="text-base text-slate-900">
                        {asset.location}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Custodian
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-slate-500" />
                      <p className="text-base text-slate-900">
                        {asset.custodian}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Supplier
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building className="h-4 w-4 text-slate-500" />
                    <p className="text-base text-slate-900">{asset.supplier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span>Financial</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Acquisition Cost
                  </label>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(asset.acquisitionCost)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Current Book Value
                  </label>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {formatCurrency(asset.currentBookValue)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Depreciation Status
                  </label>
                  <p className="text-base text-slate-900 mt-1">
                    {asset.depreciationStatus}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Acquisition Date
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p className="text-base text-slate-900">
                      {formatDate(asset.acquisitionDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Asset Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Clock className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Package className="h-4 w-4 mr-2" />
                  Maintenance Log
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <MapPin className="h-4 w-4 mr-2" />
                  Transfer Asset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
