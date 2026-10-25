"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Trophy, ClipboardList, Users, Medal, ListChecks, UserRound, Award, Archive,
  Images, MessageSquareQuote, Building2, Handshake, Mail, BellRing, ShieldCheck, ScrollText,
  Settings, Menu, X, LogOut, ExternalLink, UserCircle
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/cn";
import type { IconKey } from "@/lib/admin-nav";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard, trophy: Trophy, clipboard: ClipboardList, users: Users, medal: Medal,
  checklist: ListChecks, person: UserRound, award: Award, archive: Archive, images: Images,
  quote: MessageSquareQuote, building: Building2, handshake: Handshake, mail: Mail, bell: BellRing,
  shield: ShieldCheck, log: ScrollText, settings: Settings, user: UserCircle,
};

export type ShellNavItem = { label: string; href: string; icon: IconKey; badge?: number };
export type ShellNavGroup = { label: string; items: ShellNavItem[] };

type Props = {
  groups: ShellNavGroup[];
  user: { name: string; roleLabel: string; avatar?: string | null };
  scopeLabel?: string | null;
  children: React.ReactNode;
};

function SidebarContent({ groups, user }: Pick<Props, "groups" | "user">) {
  const pathname = usePathname();
  const initials = user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-full flex-col bg-abyss text-porcelain">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-tide px-5">
        <span className="font-display text-2xl font-bold tracking-wide">SAVD</span>
        <span className="text-xs text-aqua">▸ MES</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="eyebrow mb-1 px-3 text-[0.65rem] text-aqua">{g.label}</p>
            {g.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors",
                    active ? "border-signal bg-tide text-white" : "border-transparent text-porcelain/75 hover:bg-deep hover:text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-signal px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-tide p-4">
        <Link href="/admin/profile" className="flex items-center gap-3 mb-4 group">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-tide" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-tide text-white flex items-center justify-center text-xs font-bold">{initials}</div>
          )}
          <div>
            <p className="truncate text-sm font-semibold group-hover:text-aqua transition-colors">{user.name}</p>
            <p className="text-xs text-porcelain/60">{user.roleLabel}</p>
          </div>
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-tide px-3 py-2 text-sm font-medium text-porcelain/80 transition-colors hover:bg-deep hover:text-white">
            <LogOut className="size-4" /> Logout
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ groups, user, scopeLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">
        <SidebarContent groups={groups} user={user} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[264px]" onClickCapture={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
            <SidebarContent groups={groups} user={user} />
          </div>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-ink hover:bg-canvas lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex-1" />
          {scopeLabel ? (
            <span className="hidden rounded-full bg-signal/10 px-3 py-1 text-xs font-semibold text-signal sm:inline">Scoped to: {scopeLabel}</span>
          ) : null}
          <Link href="/" target="_blank" className="hidden items-center gap-1 text-sm font-medium text-mist hover:text-ink sm:flex">
            View public site <ExternalLink className="size-3.5" />
          </Link>
          
          <Link href="/admin/profile" className="rounded-full overflow-hidden hover:ring-2 hover:ring-aqua transition-all" title={`${user.name} (Profile)`}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-9 h-9 object-cover" />
            ) : (
              <span className="grid size-9 place-items-center bg-abyss text-xs font-bold text-white">{initials}</span>
            )}
          </Link>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}