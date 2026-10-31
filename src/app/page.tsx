import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Code2, Layers, Database, Sparkles, FolderTree, Rocket } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white to-zinc-50 border-b border-zinc-200/70">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>โครงสร้างโปรเจกต์พร้อมสำหรับการสร้างเนื้อหาแล้ว</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            เริ่มต้นสร้างเว็บไซต์ของคุณ <br className="hidden sm:inline" />
            <span className="text-blue-600">เตรียมไฟล์และโครงสร้างพร้อมแล้ว</span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed">
            ไฟล์ตั้งต้นทั้งหมดได้รับการจัดวางอย่างเป็นระเบียบตามมาตรฐาน Modern Full-Stack (Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM) พร้อมให้คุณใส่เนื้อหาและฟีเจอร์ได้ทันที
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="shadow-sm">
              <Rocket className="h-4 w-4 mr-2" /> เริ่มเขียนเนื้อหา
            </Button>
            <Button variant="outline" size="lg">
              <Code2 className="h-4 w-4 mr-2" /> ดูโครงสร้างโฟลเดอร์
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section id="features" className="py-16 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            ไฟล์และส่วนประกอบที่จัดเตรียมไว้ให้
          </h2>
          <p className="mt-2 text-zinc-600 text-sm sm:text-base">
            โครงสร้างพร้อมใช้งาน รองรับทั้งหน้า UI, คอมโพเนนต์ และการเชื่อมต่อฐานข้อมูล
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle>Next.js 15 & React</CardTitle>
              <CardDescription>
                โครงสร้าง App Router รองรับ Server Components, SEO Metadata และ Routing อัตโนมัติ
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-500 font-mono bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              src/app/page.tsx <br />
              src/app/layout.tsx
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <Code2 className="h-5 w-5" />
              </div>
              <CardTitle>Tailwind & UI Components</CardTitle>
              <CardDescription>
                คอมโพเนนต์พื้นฐานแบบ shadcn/ui พร้อมใช้งาน (Button, Card, Input) และ Tailwind CSS
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-500 font-mono bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              src/components/ui/* <br />
              src/lib/utils.ts
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle>Database & Schema</CardTitle>
              <CardDescription>
                Drizzle ORM เชื่อมต่อกับ PostgreSQL / Supabase พร้อมตัวอย่าง Schema พื้นฐาน
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-zinc-500 font-mono bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              src/db/schema.ts <br />
              src/db/index.ts
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Directory Structure Guide */}
      <section className="py-12 bg-white border-t border-zinc-200/70">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6 text-zinc-900 font-bold text-xl">
            <FolderTree className="h-5 w-5 text-blue-600" />
            <span>แผนผังไฟล์ในโปรเจกต์ (Project Structure)</span>
          </div>

          <div className="bg-zinc-950 text-zinc-200 rounded-xl p-5 text-xs sm:text-sm font-mono overflow-x-auto shadow-inner leading-relaxed">
            <div className="text-zinc-500">// แผนผังโฟลเดอร์สำหรับเริ่มต้นพัฒนา</div>
            <div className="text-emerald-400">src/</div>
            <div className="pl-4">├── <span className="text-blue-400">app/</span>            <span className="text-zinc-500"># หน้าเว็บและ Layout (App Router)</span></div>
            <div className="pl-8">├── layout.tsx     <span className="text-zinc-500"># Root layout (หัวเว็บ, ท้ายเว็บ, ฟอนต์)</span></div>
            <div className="pl-8">├── page.tsx       <span className="text-zinc-500"># หน้าแรก (Home Page)</span></div>
            <div className="pl-8">└── globals.css    <span className="text-zinc-500"># สไตล์และ Tailwind CSS</span></div>
            <div className="pl-4">├── <span className="text-blue-400">components/</span>     <span className="text-zinc-500"># คอมโพเนนต์ UI</span></div>
            <div className="pl-8">├── ui/            <span className="text-zinc-500"># ปุ่ม, การ์ด, อินพุต ฯลฯ</span></div>
            <div className="pl-8">├── Navbar.tsx     <span className="text-zinc-500"># แถบเมนูด้านบน</span></div>
            <div className="pl-8">└── Footer.tsx     <span className="text-zinc-500"># แถบด้านล่าง</span></div>
            <div className="pl-4">├── <span className="text-blue-400">db/</span>             <span className="text-zinc-500"># การตั้งค่าฐานข้อมูล (Drizzle ORM)</span></div>
            <div className="pl-8">├── schema.ts      <span className="text-zinc-500"># ตารางข้อมูล (PostgreSQL/Supabase)</span></div>
            <div className="pl-8">└── index.ts       <span className="text-zinc-500"># ตัวเชื่อมต่อฐานข้อมูล</span></div>
            <div className="pl-4">├── <span className="text-blue-400">hooks/</span>          <span className="text-zinc-500"># Custom React Hooks</span></div>
            <div className="pl-4">├── <span className="text-blue-400">lib/</span>            <span className="text-zinc-500"># ฟังก์ชัน Utility (cn, helpers)</span></div>
            <div className="pl-4">└── <span className="text-blue-400">types/</span>          <span className="text-zinc-500"># TypeScript Types/Interfaces</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
