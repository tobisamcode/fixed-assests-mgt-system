"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Logo } from "@/components/ui/logo";
import { useAuthStore } from "@/features/auth";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Eye, EyeOff, Shield, Zap, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const router = useRouter();
  const { setToken, setLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange", // Real-time validation
  });

  const watchedPassword = watch("password");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoading(true);
    clearErrors();

    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Enhanced validation for demo
      if (data.username === "admin" && data.password === "admin123") {
        const mockToken = `token_${Date.now()}_${Math.random()}`;
        setToken(mockToken);
        toast.success("Welcome to Fixed Assets System!", {
          description: "You have successfully logged in.",
        });
        router.push("/dashboard");
      } else if (data.username === "demo" && data.password === "demo123") {
        const mockToken = `token_${Date.now()}_${Math.random()}`;
        setToken(mockToken);
        toast.success("Welcome Demo User!", {
          description: "You have successfully logged in with demo account.",
        });
        router.push("/dashboard");
      } else {
        // Increment login attempts
        setLoginAttempts((prev) => prev + 1);

        // Set specific field errors based on common issues
        if (!["admin", "demo", "user"].includes(data.username)) {
          setError("username", {
            type: "manual",
            message: "Username not found. Try 'admin' or 'demo'.",
          });
        }

        if (data.password.length < 6) {
          setError("password", {
            type: "manual",
            message: "Password is too short for security reasons.",
          });
        } else {
          setError("password", {
            type: "manual",
            message: "Incorrect password. Try 'admin123' or 'demo123'.",
          });
        }

        throw new Error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed", {
        description: "Please check your credentials and try again.",
      });

      // Add rate limiting after multiple attempts
      if (loginAttempts >= 2) {
        toast.error("Too many failed attempts", {
          description: "Please wait before trying again.",
        });
        // In a real app, you'd implement actual rate limiting
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

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
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-orange-700 items-center justify-center p-12 relative overflow-hidden">
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

              <div className="hidden lg:block mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Sign in to access your asset management dashboard
                </p>
              </div>
            </div>

            {/* Login Card */}
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <div className="lg:hidden text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Sign in to your account
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                {/* Login attempts warning */}
                {loginAttempts >= 2 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Multiple failed attempts detected. Please verify your
                      credentials.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {/* Username Field */}
                    <FormField
                      label="Username"
                      placeholder="Enter your username (try 'admin' or 'demo')"
                      error={errors.username}
                      touched={touchedFields.username}
                      required
                      {...register("username")}
                      className="h-11 bg-white/50"
                      description="Use 'admin' or 'demo' for testing"
                    />

                    {/* Password Field */}
                    <div className="space-y-2">
                      <FormField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        error={errors.password}
                        touched={touchedFields.password}
                        required
                        {...register("password")}
                        className="h-11 bg-white/50 pr-10"
                        description="Use 'admin123' or 'demo123' for testing"
                      />
                      <div className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-[-44px] h-11 px-3 py-2 hover:bg-transparent z-10"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {watchedPassword && watchedPassword.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                watchedPassword.length >= level * 2
                                  ? watchedPassword.length >= 8
                                    ? "bg-green-500"
                                    : watchedPassword.length >= 6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength:{" "}
                          {watchedPassword.length >= 8
                            ? "Strong"
                            : watchedPassword.length >= 6
                            ? "Medium"
                            : "Weak"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" {...register("rememberMe")} />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>

                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-orange-600 hover:text-orange-700"
                      onClick={() => {
                        toast.info("Password Reset", {
                          description: "This feature will be available soon.",
                        });
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* Form Summary Errors */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm font-medium text-red-800">
                          Please fix the following errors:
                        </p>
                      </div>
                      <ul className="text-xs text-red-700 space-y-1 ml-6">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>• {error?.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={
                      isLoading ||
                      isSubmitting ||
                      Object.keys(errors).length > 0
                    }
                  >
                    {isLoading || isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      Demo Credentials:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-gray-50 rounded px-3 py-2 flex justify-between">
                      <span className="font-medium">Admin:</span>
                      <span className="text-muted-foreground">
                        admin / admin123
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded px-3 py-2 flex justify-between">
                      <span className="font-medium">Demo:</span>
                      <span className="text-muted-foreground">
                        demo / demo123
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Real-time validation is active. Try typing to see validation
                    in action!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>© 2024 Fixed Assets Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
