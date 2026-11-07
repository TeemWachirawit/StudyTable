"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { StudyStoreProvider } from "@/hooks/use-study-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StudyStoreProvider>{children}</StudyStoreProvider>
    </SessionProvider>
  );
}

