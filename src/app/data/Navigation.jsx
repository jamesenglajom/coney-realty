
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
  Contact,
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
        pageKey: "dashboard",
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
        pageKey: "users",
      },
      {
        name: "Blogs",
        title: "Content Hub",
        sub: "Draft, edit, and publish your latest articles.",
        icon: FileText,
        href: `${BASE_URL}/admin/blogs`,
        pageKey: "blogs",
      },
      {
        name: "Properties",
        title: "Property Listings",
        sub: "Keep your property listings and details up to date.",
        icon: Building2,
        href: `${BASE_URL}/admin/properties`,
        pageKey: "properties",
      },
      {
        name: "Leads",
        title: "Agent Contact Requests",
        sub: "Visitors who reached out to an agent from the public site.",
        icon: Contact,
        href: `${BASE_URL}/admin/leads`,
        pageKey: "leads",
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
        // Settings now doubles as everyone's personal account page (change
        // email/password/profile), not just the SAdmin permissions matrix —
        // always shown regardless of the "settings" page's view permission.
        alwaysVisible: true,
      },
    ],
  },
];

export const navigation = navigationGroups.flatMap((group) => group.items);