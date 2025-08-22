import { FieldError, FieldErrors } from "react-hook-form";

/**
 * Get error message from react-hook-form field error
 */
export function getErrorMessage(
  error: FieldError | undefined
): string | undefined {
  return error?.message;
}

/**
 * Check if a field has an error
 */
export function hasError(errors: FieldErrors, fieldName: string): boolean {
  return !!errors[fieldName];
}

/**
 * Get field error state for styling
 */
export function getFieldState(errors: FieldErrors, fieldName: string) {
  const hasFieldError = hasError(errors, fieldName);
  return {
    hasError: hasFieldError,
    errorMessage: hasFieldError
      ? getErrorMessage(errors[fieldName] as FieldError)
      : undefined,
  };
}

/**
 * Format field name for display (converts camelCase to readable text)
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Common validation messages
 */
export const validationMessages = {
  required: (field: string) => `${formatFieldName(field)} is required`,
  minLength: (field: string, length: number) =>
    `${formatFieldName(field)} must be at least ${length} characters`,
  maxLength: (field: string, length: number) =>
    `${formatFieldName(field)} must not exceed ${length} characters`,
  email: "Please enter a valid email address",
  passwordMismatch: "Passwords do not match",
  invalidFormat: (field: string) =>
    `Please enter a valid ${formatFieldName(field).toLowerCase()}`,
  numeric: (field: string) =>
    `${formatFieldName(field)} must be a valid number`,
  positiveNumber: (field: string) =>
    `${formatFieldName(field)} must be a positive number`,
  futureDate: "Date cannot be in the future",
  pastDate: "Date cannot be in the past",
  dateRange: "From date must be before or equal to To date",
} as const;

/**
 * Common regex patterns for validation
 */
export const validationPatterns = {
  username: /^[a-zA-Z0-9_.-]+$/,
  serialNumber: /^[A-Z0-9-_]+$/i,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  lettersOnly: /^[a-zA-Z\s'.-]+$/,
  numbersOnly: /^[0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
} as const;

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  if (password.length >= 12) {
    score += 1;
  }

  return {
    score,
    feedback,
    isStrong: score >= 4,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: FieldErrors): string[] {
  const errorMessages: string[] = [];

  Object.entries(errors).forEach(([, error]) => {
    if (error?.message && typeof error.message === "string") {
      errorMessages.push(error.message);
    }
  });

  return errorMessages;
}

/**
 * Debounce function for real-time validation
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: format === "long" ? "long" : "short",
    day: "numeric",
  });
}

/**
 * Generate form field props for consistent styling
 */
export function getFormFieldProps(
  errors: FieldErrors,
  fieldName: string,
  touched?: boolean
) {
  const fieldState = getFieldState(errors, fieldName);

  return {
    "aria-invalid": fieldState.hasError,
    "aria-describedby": fieldState.hasError ? `${fieldName}-error` : undefined,
    className: `transition-colors ${
      fieldState.hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : touched
        ? "border-green-500 focus:border-green-500 focus:ring-green-500"
        : "border-gray-200 focus:border-orange-500 focus:ring-orange-500"
    }`,
  };
}
