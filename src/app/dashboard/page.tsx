"use client";

import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useAuthStore } from "@/features/auth";
import { useRouter } from "next/navigation";
import { BarChart3, LogOut, FileText, History, List, Plus } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { logout } = useAuthStore();
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

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Asset Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Added",
                    asset: "Dell Laptop #DL-2024-001",
                    time: "2 hours ago",
                    type: "add",
                  },
                  {
                    action: "Updated",
                    asset: "Office Printer #HP-001",
                    time: "4 hours ago",
                    type: "update",
                  },
                  {
                    action: "Maintenance",
                    asset: "Conference Table #CT-15",
                    time: "1 day ago",
                    type: "maintenance",
                  },
                  {
                    action: "Disposed",
                    asset: "Old Server #SV-2019-08",
                    time: "2 days ago",
                    type: "dispose",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "add"
                          ? "bg-green-500"
                          : activity.type === "update"
                          ? "bg-blue-500"
                          : activity.type === "maintenance"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>{" "}
                        {activity.asset}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "IT Equipment", count: 1247, percentage: 44 },
                  { category: "Furniture", count: 856, percentage: 30 },
                  { category: "Vehicles", count: 425, percentage: 15 },
                  { category: "Machinery", count: 319, percentage: 11 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} assets
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
