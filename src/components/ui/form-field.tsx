"use client";

import { forwardRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | string;
  touched?: boolean;
  required?: boolean;
  description?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, error, touched, required, description, className, id, ...props },
    ref
  ) => {
    const fieldId = id || props.name || "";
    const errorMessage = typeof error === "string" ? error : error?.message;
    const hasError = !!errorMessage;

    return (
      <div className="space-y-2">
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            hasError && "text-red-600",
            required && "after:content-['*'] after:text-red-500 after:ml-1"
          )}
        >
          {label}
        </Label>

        <Input
          id={fieldId}
          ref={ref}
          className={cn(
            "transition-colors duration-200",
            hasError &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50",
            touched &&
              !hasError &&
              "border-green-500 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${fieldId}-error`
              : description
              ? `${fieldId}-description`
              : undefined
          }
          {...props}
        />

        {description && !hasError && (
          <p
            id={`${fieldId}-description`}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        )}

        {hasError && (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-red-600 flex items-center mt-1"
            role="alert"
          >
            <svg
              className="w-3 h-3 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
