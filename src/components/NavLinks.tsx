"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Check, CloudAlert, Loader2, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useStudyStore } from "@/hooks/use-study-store";

const navLinks = [
  {
    href: "/planner",
    label: "Planner",
    dot: "bg-terracotta",
    activeClass: "bg-terracotta-tint text-terracotta-deep border-terracotta/30",
  },
  {
    href: "/table",
    label: "Table",
    dot: "bg-sage",
    activeClass: "bg-sage-tint text-sage-deep border-sage/30",
  },
  {
    href: "/exam",
    label: "Exam",
    dot: "bg-mustard",
    activeClass: "bg-mustard-tint text-mustard-deep border-mustard/35",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    dot: "bg-plum",
    activeClass: "bg-plum-tint text-plum-deep border-plum/30",
  },
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="หน้าหลัก"
      className={cn(
        "flex items-center gap-1 overflow-x-auto text-xs font-medium sm:gap-1.5 sm:text-sm",
        className
      )}
    >
      {navLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors sm:gap-2 sm:px-3",
              active
                ? link.activeClass
                : "border-transparent text-ink-soft hover:bg-paper-deep hover:text-ink"
            )}
          >
            <span className={cn("hidden h-2 w-2 rounded-full sm:inline-block", link.dot)} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavbarStatusOrCta() {
  const { data: session, status } = useSession();
  const { syncStatus } = useStudyStore();
  const [menuOpen, setMenuOpen] = useState(false);
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink transition-colors hover:bg-paper-deep"
        >
          <User className="h-3.5 w-3.5 shrink-0 text-terracotta" />
          <span className="max-w-32 truncate">{session.user.name || session.user.email}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line-strong bg-sheet p-1.5 shadow-md">
            <div className="border-b border-line px-2.5 py-2">
              <p className="truncate text-xs font-semibold text-ink">
                {session.user.name || "ผู้ใช้งาน"}
              </p>
              {session.user.email && (
                <p className="truncate text-[11px] text-ink-muted">{session.user.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-deep transition-colors hover:bg-slate-tint"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
