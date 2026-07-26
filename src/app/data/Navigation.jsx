
import {
  Users,
  LayoutDashboardIcon,
  FileText,
  Building2,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
} from "lucide-react";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const navigationGroups = [
  {
    label: "Analytics",
    items: [
      {
        name: "Dashboard",
        title: "System Overview",
        sub: "Welcome back, here is what changed today.",
        icon: LayoutDashboardIcon,
        href: `${BASE_URL}/admin`,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        name: "Users",
        title: "User Management",
        sub: "View, manage, and audit your registered members.",
        icon: Users,
        href: `${BASE_URL}/admin/users`,
      },
      {
        name: "Blogs",
        title: "Content Hub",
        sub: "Draft, edit, and publish your latest articles.",
        icon: FileText,
        href: `${BASE_URL}/admin/blogs`,
      },
      {
        name: "Properties",
        title: "Property Listings",
        sub: "Keep your property listings and details up to date.",
        icon: Building2,
        href: `${BASE_URL}/admin/properties`,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        name: "Settings",
        title: "Account Settings",
        sub: "Configure your preferences and system parameters.",
        icon: Settings,
        href: `${BASE_URL}/admin/settings`,
      },
    ],
  },
];

export const navigation = navigationGroups.flatMap((group) => group.items);