import {
  HomeworkPriority,
  HomeworkStatus,
  StudySessionType,
  SubjectColorKey,
} from "@/types/study";

export interface SubjectColorStyle {
  key: SubjectColorKey;
  label: string;
  hex: string;
  bgSoft: string;
  bgBadge: string;
  border: string;
  accentBar: string;
  text: string;
  dot: string;
}

export const SUBJECT_COLORS: Record<SubjectColorKey, SubjectColorStyle> = {
  terracotta: {
    key: "terracotta",
    label: "ดินเผา (Terracotta)",
    hex: "#C85A32",
    bgSoft: "bg-[#FDF3EE]",
    bgBadge: "bg-[#F9E3D8]",
    border: "border-[#E6BFB0]",
    accentBar: "bg-[#C85A32]",
    text: "text-[#8F391A]",
    dot: "bg-[#C85A32]",
  },
  sage: {
    key: "sage",
    label: "เขียวใบเสจ (Botanical Sage)",
    hex: "#3D6B52",
    bgSoft: "bg-[#EFF6F2]",
    bgBadge: "bg-[#DCECE2]",
    border: "border-[#B8D4C3]",
    accentBar: "bg-[#3D6B52]",
    text: "text-[#264A36]",
    dot: "bg-[#3D6B52]",
  },
  ochre: {
    key: "ochre",
    label: "เหลืองอำพัน (Warm Ochre)",
    hex: "#C27D1A",
    bgSoft: "bg-[#FDF6EB]",
    bgBadge: "bg-[#F8E8CC]",
    border: "border-[#E5C99B]",
    accentBar: "bg-[#C27D1A]",
    text: "text-[#855209]",
    dot: "bg-[#C27D1A]",
  },
  indigo: {
    key: "indigo",
    label: "ครามหม่น (Slate Indigo)",
    hex: "#3B5978",
    bgSoft: "bg-[#EFF4F9]",
    bgBadge: "bg-[#DAE6F2]",
    border: "border-[#B5C9DE]",
    accentBar: "bg-[#3B5978]",
    text: "text-[#243B52]",
    dot: "bg-[#3B5978]",
  },
  plum: {
    key: "plum",
    label: "ม่วงพลัม (Editorial Plum)",
    hex: "#7A496B",
    bgSoft: "bg-[#F8F1F6]",
    bgBadge: "bg-[#EDE0EA]",
    border: "border-[#D4B8CC]",
    accentBar: "bg-[#7A496B]",
    text: "text-[#542D48]",
    dot: "bg-[#7A496B]",
  },
  crimson: {
    key: "crimson",
    label: "แดงชาด (Academic Crimson)",
    hex: "#B83B2A",
    bgSoft: "bg-[#FCF0EE]",
    bgBadge: "bg-[#F7DCD8]",
    border: "border-[#E3B4AD]",
    accentBar: "bg-[#B83B2A]",
    text: "text-[#822215]",
    dot: "bg-[#B83B2A]",
  },
};

export const SESSION_TYPE_LABELS: Record<
  StudySessionType,
  { label: string; badgeClass: string }
> = {
  review: {
    label: "ทบทวนบทเรียน",
    badgeClass: "bg-[#F3EFE6] text-[#575049] border-[#DCD4C8]",
  },
  homework: {
    label: "ล็อกเวลาทำการบ้าน",
    badgeClass: "bg-[#FDF3EE] text-[#8F391A] border-[#E6BFB0]",
  },
  "exam-prep": {
    label: "ติวเข้มก่อนสอบ",
    badgeClass: "bg-[#FDF6EB] text-[#855209] border-[#E5C99B]",
  },
};

export const PRIORITY_STYLES: Record<
  HomeworkPriority,
  { label: string; className: string; dotColor: string }
> = {
  high: {
    label: "สำคัญมาก",
    className: "bg-[#FCF0EE] text-[#822215] border-[#E3B4AD]",
    dotColor: "bg-[#B83B2A]",
  },
  medium: {
    label: "ปานกลาง",
    className: "bg-[#FDF6EB] text-[#855209] border-[#E5C99B]",
    dotColor: "bg-[#C27D1A]",
  },
  low: {
    label: "ทั่วไป",
    className: "bg-[#F3EFE6] text-[#575049] border-[#DCD4C8]",
    dotColor: "bg-[#8A8177]",
  },
};

export const STATUS_STYLES: Record<
  HomeworkStatus,
  { label: string; className: string }
> = {
  todo: {
    label: "ยังไม่เริ่ม",
    className: "bg-[#F3EFE6] text-[#575049] border-[#DCD4C8]",
  },
  in_progress: {
    label: "กำลังทำ",
    className: "bg-[#FDF6EB] text-[#855209] border-[#E5C99B]",
  },
  done: {
    label: "เสร็จสิ้น",
    className: "bg-[#EFF6F2] text-[#264A36] border-[#B8D4C3]",
  },
};

