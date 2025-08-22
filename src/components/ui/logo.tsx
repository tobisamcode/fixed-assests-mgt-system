"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "orange" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

export function Logo({
  variant = "orange",
  size = "md",
  className,
  showText = true,
  textClassName,
}: LogoProps) {
  const dimensions = sizeMap[size];
  const logoSrc = variant === "white" ? "/white-logo.svg" : "/orange-logo.svg";

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex-shrink-0">
        <Image
          src={logoSrc}
          alt="Fixed Assets Management System Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className={cn("flex flex-col", textClassName)}>
          <h1
            className={cn(
              "font-bold leading-tight",
              size === "sm" && "text-sm",
              size === "md" && "text-lg",
              size === "lg" && "text-2xl",
              size === "xl" && "text-3xl",
              variant === "white" ? "text-white" : "text-foreground"
            )}
          >
            Fixed Assets
          </h1>
          <p
            className={cn(
              "text-sm leading-tight",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base",
              size === "xl" && "text-lg",
              variant === "white" ? "text-white/80" : "text-muted-foreground"
            )}
          >
            Management System
          </p>
        </div>
      )}
    </div>
  );
}

// Compact logo version for smaller spaces
export function LogoCompact({
  variant = "orange",
  size = "md",
  className,
}: Omit<LogoProps, "showText" | "textClassName">) {
  const dimensions = sizeMap[size];
  const logoSrc = variant === "white" ? "/white-logo.svg" : "/orange-logo.svg";

  return (
    <div className={cn("flex-shrink-0", className)}>
      <Image
        src={logoSrc}
        alt="Fixed Assets Management System"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </div>
  );
}

// Logo with custom text
export function LogoWithText({
  variant = "orange",
  size = "md",
  className,
  title,
  subtitle,
}: LogoProps & { title?: string; subtitle?: string }) {
  const dimensions = sizeMap[size];
  const logoSrc = variant === "white" ? "/white-logo.svg" : "/orange-logo.svg";

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex-shrink-0">
        <Image
          src={logoSrc}
          alt="Fixed Assets Management System Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col">
        <h1
          className={cn(
            "font-bold leading-tight",
            size === "sm" && "text-sm",
            size === "md" && "text-lg",
            size === "lg" && "text-2xl",
            size === "xl" && "text-3xl",
            variant === "white" ? "text-white" : "text-foreground"
          )}
        >
          {title || "Fixed Assets"}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "text-sm leading-tight",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base",
              size === "xl" && "text-lg",
              variant === "white" ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
