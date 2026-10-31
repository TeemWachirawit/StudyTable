import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>© {currentYear} WebStarter. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              ช่วยเหลือ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

