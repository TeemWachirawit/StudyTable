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

  return {
    hex: validHex,
    label: matchedExtra ? matchedExtra.label : `สีกำหนดเอง (${validHex.toUpperCase()})`,
    isCustom: true,
    blockClass: "",
    solidClass: "",
    textClass: "",
    blockStyle: {
      backgroundColor: `color-mix(in srgb, ${validHex} 12%, #ffffff)`,
      borderColor: `color-mix(in srgb, ${validHex} 35%, transparent)`,
      color: `color-mix(in srgb, ${validHex} 78%, #0f172a)`,
    },
    solidStyle: {
      backgroundColor: validHex,
    },
    textStyle: {
      color: `color-mix(in srgb, ${validHex} 82%, #0f172a)`,
    },
  };
}
