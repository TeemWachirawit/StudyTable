import type { CSSProperties } from "react";

export const SUBJECT_COLORS = {
  terracotta: {
    label: "ฟ้าคราม (Sky)",
    hex: "#2563eb",
    block: "bg-terracotta-tint text-terracotta-deep border-terracotta/30",
    solid: "bg-terracotta",
    text: "text-terracotta-deep",
  },
  sage: {
    label: "เขียวมินต์ (Mint)",
    hex: "#0d9488",
    block: "bg-sage-tint text-sage-deep border-sage/30",
    solid: "bg-sage",
    text: "text-sage-deep",
  },
  mustard: {
    label: "เหลืองแอมเบอร์ (Amber)",
    hex: "#d97706",
    block: "bg-mustard-tint text-mustard-deep border-mustard/35",
    solid: "bg-mustard",
    text: "text-mustard-deep",
  },
  slate: {
    label: "ชมพูคอรัล (Coral)",
    hex: "#e11d48",
    block: "bg-slate-tint text-slate-deep border-slate/30",
    solid: "bg-slate",
    text: "text-slate-deep",
  },
  plum: {
    label: "ม่วงลาเวนเดอร์ (Violet)",
    hex: "#7c3aed",
    block: "bg-plum-tint text-plum-deep border-plum/30",
    solid: "bg-plum",
    text: "text-plum-deep",
  },
} as const;

export type PresetSubjectColor = keyof typeof SUBJECT_COLORS;

/** Supports preset keys (e.g. "terracotta") or any custom hex string (e.g. "#0ea5e9"). */
export type SubjectColor = PresetSubjectColor | (string & {});

export const COLOR_KEYS = Object.keys(SUBJECT_COLORS) as PresetSubjectColor[];

export const EXTRA_PRESET_HEX: { hex: string; label: string }[] = [
  { hex: "#0284c7", label: "ฟ้าน้ำทะเล (Ocean)" },
  { hex: "#16a34a", label: "เขียวใบไม้ (Forest)" },
  { hex: "#ea580c", label: "ส้มอิฐ (Tangerine)" },
  { hex: "#db2777", label: "ชมพูบานเย็น (Magenta)" },
  { hex: "#4f46e5", label: "ครามอินดิโก (Indigo)" },
];

export interface ResolvedSubjectColor {
  hex: string;
  label: string;
  isCustom: boolean;
  blockClass: string;
  solidClass: string;
  textClass: string;
  blockStyle?: CSSProperties;
  solidStyle?: CSSProperties;
  textStyle?: CSSProperties;
}

export function isPresetColor(color: string): color is PresetSubjectColor {
  return color in SUBJECT_COLORS;
}

/** Returns true if a #RRGGBB hex color has high perceived luminance (needs dark foreground). */
export function isLightHex(hex: string): boolean {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#2563eb";
  const r = parseInt(clean.slice(1, 3), 16) / 255;
  const g = parseInt(clean.slice(3, 5), 16) / 255;
  const b = parseInt(clean.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.62;
}

export function getSubjectColor(color: SubjectColor): ResolvedSubjectColor {
  if (isPresetColor(color)) {
    const preset = SUBJECT_COLORS[color];
    return {
      hex: preset.hex,
      label: preset.label,
      isCustom: false,
      blockClass: preset.block,
      solidClass: preset.solid,
      textClass: preset.text,
    };
  }

  const validHex = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2563eb";
  const matchedExtra = EXTRA_PRESET_HEX.find(
    (p) => p.hex.toLowerCase() === validHex.toLowerCase()
  );
  const light = isLightHex(validHex);
  const textMixPct = light ? "45%" : "72%";

  return {
    hex: validHex,
    label: matchedExtra ? matchedExtra.label : `สีกำหนดเอง (${validHex.toUpperCase()})`,
    isCustom: true,
    blockClass: "",
    solidClass: "",
    textClass: "",
    blockStyle: {
      backgroundColor: `color-mix(in srgb, ${validHex} ${light ? "20%" : "14%"}, var(--color-sheet))`,
      borderColor: `color-mix(in srgb, ${validHex} ${light ? "50%" : "40%"}, transparent)`,
      color: `color-mix(in srgb, ${validHex} ${textMixPct}, var(--color-ink))`,
    },
    solidStyle: {
      backgroundColor: validHex,
    },
    textStyle: {
      color: `color-mix(in srgb, ${validHex} ${textMixPct}, var(--color-ink))`,
    },
  };
}
