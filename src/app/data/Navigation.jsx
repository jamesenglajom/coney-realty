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
  ListChecks,
} from "lucide-react";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const navigationGroups = [
  {
    label: "Analytics",
    items: [
      {
        name: "Dashboard",
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
        icon: Users,
        href: `${BASE_URL}/admin/users`,
        pageKey: "users",
      },
      {
        name: "Blogs",
        icon: FileText,
        href: `${BASE_URL}/admin/blogs`,
        pageKey: "blogs",
      },
      {
        name: "Properties",
        icon: Building2,
        href: `${BASE_URL}/admin/properties`,
        pageKey: "properties",
      },
      {
        name: "Leads",
        icon: Contact,
        href: `${BASE_URL}/admin/leads`,
        pageKey: "leads",
      },
      {
        name: "Property Types",
        icon: ListChecks,
        href: `${BASE_URL}/admin/property-types`,
        pageKey: "propertyTypes",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        name: "Settings",
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
