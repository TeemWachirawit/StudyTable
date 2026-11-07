"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-7 w-7",
  xl: "h-10 w-10",
};

export function UserAvatar({ image, name, size = "md", className }: Props) {
  const [imgError, setImgError] = useState(false);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-paper-deep font-semibold text-ink shadow-2xs select-none",
        sizeClasses[size],
        className
      )}
    >
      {image && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name || "รูปโปรไฟล์ผู้ใช้"}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : initial ? (
        <span className="font-display leading-none text-terracotta-deep">
          {initial}
        </span>
      ) : (
        <User className={cn("text-ink-muted", iconSizes[size])} />
      )}
    </div>
  );
}
