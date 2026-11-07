import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { NavLinks } from "./NavLinks";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink">
      {/* desk icon: tabletop + legs */}
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="8" className="fill-ink" />
        <rect x="7" y="11" width="18" height="3" rx="1" className="fill-paper" />
        <rect x="9" y="14" width="2.5" height="9" className="fill-paper" />
        <rect x="20.5" y="14" width="2.5" height="9" className="fill-paper" />
        <rect x="13" y="7" width="7" height="4" rx="0.5" className="fill-terracotta" />
      </svg>
      <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">StudyTable</span>
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-4 sm:gap-8">
          <Logo />
          <NavLinks />
        </div>

        <Link href="/planner" className={buttonVariants({ size: "sm", className: "hidden md:inline-flex" })}>
          เริ่มจัดตาราง
        </Link>
      </div>
    </header>
  );
}
