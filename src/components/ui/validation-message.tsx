"use client";

import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationMessageProps {
  type: "error" | "success" | "info" | "warning";
  message: string;
  className?: string;
}

export function ValidationMessage({
  type,
  message,
  className,
}: ValidationMessageProps) {
  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={cn(
        "p-3 border rounded-lg flex items-start space-x-2",
        getStyles(),
        className
      )}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
