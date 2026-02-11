import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, hyphens, and underscores"
    ),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),

  rememberMe: z.boolean().optional(),
});

// Password validation schema (for forms that need password complexity)
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(100, "Email must not exceed 100 characters");

// Asset form validation schema
export const assetSchema = z
  .object({
    assetName: z
      .string()
      .min(1, "Asset name is required")
      .min(2, "Asset name must be at least 2 characters")
      .max(100, "Asset name must not exceed 100 characters"),

    serialNumber: z
      .string()
      .min(1, "Serial number is required")
      .max(50, "Serial number must not exceed 50 characters")
      .regex(
        /^[A-Z0-9-_]+$/i,
        "Serial number can only contain letters, numbers, hyphens, and underscores"
      ),

    tagNumber: z
      .string()
      .min(1, "Tag number is required")
      .min(3, "Tag number must be at least 3 characters")
      .max(50, "Tag number must not exceed 50 characters")
      .regex(
        /^[A-Z0-9-_]+$/i,
        "Tag number can only contain letters, numbers, hyphens, and underscores"
      ),

    brand: z
      .string()
      .max(100, "Brand must not exceed 100 characters")
      .optional()
      .or(z.literal("")),

    model: z
      .string()
      .max(100, "Model must not exceed 100 characters")
      .optional()
      .or(z.literal("")),

    oem: z
      .string()
      .max(100, "OEM must not exceed 100 characters")
      .optional()
      .or(z.literal("")),

    operatingSystemVersion: z
      .string()
      .max(50, "OS version must not exceed 50 characters")
      .optional()
      .or(z.literal("")),

    releaseVersion: z
      .string()
      .max(50, "Release version must not exceed 50 characters")
      .optional()
      .or(z.literal("")),

    eolEoslDate: z
      .string()
      .optional()
      .or(z.literal("")),

    locationStatus: z
      .string()
      .optional()
      .or(z.literal("")),

    assetCategory: z.string().min(1, "Asset category is required"),

    acquisitionDate: z
      .string()
      .min(1, "Acquisition date is required")
      .refine((date) => {
        const parsedDate = new Date(date);
        const today = new Date();
        return parsedDate <= today;
      }, "Acquisition date cannot be in the future"),

    acquisitionCost: z
      .number()
      .min(0, "Acquisition cost must be a positive number")
      .max(10000000, "Acquisition cost seems unreasonably high")
      .refine((val) => {
        // Check if the number has at most 2 decimal places
        const decimalPart = val.toString().split(".")[1];
        return !decimalPart || decimalPart.length <= 2;
      }, "Acquisition cost can only have up to 2 decimal places"),

    department: z.string().min(1, "Department/Unit is required"),

    branch: z.string().min(1, "Branch is required"),

    locationDetail: z
      .string()
      .min(1, "Location detail is required")
      .max(200, "Location detail must not exceed 200 characters"),

    supplier: z.string().min(1, "Supplier is required"),

    warrantyStart: z.string().min(1, "Warranty start date is required"),

    warrantyEnd: z.string().min(1, "Warranty end date is required"),

    condition: z.enum(["excellent", "good", "fair", "poor", "damaged"], {
      required_error: "Please select asset condition",
    }),

    depreciationMethod: z.enum(
      [
        "straight-line",
        "declining-balance",
        "sum-of-years",
        "units-of-production",
      ],
      {
        required_error: "Please select depreciation method",
      }
    ),

    usefulLife: z
      .number()
      .min(1, "Useful life must be at least 1 year")
      .max(100, "Useful life cannot exceed 100 years"),

    salvageValue: z
      .number()
      .min(0, "Salvage value must be a positive number")
      .refine((val) => {
        // Check if the number has at most 2 decimal places
        const decimalPart = val.toString().split(".")[1];
        return !decimalPart || decimalPart.length <= 2;
      }, "Salvage value can only have up to 2 decimal places"),

    custodian: z
      .string()
      .min(1, "Custodian is required")
      .min(2, "Custodian name must be at least 2 characters")
      .max(100, "Custodian name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s'.-]+$/,
        "Custodian name can only contain letters, spaces, apostrophes, dots, and hyphens"
      ),
  })
  .refine(
    (data) => {
      // Warranty end date should be after start date
      if (data.warrantyStart && data.warrantyEnd) {
        return new Date(data.warrantyEnd) > new Date(data.warrantyStart);
      }
      return true;
    },
    {
      message: "Warranty end date must be after start date",
      path: ["warrantyEnd"],
    }
  )
  .refine(
    (data) => {
      // Salvage value should be less than acquisition cost
      return data.salvageValue < data.acquisitionCost;
    },
    {
      message: "Salvage value must be less than acquisition cost",
      path: ["salvageValue"],
    }
  );

// User registration schema (for future use)
export const userRegistrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z\s'.-]+$/,
        "First name can only contain letters, spaces, apostrophes, dots, and hyphens"
      ),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z\s'.-]+$/,
        "Last name can only contain letters, spaces, apostrophes, dots, and hyphens"
      ),

    email: emailSchema,

    username: loginSchema.shape.username,

    password: strongPasswordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password"),

    role: z.enum(["admin", "manager", "user"], {
      required_error: "Please select a role",
    }),

    department: z
      .string()
      .min(1, "Department is required")
      .max(100, "Department must not exceed 100 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: strongPasswordSchema,

    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

// Search/Filter schema
export const searchSchema = z
  .object({
    search: z
      .string()
      .max(100, "Search term must not exceed 100 characters")
      .optional(),

    category: z.string().optional(),

    location: z.string().optional(),

    condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),

    dateFrom: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Invalid date format"),

    dateTo: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Invalid date format"),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: "From date must be before or equal to To date",
      path: ["dateTo"],
    }
  );

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type AssetFormData = z.infer<typeof assetSchema>;
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
