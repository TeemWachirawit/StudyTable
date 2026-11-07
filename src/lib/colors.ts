export const SUBJECT_COLORS = {
  terracotta: {
    label: "ส้มอิฐ",
    block: "bg-terracotta-tint text-terracotta-deep border-terracotta/40",
    solid: "bg-terracotta",
    text: "text-terracotta-deep",
  },
  sage: {
    label: "เขียวเสจ",
    block: "bg-sage-tint text-sage border-sage/40",
    solid: "bg-sage",
    text: "text-sage",
  },
  mustard: {
    label: "มัสตาร์ด",
    block: "bg-mustard-tint text-[#7a5a17] border-mustard/50",
    solid: "bg-mustard",
    text: "text-[#7a5a17]",
  },
  slate: {
    label: "ฟ้าเทา",
    block: "bg-slate-tint text-slate border-slate/40",
    solid: "bg-slate",
    text: "text-slate",
  },
  plum: {
    label: "ม่วงพลัม",
    block: "bg-plum-tint text-plum border-plum/40",
    solid: "bg-plum",
    text: "text-plum",
  },
} as const;

export type SubjectColor = keyof typeof SUBJECT_COLORS;

export const COLOR_KEYS = Object.keys(SUBJECT_COLORS) as SubjectColor[];

