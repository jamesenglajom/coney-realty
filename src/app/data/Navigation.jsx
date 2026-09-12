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
  CalendarCheck,
  Trophy,
  Quote,
  ListChecks,
  Image as ImageIcon,
  BellRing,
  Palette,
} from "lucide-react";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Grouped by actual role reach, not just topic — checked against the live
// permissions matrix (SAdmin/Admin/Manager/Agent) rather than guessed:
//   - Overview: every role that can sign in sees both (My Referrals is
//     alwaysVisible; Dashboard is can_view for all four roles).
//   - Properties: the core listings workflow — Agent only ever sees
//     Properties itself (view-only); Property Types/Site Viewings need
//     Admin/SAdmin (or Manager for Property Types).
//   - Content: public-site content — Manager gets Blogs + Media, everything
//     else here is Admin/SAdmin only; Agent sees none of it, so this whole
//     group disappears from an Agent's sidebar (see AdminShell's group
//     filter, which drops a group once every item in it is hidden).
//   - Administration: people + site-wide config — Users needs Admin/SAdmin,
//     Brand is SAdmin-only, Settings is alwaysVisible (personal account
//     tabs live there for every role too).
export const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboardIcon,
        href: `${BASE_URL}/admin`,
        pageKey: "dashboard",
      },
      {
        name: "My Referrals",
        icon: BellRing,
        href: `${BASE_URL}/admin/my-referrals`,
        // Every role can refer a visitor via their own ?agent= link (see
        // features/viewings/referral.js) and should be able to see/act on
        // it regardless of whether their role has the "viewings" page
        // permission — same as MyReferredViewingRequests on the dashboard.
        alwaysVisible: true,
      },
    ],
  },
  {
    label: "Properties",
    items: [
      {
        name: "Properties",
        icon: Building2,
        href: `${BASE_URL}/admin/properties`,
        pageKey: "properties",
      },
      {
        name: "Property Types",
        icon: ListChecks,
        href: `${BASE_URL}/admin/property-types`,
        pageKey: "propertyTypes",
      },
      {
        name: "Site Viewings",
        icon: CalendarCheck,
        href: `${BASE_URL}/admin/site-viewings`,
        pageKey: "viewings",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        name: "Blogs",
        icon: FileText,
        href: `${BASE_URL}/admin/blogs`,
        pageKey: "blogs",
      },
      {
        name: "Leaderboard",
        icon: Trophy,
        href: `${BASE_URL}/admin/leaderboard`,
        pageKey: "leaderboard",
      },
      {
        name: "Testimonials",
        icon: Quote,
        href: `${BASE_URL}/admin/testimonials`,
        pageKey: "testimonials",
      },
      {
        name: "Media",
        icon: ImageIcon,
        href: `${BASE_URL}/admin/media`,
        pageKey: "media",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        name: "Users",
        icon: Users,
        href: `${BASE_URL}/admin/users`,
        pageKey: "users",
      },
      {
        name: "Brand",
        icon: Palette,
        href: `${BASE_URL}/admin/brand`,
        pageKey: "brand",
      },
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
