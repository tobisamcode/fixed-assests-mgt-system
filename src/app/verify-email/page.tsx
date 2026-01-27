"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoCompact } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useAuthorizeLogin } from "@/features/auth";
import { toast } from "sonner";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const authorizeLogin = useAuthorizeLogin();
  const [isProcessing, setIsProcessing] = useState(false);

  const code = params.get("code");
  const state = params.get("state") || undefined;

  const hasQuery = useMemo(() => Boolean(code), [code]);

  const handleVerify = async () => {
    if (!code) {
      toast.error("Missing authorization code");
      return;
    }

    setIsProcessing(true);
    // Use the same redirect URL logic as login page
    const redirectUrl =
      process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI ||
      `${window.location.origin}/verify-email`;

    console.log("Verify Email - OAuth Configuration:");
    console.log("- Authorization Code:", code);
    console.log("- State:", state);
    console.log("- Redirect URL:", redirectUrl);
    console.log("- Current Origin:", window.location.origin);
    console.log(
      "- Environment Redirect URI:",
      process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI
    );

    authorizeLogin.mutate(
      {
        authorizationCode: code,
        state,
        redirectUrl,
        provider: "ZOHO",
      },
      {
        onSuccess: (data) => {
          const accessToken = data.responseData?.auth?.accessToken;
          if (accessToken) {
            toast.success("Login successful");
            router.replace("/dashboard");
          } else {
            toast.error("Could not complete login");
          }
          setIsProcessing(false);
        },
        onError: (error) => {
          toast.error("Login failed", {
            description:
              (error as Error).message ?? "Unable to complete authentication",
          });
          setIsProcessing(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center">
        <div className="bg-orange-100 rounded-2xl p-6 mb-4 mx-auto w-fit">
          <LogoCompact variant="orange" size="xl" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Verify your email
        </h1>
        {hasQuery ? (
          <Button
            onClick={handleVerify}
            disabled={isProcessing}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </Button>
        ) : (
          <div className="text-muted-foreground">
            Missing authorization code.
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
          <div className="text-center">
            <div className="bg-orange-100 rounded-2xl p-4 mb-4 mx-auto w-fit">
              <LogoCompact variant="orange" size="lg" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
