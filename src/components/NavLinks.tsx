"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpenCheck,
  CalendarDays,
  Check,
  CloudAlert,
  Hourglass,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { UserAvatar } from "./ui/UserAvatar";

export const navLinks = [
  {
    href: "/planner",
    label: "Planner",
    icon: CalendarDays,
    dot: "bg-terracotta",
    activeClass: "bg-terracotta-tint text-terracotta-deep border-terracotta/30",
    activeMobile: "text-terracotta bg-terracotta-tint/70",
  },
  {
    href: "/table",
    label: "Table",
    icon: BookOpenCheck,
    dot: "bg-sage",
    activeClass: "bg-sage-tint text-sage-deep border-sage/30",
    activeMobile: "text-sage-deep bg-sage-tint/70",
  },
  {
    href: "/exam",
    label: "Exam",
    icon: Hourglass,
    dot: "bg-mustard",
    activeClass: "bg-mustard-tint text-mustard-deep border-mustard/35",
    activeMobile: "text-mustard-deep bg-mustard-tint/70",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    dot: "bg-plum",
    activeClass: "bg-plum-tint text-plum-deep border-plum/30",
    activeMobile: "text-plum-deep bg-plum-tint/70",
  },
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="หน้าหลัก"
      className={cn(
        "hidden md:flex items-center gap-1.5 text-sm font-medium",
        className
      )}
    >
      {navLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
              active
                ? link.activeClass
                : "border-transparent text-ink-soft hover:bg-paper-deep hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="เมนูหลักสำหรับมือถือ"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-sheet/95 backdrop-blur-md pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 md:hidden shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
    >
      <div className="mx-auto grid grid-cols-4 px-2">
        {navLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all min-h-[3.25rem]",
                active
                  ? link.activeMobile
                  : "text-ink-muted hover:bg-paper-deep hover:text-ink"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    active ? "stroke-[2.25] scale-105" : "stroke-[1.8]"
                  )}
                />
                {active && (
                  <span
                    className={cn("absolute -top-0.5 -right-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-sheet", link.dot)}
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className={cn("text-[11px] font-medium leading-none", active ? "font-bold" : "")}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function NavbarStatusOrCta() {
  const { data: session, status } = useSession();
  const { syncStatus } = useStudyStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOverride, setProfileOverride] = useState<{
    name?: string | null;
    image?: string | null;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (status !== "authenticated") {
      setProfileOverride(null);
      return;
    }

    let cancelled = false;
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) {
          setProfileOverride({
            name: data.user.name,
            image: data.user.image,
          });
        }
      })
      .catch(() => {
        /* ignore profile fetch errors */
      });

    function handleProfileUpdated(e: Event) {
      const detail = (e as CustomEvent<{ name?: string | null; image?: string | null }>).detail;
      if (detail) {
        setProfileOverride({ name: detail.name, image: detail.image });
      }
    }

    window.addEventListener("studytable:profile-updated", handleProfileUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("studytable:profile-updated", handleProfileUpdated);
    };
  }, [status]);

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-paper-deep" />;
  }

  if (!session?.user) {
    return (
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        <Link
          href="/signin"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/signup"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          สมัครสมาชิก
        </Link>
      </div>
    );
  }

  const displayName = profileOverride?.name || session.user.name;
  const displayImage =
    profileOverride?.image !== undefined ? profileOverride.image : session.user.image;

  return (
    <div className="flex shrink-0 items-center gap-2 text-xs font-medium">
      {syncStatus === "saving" && (
        <span className="inline-flex items-center gap-1 text-ink-muted" title="กำลังบันทึกลงฐานข้อมูล">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </span>
      )}
      {syncStatus === "saved" && (
        <span className="inline-flex items-center gap-1 text-sage-deep" title="บันทึกข้อมูลลงฐานข้อมูลแล้ว">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {syncStatus === "error" && (
        <span className="inline-flex items-center gap-1 text-slate-deep" title="ยังไม่ได้ซิงค์ฐานข้อมูล">
          <CloudAlert className="h-3.5 w-3.5" />
        </span>
      )}

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper p-1 text-xs font-semibold whitespace-nowrap text-ink transition-colors hover:bg-paper-deep sm:gap-2 sm:py-1 sm:pr-3 sm:pl-1.5"
          aria-label="เมนูบัญชีผู้ใช้"
        >
          <UserAvatar image={displayImage} name={displayName} size="sm" />
          <span className="hidden max-w-32 truncate sm:inline">{displayName || session.user.email}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line-strong bg-sheet p-1.5 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-line px-2.5 py-2.5">
              <UserAvatar image={displayImage} name={displayName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {displayName || "ผู้ใช้งาน"}
                </p>
                {session.user.email && (
                  <p className="truncate text-[11px] text-ink-muted">{session.user.email}</p>
                )}
              </div>
            </div>

            <div className="mt-1 space-y-0.5">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-paper-deep"
              >
                <Settings className="h-3.5 w-3.5 shrink-0 text-terracotta" />
                ตั้งค่าบัญชี
              </Link>
              <button
                type="button"
                onClick={() => {
                  try {
                    if (session.user?.id) {
                      localStorage.removeItem(`studytable:v1:${session.user.id}`);
                    }
                  } catch {
                    /* ignore storage errors */
                  }
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-deep transition-colors hover:bg-slate-tint"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
