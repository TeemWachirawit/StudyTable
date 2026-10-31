import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyTable — สมุดจัดตารางอ่านหนังสือและการจัดการการบ้าน",
  description:
    "ระบบวางแผนตารางเวลาอ่านหนังสือ จัดการการบ้าน แตกงานย่อย นับถอยหลังวันสอบ และวิเคราะห์สถิติชั่วโมงเรียน สไตล์ Warm Academic Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] selection:bg-[#F9E3D8] selection:text-[#8F391A]">
        {children}
      </body>
    </html>
  );
}

