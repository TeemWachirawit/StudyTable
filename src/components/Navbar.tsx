import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-base shadow-sm">
              W
            </span>
            <span>WebStarter</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              ฟีเจอร์
            </Link>
            <Link href="#about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              เกี่ยวกับเรา
            </Link>
            <Link href="#contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              ติดต่อ
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            เข้าสู่ระบบ
          </Button>
          <Button variant="default" size="sm">
            เริ่มต้นใช้งาน
          </Button>
        </div>
      </div>
    </header>
  );
}

