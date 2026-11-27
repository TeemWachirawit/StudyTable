import Link from "next/link";
import { MessageSquareWarning } from "lucide-react";
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-line bg-sheet">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-ink-muted">โต๊ะอ่านหนังสือออนไลน์ สำหรับคนที่อยากอ่านอย่างมีแผน</p>
        </div>
        <nav aria-label="ลิงก์ท้ายเว็บ" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-ink-soft">
          <Link href="/planner" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Planner
          </Link>
          <Link href="/table" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Table
          </Link>
          <Link href="/library" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo" />
            Library
          </Link>
          <Link href="/exam" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
            Exam
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-plum" />
            Dashboard
          </Link>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-terracotta/40 hover:bg-terracotta-tint hover:text-terracotta-deep"
          >
            <MessageSquareWarning className="h-3.5 w-3.5 text-terracotta" />
            แจ้งบั๊ก / Feedback
          </Link>
        </nav>
        <p className="text-xs text-ink-muted">© {new Date().getFullYear()} StudyTable</p>
      </div>
    </footer>
  );
}
