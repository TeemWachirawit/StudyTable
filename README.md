# StudyTable — โต๊ะอ่านหนังสือดิจิทัลสำหรับนักเรียนและนักศึกษา

แอปพลิเคชันจัดการตารางอ่านหนังสือรายสัปดาห์ เช็กลิสต์บทเรียนรายวิชา และการเตรียมสอบ พัฒนาด้วยสถาปัตยกรรม Modern Full-Stack Web Development:

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Authentication:** NextAuth.js v5 (Credentials + JWT Session)
- **Database & ORM:** Drizzle ORM + PostgreSQL (พร้อมระบบ Offline Fallback บน `localStorage`)
- **Testing:** Vitest
- **Icons:** Lucide React

---

## ฟีเจอร์หลัก (Key Features)

- **Planner (`/planner`):** ตารางอ่านหนังสือรายสัปดาห์ (จันทร์–อาทิตย์, 06:00–24:00) พร้อมระบบตรวจจับเวลาชนกันอัตโนมัติ และมุมมองรายวันสำหรับมือถือ
- **Table (`/table`):** จัดการรายวิชา เลือกสีประจำวิชา และเช็กลิสต์บทเรียนพร้อมแถบความคืบหน้า (Progress Bar)
- **Exam (`/exam`):** นับถอยหลังวันสอบ ผูกบทเรียนที่ออกสอบเพื่อคำนวณเปอร์เซ็นต์ความพร้อมก่อนสอบ (Exam Readiness)
- **Dashboard (`/dashboard`):** ภาพรวมสถิติชั่วโมงเรียน แผนภูมิสัดส่วนเวลาแต่ละวิชา และศูนย์รวมการแก้ไขข้อมูลในหน้าเดียว

---

## โครงสร้างโฟลเดอร์ (Directory Structure)

```text
├── src/
│   ├── app/                  # Next.js App Router Pages & API Routes
│   │   ├── api/              # REST API (auth, register, study sync)
│   │   ├── dashboard/        # หน้า Dashboard ภาพรวมและจัดการข้อมูล
│   │   ├── exam/             # หน้าจัดการวันสอบและความพร้อมสอบ
│   │   ├── planner/          # หน้าตารางอ่านหนังสือรายสัปดาห์
│   │   ├── signin/           # หน้าเข้าสู่ระบบ
│   │   ├── signup/           # หน้าสมัครสมาชิก
│   │   ├── table/            # หน้าจัดการวิชาและเช็กลิสต์บทเรียน
│   │   ├── layout.tsx        # Root Layout (Navbar, Footer, Providers)
│   │   └── page.tsx          # Landing Page
│   ├── components/           # React Components แยกตามโดเมน
│   ├── db/                   # Drizzle Schema, Connection & Study Service
│   ├── hooks/                # Custom Hooks (useStudyStore)
│   ├── lib/                  # Pure Functions (study, colors, password, utils)
│   └── types/                # TypeScript Interfaces (StudyState, Subject, Exam)
├── drizzle.config.ts         # Drizzle Kit Configuration
├── vitest.config.ts          # Vitest Configuration
└── package.json
```

---

## คำสั่งที่ใช้งานบ่อย (Commands)

```bash
# รัน Development Server (http://localhost:3000)
npm run dev

# รัน Unit Tests ด้วย Vitest
npm test

# ทดสอบ Production Build
npm run build

# ตรวจสอบ Code Style (ESLint)
npm run lint

# สร้าง Migration สำหรับ Database ด้วย Drizzle
npm run db:generate

# Push Schema ไปยัง PostgreSQL / Supabase โดยตรง
npm run db:push
```
