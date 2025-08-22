// Core application types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Common UI types
export interface Option {
  label: string;
  value: string;
}

// Theme types
export type Theme = "light" | "dark" | "system";

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: Option[];
}
