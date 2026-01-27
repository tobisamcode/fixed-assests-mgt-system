export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface StandardApiResponse<T> {
  responseCode: string;
  responseMessage: string;
  errors: string[];
  responseData: T;
}

export interface PaginationMeta {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  numberOfPages: number;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  records: T[];
}

export type PaginatedApiResponse<T> = StandardApiResponse<PaginatedResponse<T>>;

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
