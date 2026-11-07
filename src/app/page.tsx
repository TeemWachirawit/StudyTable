import Link from "next/link";
import { ArrowRight, CalendarDays, BookOpenCheck, Hourglass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PlannerPreview } from "@/components/landing/PlannerPreview";
import { TablePreview } from "@/components/landing/TablePreview";
import { ExamPreview } from "@/components/landing/ExamPreview";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "planner",
    href: "/planner",
    icon: CalendarDays,
    tag: "Planner",
    tone: {
      badge: "border-terracotta/25 bg-terracotta-tint text-terracotta-deep",
      iconWrap: "bg-terracotta-tint text-terracotta-deep border-terracotta/25",
      bullet: "bg-terracotta",
      link: "text-terracotta-deep hover:text-terracotta",
      cardHover: "hover:bg-terracotta-tint/40",
    },
    title: "จัดตารางอ่านหนังสือแบบรายสัปดาห์",
    body: "ตารางวัน × เวลาที่คุ้นตาเหมือนปฏิทินหรือตารางเรียน วางช่วงเวลา ใส่วิชาและหัวข้อที่จะอ่าน แยกสีโทนอ่อนตามวิชาให้เห็นภาพรวมทั้งสัปดาห์ในแวบเดียว",
    points: ["มุมมองจันทร์–อาทิตย์ แบ่งช่วงรายชั่วโมง", "สลับดูรายวันได้สะดวกบนมือถือ", "เห็นจำนวนชั่วโมงที่วางแผนไว้ต่อสัปดาห์"],
    preview: <PlannerPreview />,
  },
  {
    id: "table",
    href: "/table",
    icon: BookOpenCheck,
    tag: "Table",
    tone: {
      badge: "border-sage/25 bg-sage-tint text-sage-deep",
      iconWrap: "bg-sage-tint text-sage-deep border-sage/25",
      bullet: "bg-sage",
      link: "text-sage-deep hover:text-sage",
      cardHover: "hover:bg-sage-tint/40",
    },
    title: "โต๊ะเรียนที่จำได้ว่าคุณอ่านถึงไหนแล้ว",
    body: "บันทึกความคืบหน้าทีละวิชา ทีละบท ติ๊กบทที่อ่านจบแล้ว ระบบคำนวณเปอร์เซ็นต์ให้อัตโนมัติ ไม่ต้องจำเองว่าเก็บเนื้อหาไปถึงไหน",
    points: ["รายการวิชาและบทเรียนของคุณเอง", "แก้ไขชื่อบทเรียนและติ๊กความคืบหน้าได้ทันที", "รู้ทันทีว่าบทไหนยังค้างอยู่"],
    preview: <TablePreview />,
  },
  {
    id: "exam",
    href: "/exam",
    icon: Hourglass,
    tag: "Exam",
    tone: {
      badge: "border-mustard/35 bg-mustard-tint text-mustard-deep",
      iconWrap: "bg-mustard-tint text-mustard-deep border-mustard/35",
      bullet: "bg-mustard",
      link: "text-mustard-deep hover:text-mustard",
      cardHover: "hover:bg-mustard-tint/50",
    },
    title: "นับถอยหลังวันสอบ พร้อมขอบเขตเนื้อหา",
    body: "ใส่วันสอบของแต่ละวิชา แล้วดูว่าเหลืออีกกี่วัน พร้อมรายการหัวข้อที่ออกสอบ ติ๊กบทที่อ่านจบได้จากหน้าสอบโดยตรง",
    points: ["นับวันที่เหลือก่อนสอบอัตโนมัติ", "คลิกติ๊กบทที่อ่านจบแล้วได้ทันทีในการ์ดสอบ", "เน้นสีเตือนวิชาที่ใกล้สอบ"],
    preview: <ExamPreview />,
  },
];

const steps = [
  {
    n: "01",
    title: "ตั้งวิชาและบทเรียน",
    body: "เพิ่มวิชาที่ต้องอ่านและรายการบทเรียนใน Table หรือเพิ่มวิชาด่วนระหว่างจัดตารางได้เลย",
    accent: "border-terracotta bg-terracotta-tint/60 text-terracotta-deep",
  },
  {
    n: "02",
    title: "วางแผนรายสัปดาห์",
    body: "ลงช่วงเวลาอ่านหนังสือในตาราง Planner เลือกบทเรียนที่จะอ่านในแต่ละช่วงเวลา",
    accent: "border-sage bg-sage-tint/60 text-sage-deep",
  },
  {
    n: "03",
    title: "ติดตามความพร้อมก่อนสอบ",
    body: "ดูวันที่เหลือและติ๊กเก็บหัวข้อที่ออกสอบใน Exam จนครบ 100% ก่อนวันจริง",
    accent: "border-mustard bg-mustard-tint/70 text-mustard-deep",
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* ───────── Hero ───────── */}
      <section className="bg-ruled border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:pt-24 lg:pb-28">
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-sheet px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-2xs">
              <span className="flex items-center gap-1" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-terracotta" />
                <span className="h-2 w-2 rounded-full bg-sage" />
                <span className="h-2 w-2 rounded-full bg-mustard" />
              </span>
              ผู้ช่วยจัดตารางอ่านหนังสือสำหรับนักเรียน
            </div>
            <h1 className="font-display text-4xl leading-[1.25] font-bold tracking-tight text-ink sm:text-5xl sm:leading-[1.2]">
              อ่านหนังสืออย่างมีแผน
              <br />
              <span className="text-terracotta">บนโต๊ะเรียนของคุณเอง</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              StudyTable รวมตารางอ่านหนังสือรายสัปดาห์ บันทึกความคืบหน้าทีละบท และนับถอยหลังวันสอบไว้ในที่เดียว
              รู้เสมอว่าวันนี้ต้องอ่านอะไร อ่านไปถึงไหนแล้ว และเหลือเวลาอีกเท่าไร
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/planner" className={buttonVariants({ size: "lg" })}>
                เริ่มจัดตารางอ่านหนังสือ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className={buttonVariants({ variant: "outline", size: "lg" })}>
                ดูฟีเจอร์ทั้งหมด
              </a>
            </div>
          </div>

          <PlannerPreview className="min-w-0" />
        </div>
      </section>

      {/* ───────── Three pillars summary (3 Soft Productivity Accents) ───────── */}
      <section aria-label="สรุปฟีเจอร์" className="border-b border-line bg-sheet">
        <div className="mx-auto grid max-w-6xl divide-y divide-line px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {features.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className={cn(
                "group flex items-start gap-4 px-4 py-7 transition-colors md:px-6",
                f.tone.cardHover
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  f.tone.iconWrap
                )}
              >
                <f.icon className="h-5 w-5" strokeWidth={1.85} />
              </span>
              <div>
                <p className="font-semibold text-ink">{f.tag}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.points[0]}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── Feature deep dives ───────── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-16 max-w-2xl">
          <p className="font-mono text-xs font-semibold tracking-widest text-terracotta uppercase">Productivity System</p>
          <h2 className="mt-3 font-display text-3xl leading-snug font-bold text-ink sm:text-4xl">
            สามพื้นที่ทำงานที่เชื่อมถึงกัน ตั้งแต่วางแผนจนถึงวันสอบ
          </h2>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {features.map((f, i) => (
            <article
              key={f.id}
              id={f.id}
              className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={cn("min-w-0", i % 2 === 1 && "lg:order-2")}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold",
                    f.tone.badge
                  )}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.tag}
                </span>
                <h3 className="mt-3.5 font-display text-2xl leading-snug font-bold text-ink sm:text-3xl">{f.title}</h3>
                <p className="mt-4 leading-relaxed text-ink-soft">{f.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-ink">
                      <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", f.tone.bullet)} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={f.href}
                  className={cn("mt-8 inline-flex items-center gap-1.5 font-semibold", f.tone.link)}
                >
                  เปิดหน้า {f.tag}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className={cn("min-w-0", i % 2 === 1 && "lg:order-1")}>{f.preview}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="border-y border-line bg-sheet">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-bold text-ink">เริ่มต้นใช้งานใน 3 ขั้นตอน</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.n}
                className="rounded-xl border border-line-strong bg-paper p-6"
              >
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-semibold",
                    s.accent
                  )}
                >
                  STEP {s.n}
                </span>
                <h3 className="mt-3.5 text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Closing CTA ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-snug font-bold text-ink sm:text-4xl">
          จัดโต๊ะให้พร้อม แล้วเริ่มอ่านสัปดาห์นี้เลย
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink-soft">
          เริ่มจากลงตารางอ่านหนังสือสัปดาห์แรก ใช้เวลาไม่ถึง 5 นาที
        </p>
        <Link href="/planner" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          เริ่มจัดตารางอ่านหนังสือ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
