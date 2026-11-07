import Link from "next/link";
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-line bg-sheet">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-ink-muted">โต๊ะอ่านหนังสือออนไลน์ สำหรับคนที่อยากอ่านอย่างมีแผน</p>
        </div>
        <nav aria-label="ลิงก์ท้ายเว็บ" className="flex flex-wrap gap-6 text-sm font-medium text-ink-soft">
          <Link href="/planner" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Planner
          </Link>
          <Link href="/table" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Table
          </Link>
          <Link href="/exam" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
            Exam
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-plum" />
            Dashboard
          </Link>
        </nav>
        <p className="text-xs text-ink-muted">© {new Date().getFullYear()} StudyTable</p>
      </div>
    </footer>
  );
}
