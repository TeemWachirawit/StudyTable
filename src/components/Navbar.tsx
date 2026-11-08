import Link from "next/link";
import { MobileBottomNav, NavLinks, NavbarStatusOrCta } from "./NavLinks";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink">
      {/* desk icon: tabletop + legs with 3 productivity color books */}
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="8" className="fill-ink" />
        <rect x="6" y="13" width="20" height="2.5" rx="1" className="fill-sheet" />
        <rect x="8.5" y="15.5" width="2.2" height="9" rx="0.5" className="fill-sheet" />
        <rect x="21.3" y="15.5" width="2.2" height="9" rx="0.5" className="fill-sheet" />
        <rect x="8" y="8" width="5" height="5" rx="1" className="fill-terracotta" />
        <rect x="14" y="9" width="5" height="4" rx="1" className="fill-sage" />
        <rect x="20" y="7.5" width="4" height="5.5" rx="1" className="fill-mustard" />
      </svg>
      <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">StudyTable</span>
    </Link>
  );
}

export function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-sheet/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-8">
            <Logo />
            <NavLinks />
          </div>

          <NavbarStatusOrCta />
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
