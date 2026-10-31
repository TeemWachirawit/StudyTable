import type { Metadata } from "next";
import {
  IBM_Plex_Sans_Thai,
  Fraunces,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-thai",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif-editorial",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-code",
});

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
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] selection:bg-[#F9E3D8] selection:text-[#8F391A]">
        {children}
      </body>
    </html>
  );
}

