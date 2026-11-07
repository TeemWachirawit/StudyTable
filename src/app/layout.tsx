import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StudyStoreProvider } from "@/hooks/use-study-store";

const ibmSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-noto-serif",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

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
    <html
      lang="th"
      className={`${ibmSansThai.variable} ${notoSerifThai.variable} ${ibmMono.variable} scroll-smooth`}
    >
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
