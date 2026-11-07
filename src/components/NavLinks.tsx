"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { daysUntil } from "@/lib/study";

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
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="หน้าหลัก" className={cn("flex items-center gap-1.5 text-sm font-medium", className)}>
      {navLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
              active
                ? link.activeClass
                : "border-transparent text-ink-soft hover:bg-paper-deep hover:text-ink"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", link.dot)} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavbarStatusOrCta() {
  const pathname = usePathname();
  const { state, hydrated } = useStudyStore();

  if (pathname === "/") {
    return (
      <Link href="/planner" className={buttonVariants({ size: "sm", className: "hidden md:inline-flex" })}>
        เริ่มจัดตาราง
      </Link>
    );
  }

  if (!hydrated) return null;

  const totalHours = state.blocks.reduce((sum, b) => sum + b.duration, 0);
  const allChapters = state.subjects.flatMap((s) => s.chapters);
  const doneChapters = allChapters.filter((c) => c.done).length;
  const nextExam = [...state.exams]
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="hidden items-center gap-2 text-xs font-medium md:flex">
      <Link
        href="/planner"
        className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/25 bg-terracotta-tint px-2.5 py-1 text-terracotta-deep transition-colors hover:border-terracotta/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
        <span className="font-mono font-semibold">{totalHours}</span> ชม./สัปดาห์
      </Link>
      <Link
        href="/table"
        className="inline-flex items-center gap-1.5 rounded-full border border-sage/25 bg-sage-tint px-2.5 py-1 text-sage-deep transition-colors hover:border-sage/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        อ่านจบ <span className="font-mono font-semibold">{doneChapters}/{allChapters.length}</span> บท
      </Link>
      {nextExam && (
        <Link
          href="/exam"
          className="inline-flex items-center gap-1.5 rounded-full border border-mustard/30 bg-mustard-tint px-2.5 py-1 text-mustard-deep transition-colors hover:border-mustard/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
          สอบถัดไป <span className="font-mono font-semibold">{daysUntil(nextExam.date)}</span> วัน
        </Link>
      )}
    </div>
  );
}
