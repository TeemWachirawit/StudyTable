"use client";

import { useEffect, useState } from "react";

/**
 * Hook สำหรับเช็คว่า Component mount บน Client เรียบร้อยแล้ว (ป้องกัน hydration mismatch)
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

