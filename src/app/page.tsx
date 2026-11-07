import Link from "next/link";
import { ArrowRight, CalendarDays, BookOpenCheck, Hourglass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PlannerPreview } from "@/components/landing/PlannerPreview";
import { TablePreview } from "@/components/landing/TablePreview";
import { ExamPreview } from "@/components/landing/ExamPreview";

const features = [
  {
    id: "planner",
    href: "/planner",
    icon: CalendarDays,
    tag: "Planner",
    title: "จัดตารางอ่านหนังสือแบบรายสัปดาห์",
    body: "ตารางวัน × เวลาที่คุ้นตาเหมือน Excel หรือตารางเรียน ลากช่วงเวลา ใส่วิชาและหัวข้อที่จะอ่าน แยกสีตามวิชาให้เห็นภาพรวมทั้งสัปดาห์ในแวบเดียว",
    points: ["มุมมองจันทร์–อาทิตย์ แบ่งช่วงรายชั่วโมง", "แยกสีตามรายวิชา", "เห็นจำนวนชั่วโมงที่วางแผนไว้ต่อสัปดาห์"],
    preview: <PlannerPreview />,
  },
  {
    id: "table",
    href: "/table",
    icon: BookOpenCheck,
    tag: "Table",
    title: "โต๊ะเรียนที่จำได้ว่าคุณอ่านถึงไหนแล้ว",
    body: "บันทึกความคืบหน้าทีละวิชา ทีละบท ติ๊กบทที่อ่านจบแล้ว ระบบคำนวณเปอร์เซ็นต์ให้อัตโนมัติ ไม่ต้องจำเองว่าเก็บเนื้อหาไปถึงไหน",
    points: ["รายการวิชาและบทเรียนของคุณเอง", "แถบความคืบหน้าต่อวิชา", "รู้ทันทีว่าบทไหนยังค้างอยู่"],
    preview: <TablePreview />,
  },
  {
    id: "exam",
    href: "/exam",
    icon: Hourglass,
    tag: "Exam",
    title: "นับถอยหลังวันสอบ พร้อมขอบเขตเนื้อหา",
    body: "ใส่วันสอบของแต่ละวิชา แล้วดูว่าเหลืออีกกี่วัน พร้อมรายการหัวข้อที่ออกสอบ จะได้วางแผนอ่านให้ทันก่อนเดดไลน์",
    points: ["นับวันที่เหลือก่อนสอบอัตโนมัติ", "ระบุหัวข้อที่ออกสอบแต่ละวิชา", "เน้นสีวิชาที่ใกล้สอบ"],
    preview: <ExamPreview />,
  },
];

const steps = [
  { n: "01", title: "วางแผน", body: "ลงช่วงเวลาอ่านหนังสือในตารางรายสัปดาห์ของ Planner" },
  { n: "02", title: "อ่านและบันทึก", body: "อ่านจบบทไหน ติ๊กไว้ที่ Table ความคืบหน้าอัปเดตทันที" },
  { n: "03", title: "พร้อมสอบ", body: "ดูวันที่เหลือและหัวข้อที่ออกสอบใน Exam แล้วเก็บส่วนที่ขาด" },
];

export default function LandingPage() {
  return (
    <main>
      {/* ───────── Hero ───────── */}
      <section className="bg-ruled border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:pt-24 lg:pb-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-sheet px-3 py-1 text-xs font-medium text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
              ผู้ช่วยจัดตารางอ่านหนังสือสำหรับนักเรียน
            </p>
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

          <PlannerPreview className="lg:rotate-[0.6deg]" />
        </div>
      </section>

      {/* ───────── Three pillars summary ───────── */}
      <section aria-label="สรุปฟีเจอร์" className="border-b border-line bg-sheet">
        <div className="mx-auto grid max-w-6xl divide-y divide-line px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {features.map((f) => (
            <a key={f.id} href={`#${f.id}`} className="group flex items-start gap-4 py-7 md:px-7 md:first:pl-0 md:last:pr-0">
              <f.icon className="mt-0.5 h-6 w-6 shrink-0 text-terracotta" strokeWidth={1.75} />
              <div>
                <p className="font-semibold text-ink group-hover:text-terracotta">{f.tag}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.points[0]}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── Feature deep dives ───────── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-16 max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-widest text-terracotta uppercase">Features</p>
          <h2 className="mt-3 font-display text-3xl leading-snug font-bold sm:text-4xl">
            สามหน้าที่ทำงานร่วมกัน ตั้งแต่วางแผนจนถึงวันสอบ
          </h2>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {features.map((f, i) => (
            <article
              key={f.id}
              id={f.id}
              className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                <span className="inline-flex items-center gap-2 font-mono text-sm font-medium text-ink-muted">
                  <f.icon className="h-4 w-4 text-terracotta" />
                  {f.tag}
                </span>
                <h3 className="mt-3 font-display text-2xl leading-snug font-bold sm:text-3xl">{f.title}</h3>
                <p className="mt-4 leading-relaxed text-ink-soft">{f.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-ink">
                      <span className="mt-2.5 h-px w-4 shrink-0 bg-terracotta" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={f.href}
                  className="mt-8 inline-flex items-center gap-1.5 font-semibold text-terracotta hover:text-terracotta-deep"
                >
                  ไปที่หน้า {f.tag}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : undefined}>{f.preview}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="border-y border-line bg-paper-deep">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-bold">ใช้งานง่ายใน 3 ขั้นตอน</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <li key={s.n} className="border-t-2 border-ink pt-5">
                <span className="font-mono text-sm text-ink-muted">{s.n}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Closing CTA ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-snug font-bold sm:text-4xl">
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
