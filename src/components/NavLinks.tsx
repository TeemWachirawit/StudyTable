"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/planner", label: "Planner" },
  { href: "/table", label: "Table" },
  { href: "/exam", label: "Exam" },
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="หน้าหลัก" className={cn("flex items-center gap-1 text-sm font-medium", className)}>
      {navLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

