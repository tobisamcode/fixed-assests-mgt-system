"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Shield, Zap, Package } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const ZOHO_ACCOUNTS = "https://accounts.zoho.com";

  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function startZohoLogin() {
    try {
      setIsLoading(true);

      const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID;

      if (!clientId) {
        console.error("NEXT_PUBLIC_ZOHO_CLIENT_ID is not configured");
        toast.error("Configuration Error", {
          description:
            "Zoho client ID is not configured. Please contact administrator.",
        });
        setIsLoading(false);
        return;
      }

      // Use environment variable for redirect URI if available, otherwise use current origin
      const redirectUri =
        process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI ||
        `${window.location.origin}/verify-email`;
      const scope = ["AaaServer.profile.READ", "ZohoCRM.users.READ"].join(" ");
      const state = generateUUID();

      sessionStorage.setItem("zoho_oauth_state", state);

      const url = new URL(`${ZOHO_ACCOUNTS}/oauth/v2/auth`);
      url.searchParams.set("scope", scope);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);

      console.log("Zoho OAuth Configuration:");
      console.log("- Client ID:", clientId);
      console.log("- Redirect URI:", redirectUri);
      console.log("- Current Origin:", window.location.origin);
      console.log(
        "- Environment Redirect URI:",
        process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI
      );
      console.log("Full OAuth URL:", url.toString());
      window.location.href = url.toString();
    } catch (error) {
      console.error("Error starting Zoho login:", error);
      toast.error("Login Error", {
        description: "Failed to initiate Zoho login. Please try again.",
      });
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-300/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white max-w-lg">
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 w-fit">
                <Logo
                  variant="white"
                  size="xl"
                  className="justify-start"
                  textClassName="ml-0"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 rounded-full p-2 mt-1">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Secure Asset Tracking
                  </h3>
                  <p className="text-orange-100">
                    Enterprise-grade security for all your valuable assets
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 rounded-full p-2 mt-1">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Real-time Monitoring
                  </h3>
                  <p className="text-orange-100">
                    Track asset lifecycle, depreciation, and maintenance
                    schedules
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 rounded-full p-2 mt-1">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Complete Management</h3>
                  <p className="text-orange-100">
                    From acquisition to disposal, manage every aspect of your
                    assets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex lg:hidden items-center justify-center mb-6">
                <div className="bg-orange-100 rounded-2xl p-4">
                  <Logo variant="orange" size="lg" className="justify-center" />
                </div>
              </div>
            </div>

            {/* Login Card */}
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back!
                </h1>
                <p className="text-gray-600">Please login!</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Button
                  onClick={startZohoLogin}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L2 7L12 12L22 7L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 17L12 22L22 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 12L12 17L22 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Login With Zoho
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Fixed Assets Management
                System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
