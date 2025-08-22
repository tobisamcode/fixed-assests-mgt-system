"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Eye,
  Printer,
  Save,
  Send,
  MapPin,
  User,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  type WaybillFormData,
  generateWaybillNumber,
  commonLocations,
  transferPurposes,
  formatWaybillDate,
} from "@/lib/waybill-data";
import { dummyAssets, type Asset } from "@/lib/dummy-data";

export default function WaybillPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [waybillNumber] = useState(generateWaybillNumber());
  const [currentDate] = useState(new Date().toISOString().split("T")[0]);

  // Form data
  const [formData, setFormData] = useState<WaybillFormData>({
    deliveredBy: "",
    authorisedBy: "",
    receivedBy: "",
    fromLocation: "",
    toLocation: "",
    purpose: "",
    notes: "",
    selectedAssets: [],
  });

  // Selected assets for waybill
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof WaybillFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAssetSelection = (asset: Asset, checked: boolean) => {
    if (checked) {
      setSelectedAssets((prev) => [...prev, asset]);
      setFormData((prev) => ({
        ...prev,
        selectedAssets: [...prev.selectedAssets, asset.id],
      }));
    } else {
      setSelectedAssets((prev) => prev.filter((a) => a.id !== asset.id));
      setFormData((prev) => ({
        ...prev,
        selectedAssets: prev.selectedAssets.filter((id) => id !== asset.id),
      }));
    }
  };

  const removeAsset = (assetId: string) => {
    setSelectedAssets((prev) => prev.filter((a) => a.id !== assetId));
    setFormData((prev) => ({
      ...prev,
      selectedAssets: prev.selectedAssets.filter((id) => id !== assetId),
    }));
  };

  const handleSaveDraft = () => {
    toast.success("Waybill saved as draft", {
      description: `Waybill ${waybillNumber} has been saved successfully`,
    });
  };

  const handleSubmitForApproval = () => {
    if (
      !formData.deliveredBy ||
      !formData.authorisedBy ||
      !formData.receivedBy
    ) {
      toast.error("Missing required fields", {
        description: "Please fill in all personnel information",
      });
      return;
    }

    if (!formData.fromLocation || !formData.toLocation) {
      toast.error("Missing location information", {
        description: "Please specify both source and destination locations",
      });
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please select at least one asset for transfer",
      });
      return;
    }

    toast.success("Waybill submitted for approval", {
      description: `Waybill ${waybillNumber} has been submitted successfully`,
    });
  };

  const handlePreview = () => {
    setCurrentStep(3);
  };

  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hide {
            display: none !important;
          }
          .print-show {
            display: block !important;
          }
        }
      </style>
    `;

    // Add styles to head
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.innerHTML = printStyles;
    head.appendChild(style);

    // Print
    window.print();

    // Remove styles after printing
    setTimeout(() => {
      head.removeChild(style);
    }, 1000);
  };

  const availableAssets = useMemo(() => {
    return dummyAssets.filter(
      (asset) =>
        asset.status === "Active" &&
        !selectedAssets.some((selected) => selected.id === asset.id)
    );
  }, [selectedAssets]);

  const steps = [
    { id: 1, name: "Basic Information", icon: FileText },
    { id: 2, name: "Asset Selection", icon: Package },
    { id: 3, name: "Preview & Submit", icon: Eye },
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

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>

              {currentStep === 3 && (
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Prepare Waybill
            </h1>
            <p className="text-muted-foreground">
              Generate waybill for asset transfers and movements
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${
                      currentStep >= step.id
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.name}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 ml-6 ${
                        currentStep > step.id ? "bg-orange-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Waybill Header Info */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <span>Waybill Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Waybill Number</Label>
                      <Input
                        value={waybillNumber}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        value={formatWaybillDate(currentDate)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prepared By</Label>
                      <Input
                        value="Current User"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personnel Information */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-orange-600" />
                    <span>Personnel Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="deliveredBy">Delivered by *</Label>
                      <Input
                        id="deliveredBy"
                        value={formData.deliveredBy}
                        onChange={(e) =>
                          handleInputChange("deliveredBy", e.target.value)
                        }
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorisedBy">Authorised by *</Label>
                      <Input
                        id="authorisedBy"
                        value={formData.authorisedBy}
                        onChange={(e) =>
                          handleInputChange("authorisedBy", e.target.value)
                        }
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receivedBy">Received by *</Label>
                      <Input
                        id="receivedBy"
                        value={formData.receivedBy}
                        onChange={(e) =>
                          handleInputChange("receivedBy", e.target.value)
                        }
                        placeholder="Enter name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <span>Transfer Locations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>From Location *</Label>
                      <Select
                        value={formData.fromLocation}
                        onValueChange={(value) =>
                          handleInputChange("fromLocation", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source location" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Location *</Label>
                      <Select
                        value={formData.toLocation}
                        onValueChange={(value) =>
                          handleInputChange("toLocation", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transfer Purpose */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Transfer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Purpose of Transfer</Label>
                      <Select
                        value={formData.purpose}
                        onValueChange={(value) =>
                          handleInputChange("purpose", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {transferPurposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Optional notes or comments"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Select Assets</span>
                  <Package className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Asset Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Selected Assets */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      <span>Selected Assets ({selectedAssets.length})</span>
                    </div>
                    <Button
                      onClick={() => setShowAssetSelector(!showAssetSelector)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Assets</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAssets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No assets selected yet</p>
                      <p className="text-sm">
                        Click &quot;Add Assets&quot; to select items for
                        transfer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-medium">
                                  {asset.assetName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {asset.tagNumber} • {asset.serialNumber}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {asset.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {asset.condition}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAsset(asset.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Asset Selector */}
              {showAssetSelector && (
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle>Available Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {availableAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            id={asset.id}
                            onCheckedChange={(checked) =>
                              handleAssetSelection(asset, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <label
                                  htmlFor={asset.id}
                                  className="font-medium cursor-pointer"
                                >
                                  {asset.assetName}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {asset.tagNumber} • {asset.serialNumber} •{" "}
                                  {asset.location}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {asset.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handlePreview}
                  disabled={selectedAssets.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Waybill</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Waybill Preview */}
              <Card className="bg-white shadow-md print:shadow-none print-area">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-2xl font-bold text-orange-600 mb-2">
                      WAYBILL
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      The item(s) listed below are being taken out of the bank
                      premises to the location(s) below.
                    </p>
                  </div>

                  {/* Waybill Details */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date:</p>
                      <p className="font-medium">
                        {formatWaybillDate(currentDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Prepared By:
                      </p>
                      <p className="font-medium">Current User</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Waybill No:
                      </p>
                      <p className="font-medium">{waybillNumber}</p>
                    </div>
                  </div>

                  {/* Assets Table */}
                  <div className="mb-8">
                    <h3 className="font-semibold mb-4">
                      Items Being Transferred:
                    </h3>
                    <div className="border border-gray-300">
                      <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-300 p-3 text-sm font-medium">
                        <div>Asset Name</div>
                        <div>Tag Number</div>
                        <div>Serial Number</div>
                        <div>Category</div>
                        <div>Condition</div>
                        <div>Location</div>
                      </div>
                      {selectedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="grid grid-cols-6 border-b border-gray-200 p-3 text-sm"
                        >
                          <div>{asset.assetName}</div>
                          <div>{asset.tagNumber}</div>
                          <div>{asset.serialNumber}</div>
                          <div>{asset.category}</div>
                          <div>{asset.condition}</div>
                          <div>{asset.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-4">
                        Transfer Information:
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">From: </span>
                          <span className="font-medium">
                            {formData.fromLocation}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">To: </span>
                          <span className="font-medium">
                            {formData.toLocation}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Purpose:{" "}
                          </span>
                          <span className="font-medium">
                            {formData.purpose}
                          </span>
                        </div>
                        {formData.notes && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Notes:{" "}
                            </span>
                            <span className="font-medium">
                              {formData.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-8 mt-12">
                    <div className="text-center">
                      <div className="border-b border-black mb-2 h-12"></div>
                      <p className="text-sm">
                        <strong>Delivered by:</strong>
                        <br />
                        {formData.deliveredBy}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-black mb-2 h-12"></div>
                      <p className="text-sm">
                        <strong>Authorised by:</strong>
                        <br />
                        {formData.authorisedBy}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-black mb-2 h-12"></div>
                      <p className="text-sm">
                        <strong>Received by:</strong>
                        <br />
                        {formData.receivedBy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-between print:hidden print-hide">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Assets
                </Button>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                  <Button
                    onClick={handleSubmitForApproval}
                    className="flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
