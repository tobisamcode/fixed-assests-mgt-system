"use client";

import { useAuth } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoCompact } from "@/components/ui/logo";

export default function HomePage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show loading while checking auth status
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <div className="bg-orange-100 rounded-2xl p-6 mb-4 mx-auto w-fit">
            <LogoCompact variant="orange" size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Fixed Assets System
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
