import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatter helper function
export type Currency = "NGN" | "USD" | "EUR" | "GBP";

interface CurrencyFormatOptions {
  currency?: Currency;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = "NGN", // Default to Nigerian Naira
    locale = "en-NG", // Default to Nigerian English
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  // Handle different locales based on currency
  const currencyLocaleMap: Record<Currency, string> = {
    NGN: "en-NG",
    USD: "en-US",
    EUR: "en-EU",
    GBP: "en-GB",
  };

  const formatLocale = locale || currencyLocaleMap[currency];

  try {
    return new Intl.NumberFormat(formatLocale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    // Fallback formatting if Intl.NumberFormat fails
    const currencySymbols: Record<Currency, string> = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const symbol = currencySymbols[currency] || "₦";
    return `${symbol}${amount.toLocaleString(formatLocale, {
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
}
