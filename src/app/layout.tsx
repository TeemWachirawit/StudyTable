import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StudyStoreProvider } from "@/hooks/use-study-store";

export const metadata: Metadata = {
  title: "StudyTable — โต๊ะอ่านหนังสือออนไลน์ของคุณ",
  description:
    "จัดตารางอ่านหนังสือรายสัปดาห์ บันทึกความคืบหน้าแต่ละวิชาและบทเรียน และนับถอยหลังวันสอบพร้อมขอบเขตเนื้อหา ในที่เดียว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Noto+Serif+Thai:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col selection:bg-terracotta-tint selection:text-terracotta-deep">
        <StudyStoreProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </StudyStoreProvider>
      </body>
    </html>
  );
}
