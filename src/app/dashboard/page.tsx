"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useCategoryAssetsCountQuery } from "@/features/dashboard/category/services/queries";
import { useAuthStore } from "@/features/auth";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  LogOut,
  FileText,
  History,
  List,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: categoryMetrics, isLoading: categoryMetricsLoading } =
    useCategoryAssetsCountQuery();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { logout, user } = useAuthStore();

  const router = useRouter();

  // Redirect to login if not authenticated (after hydration)
  if (isHydrated && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Show loading while checking auth status
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const quickActions = [
    {
      title: "Register New Asset",
      description: "Add and register a new fixed asset to the system",
      icon: Plus,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Prepare Waybill",
      description: "Generate waybill for asset transfers and movements",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Asset History/Logs",
      description: "View detailed asset transaction history and audit logs",
      icon: History,
      color: "from-green-500 to-green-600",
    },
    {
      title: "All Asset List",
      description: "Browse and manage complete asset inventory",
      icon: List,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="bg-orange-100 rounded-xl p-3">
              <Logo
                variant="orange"
                size="lg"
                showText={true}
                textClassName="hidden sm:flex flex-col"
              />
            </div>

            <div className="flex items-center space-x-4 text-gray-500">
              <div className="font-semibold text-xs">
                <p className="">{user?.fullName}</p>
                <p>{user?.emailAddress}</p>
              </div>

              <Button
                onClick={() => router.push("/admin-management")}
                className="flex items-center border-blue-500 border space-x-2 hover:bg-blue-50"
              >
                <Users className="text-blue-500 h-4 w-4" />
                <span className="text-blue-500">Manage Users</span>
              </Button>

              <Button
                onClick={() => router.push("/manage-resources")}
                className="flex items-center border-orange-500 border space-x-2 hover:bg-orange-50"
              >
                <Settings className="text-orange-500 h-4 w-4" />
                <span className="text-orange-500">Manage Resources</span>
              </Button>

              <Button
                onClick={handleLogout}
                className="flex items-center border-red-500 border space-x-2"
              >
                <LogOut className="text-red-500 h-4 w-4" />
                <span className="text-red-500">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Asset Management Dashboard
                  </h2>
                  <p className="text-orange-100">
                    Monitor and manage your organization&apos;s fixed assets in
                    real-time
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isRegisterAsset = action.title === "Register New Asset";

              return (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    if (isRegisterAsset) {
                      router.push("/register-new-asset");
                    } else if (action.title === "All Asset List") {
                      router.push("/all-asset-list");
                    } else if (action.title === "Asset History/Logs") {
                      router.push("/asset-history");
                    } else if (action.title === "Prepare Waybill") {
                      router.push("/waybill");
                    } else {
                      toast.info(action.title, {
                        description: "This feature will be available soon.",
                      });
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div
                      className={`bg-gradient-to-r ${action.color} rounded-2xl p-4 mb-4 w-fit group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {action.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1  gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryMetricsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (categoryMetrics?.responseData?.length ?? 0) > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const items = categoryMetrics?.responseData || [];
                    const total =
                      items.reduce((sum, i) => sum + (i.count || 0), 0) || 1;
                    return items.map((item, index) => {
                      const percentage = Math.round(
                        ((item.count || 0) / total) * 100
                      );
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {item.assetCategoryName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.count} assets
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                    <span className="text-orange-600 font-bold">0</span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    No category metrics yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Once assets are categorized, their counts will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
