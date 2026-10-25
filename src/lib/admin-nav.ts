import type { AdminModule } from "@/lib/permissions";

export type IconKey =
  | "dashboard" | "trophy" | "clipboard" | "users" | "medal" | "checklist" | "person"
  | "award" | "archive" | "images" | "quote" | "building" | "handshake" | "mail"
  | "bell" | "shield" | "log" | "settings" | "user";

export type NavItemDef = { module: AdminModule; label: string; href: string; icon: IconKey };
export type NavGroupDef = { label: string; items: NavItemDef[] };

export const ADMIN_NAV: NavGroupDef[] = [
  { 
    label: "Overview", 
    items: [
      { module: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
      { module: "dashboard", label: "My Profile", href: "/admin/profile", icon: "user" }, // <--- ADDED
    ] 
  },
  {
    label: "Competition",
    items: [
      { module: "competitions", label: "Competitions", href: "/admin/competitions", icon: "trophy" },
      { module: "registrations", label: "Registrations", href: "/admin/registrations", icon: "clipboard" },
      { module: "teams", label: "Teams", href: "/admin/teams", icon: "users" },
      { module: "results", label: "Results", href: "/admin/results", icon: "medal" },
      { module: "progress", label: "Progress", href: "/admin/progress", icon: "checklist" },
    ],
  },
  {
    label: "People & Certificates",
    items: [
      { module: "people", label: "People", href: "/admin/people", icon: "person" },
      { module: "certificates", label: "Certificates", href: "/admin/certificates", icon: "award" },
    ],
  },
  {
    label: "Public Site",
    items: [
      { module: "archives", label: "Archives", href: "/admin/archives", icon: "archive" },
      { module: "gallery", label: "Gallery", href: "/admin/gallery", icon: "images" },
      { module: "reviews", label: "Reviews", href: "/admin/reviews", icon: "quote" },
      { module: "universities", label: "Universities", href: "/admin/universities", icon: "building" },
      { module: "sponsors", label: "Sponsors", href: "/admin/sponsors", icon: "handshake" },
      { module: "sponsors", label: "Applications", href: "/admin/applications", icon: "users" },
    ],
  },
  {
    label: "Communication",
    items: [
      { module: "messages", label: "Messages", href: "/admin/messages", icon: "mail" },
      { module: "push", label: "Push", href: "/admin/push", icon: "bell" },
    ],
  },
  {
    label: "System",
    items: [
      { module: "admins", label: "Admins", href: "/admin/admins", icon: "shield" },
      { module: "activity-log", label: "Activity log", href: "/admin/activity-log", icon: "log" },
      { module: "settings", label: "Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];