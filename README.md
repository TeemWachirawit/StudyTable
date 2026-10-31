# Modern Web Starter Project

โปรเจกต์เว็บแอปพลิเคชันตั้งต้น พัฒนาด้วยเทคโนโลยี Modern Full-Stack Web Development:
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui pattern (`Button`, `Card`, `Input`)
- **Database & ORM:** Drizzle ORM + PostgreSQL / Supabase
- **Icons:** Lucide React

---

## โครงสร้างโฟลเดอร์ (Directory Structure)

```text
├── src/
│   ├── app/                # Pages & Layouts (App Router)
│   │   ├── layout.tsx      # Root Layout (Navbar, Footer, Font, Meta)
│   │   ├── page.tsx        # Home Page (หน้าแรก)
│   │   └── globals.css     # Global styles & Tailwind
│   ├── components/         # Reusable Components
│   │   ├── ui/             # Core UI (Button, Card, Input)
│   │   ├── Navbar.tsx      # Navigation Bar
│   │   └── Footer.tsx      # Footer
│   ├── db/                 # Database Configuration
│   │   ├── schema.ts       # Drizzle Tables / Schema
│   │   └── index.ts        # Database Connection Client
│   ├── hooks/              # Custom React Hooks
│   │   └── use-mounted.ts  # Client hydration helper
│   ├── lib/                # Helper utilities
│   │   └── utils.ts        # cn helper (clsx + tailwind-merge)
│   └── types/              # TypeScript Types & Interfaces
│       └── index.ts
├── drizzle.config.ts       # Drizzle Kit Configuration
├── .env.example            # ตัวอย่าง Environment Variables
├── package.json
└── tsconfig.json
```

---

## คำสั่งที่ใช้งานบ่อย (Commands)

```bash
# รัน Development Server (เปิดดูที่ http://localhost:3000)
npm run dev

# ทดสอบ Build ตรวจสอบความถูกต้องของโปรเจกต์
npm run build

# ตรวจสอบ Code Style และข้อผิดพลาด
npm run lint

# สร้าง Migration สำหรับ Database ด้วย Drizzle
npm run db:generate

# Push Schema ไปยัง Supabase / Database โดยตรง
npm run db:push
```

