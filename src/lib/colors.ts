export const SUBJECT_COLORS = {
  terracotta: {
    label: "ฟ้าคราม (Sky)",
    block: "bg-terracotta-tint text-terracotta-deep border-terracotta/30",
    solid: "bg-terracotta",
    text: "text-terracotta-deep",
  },
  sage: {
    label: "เขียวมินต์ (Mint)",
    block: "bg-sage-tint text-sage-deep border-sage/30",
    solid: "bg-sage",
    text: "text-sage-deep",
  },
  mustard: {
    label: "เหลืองแอมเบอร์ (Amber)",
    block: "bg-mustard-tint text-mustard-deep border-mustard/35",
    solid: "bg-mustard",
    text: "text-mustard-deep",
  },
  slate: {
    label: "ชมพูคอรัล (Coral)",
    block: "bg-slate-tint text-slate-deep border-slate/30",
    solid: "bg-slate",
    text: "text-slate-deep",
  },
  plum: {
    label: "ม่วงลาเวนเดอร์ (Violet)",
    block: "bg-plum-tint text-plum-deep border-plum/30",
    solid: "bg-plum",
    text: "text-plum-deep",
  },
} as const;

export type SubjectColor = keyof typeof SUBJECT_COLORS;

export const COLOR_KEYS = Object.keys(SUBJECT_COLORS) as SubjectColor[];
