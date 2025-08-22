import { NavItem } from "./types";

// Navigation configuration for your application
export const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  // Add more navigation items as needed
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  // },
  // {
  //   title: "Settings",
  //   href: "/settings",
  // },
];

// Helper function to get active navigation item
export const getActiveNavItem = (pathname: string): NavItem | undefined => {
  return navigationItems.find((item) => item.href === pathname);
};
