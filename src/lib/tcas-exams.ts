import { normalizeTitle } from "@/lib/library-catalog";
import { uid } from "@/lib/study";
import type { Exam, Subject } from "@/types/study";

export type TcasExamGroup = "tgat" | "tpat" | "alevel";

export interface TcasExamTemplate {
  id: string;
  group: TcasExamGroup;
  code: string;
  name: string;
  shortName: string;
  /** Default start time HH:mm */
  startTime: string;
  /** Human-readable time range shown in notes/UI */
  timeRange: string;
  /** Keywords used to auto-match a user's existing Subject (e.g. from /library) */
  subjectKeywords: string[];
  /** Official Dek70 (TCAS70) date in YYYY-MM-DD */
  dek70Date: string;
  /**
   * Relative schedule slot used to estimate dates for non-official cohorts:
   * - tgat_day1..3: Sat/Sun/Mon of TGAT/TPAT weekend
   * - tpat1: Sat of mid-Feb
   * - alevel_day1..3: Sat/Sun/Mon of mid-March
   */
  slot:
    | "tgat_day1"
    | "tgat_day2"
    | "tgat_day3"
    | "tpat1"
    | "alevel_day1"
    | "alevel_day2"
    | "alevel_day3";
}

export interface TcasResolvedExam extends TcasExamTemplate {
  dekYear: number;
  /** YYYY-MM-DD */
  date: string;
  isOfficial: boolean;
  /** Default title saved to Exam, e.g. "TGAT ความถนัดทั่วไป (Dek70)" */
  examTitle: string;
}

export interface TcasPresetBundle {
  id: string;
  label: string;
  description: string;
  examIds: string[];
}

export const POPULAR_DEK_YEARS = [70, 71, 72, 73] as const;
export const DEFAULT_DEK_YEAR = 70;
export const MIN_DEK_YEAR = 68;
export const MAX_DEK_YEAR = 85;

export const TCAS_EXAM_GROUPS: { id: TcasExamGroup; label: string; description: string }[] = [
  { id: "tgat", label: "TGAT", description: "ความถนัดทั่วไป (TGAT1–3)" },
  { id: "tpat", label: "TPAT", description: "ความถนัดวิชาชีพ (TPAT1–5)" },
  { id: "alevel", label: "A-Level", description: "วิชาสามัญประยุกต์ (10 วิชา)" },
];

export const TCAS_EXAM_TEMPLATES: TcasExamTemplate[] = [
  // ── TGAT ──────────────────────────────────────────────────────────────
  {
    id: "tgat",
    group: "tgat",
    code: "TGAT",
    name: "TGAT ความถนัดทั่วไป (TGAT1–3)",
    shortName: "TGAT ความถนัดทั่วไป",
    startTime: "13:00",
    timeRange: "13:00–16:00 น.",
    subjectKeywords: ["tgat", "tgat1", "tgat2", "tgat3"],
    dek70Date: "2027-01-30",
    slot: "tgat_day1",
  },

  // ── TPAT ──────────────────────────────────────────────────────────────
  {
    id: "tpat1",
    group: "tpat",
    code: "TPAT1",
    name: "TPAT1 วิชาเฉพาะ กสพท",
    shortName: "TPAT1 วิชาเฉพาะ กสพท",
    startTime: "08:30",
    timeRange: "08:30–12:30 น.",
    subjectKeywords: ["tpat1", "กสพท", "ความถนัดแพทย์"],
    dek70Date: "2027-02-13",
    slot: "tpat1",
  },
  {
    id: "tpat2",
    group: "tpat",
    code: "TPAT2",
    name: "TPAT2 ความถนัดศิลปกรรมศาสตร์",
    shortName: "TPAT2 ศิลปกรรมศาสตร์",
    startTime: "13:00",
    timeRange: "13:00–16:00 น.",
    subjectKeywords: ["tpat2", "ศิลปกรรม"],
    dek70Date: "2027-01-31",
    slot: "tgat_day2",
  },
  {
    id: "tpat3",
    group: "tpat",
    code: "TPAT3",
    name: "TPAT3 ความถนัดวิทย์-เทคโนโลยี-วิศวะ",
    shortName: "TPAT3 วิทย์-วิศวะ",
    startTime: "09:00",
    timeRange: "09:00–12:00 น.",
    subjectKeywords: ["tpat3", "ความถนัดวิทย์", "วิศวะ"],
    dek70Date: "2027-01-30",
    slot: "tgat_day1",
  },
  {
    id: "tpat4",
    group: "tpat",
    code: "TPAT4",
    name: "TPAT4 ความถนัดสถาปัตยกรรมศาสตร์",
    shortName: "TPAT4 สถาปัตยกรรม",
    startTime: "09:00",
    timeRange: "09:00–12:00 น.",
    subjectKeywords: ["tpat4", "สถาปัตย์", "สถาปัตยกรรม"],
    dek70Date: "2027-02-01",
    slot: "tgat_day3",
  },
  {
    id: "tpat5",
    group: "tpat",
    code: "TPAT5",
    name: "TPAT5 ความถนัดครุศาสตร์-ศึกษาศาสตร์",
    shortName: "TPAT5 ครุศาสตร์-ศึกษาศาสตร์",
    startTime: "09:00",
    timeRange: "09:00–12:00 น.",
    subjectKeywords: ["tpat5", "ครุศาสตร์", "ศึกษาศาสตร์"],
    dek70Date: "2027-01-31",
    slot: "tgat_day2",
  },

  // ── A-Level ───────────────────────────────────────────────────────────
  {
    id: "alevel-bio",
    group: "alevel",
    code: "A-Level",
    name: "A-Level ชีววิทยา",
    shortName: "ชีววิทยา",
    startTime: "08:30",
    timeRange: "08:30–10:00 น.",
    subjectKeywords: ["a-level ชีววิทยา", "ชีววิทยา"],
    dek70Date: "2027-03-13",
    slot: "alevel_day1",
  },
  {
    id: "alevel-physics",
    group: "alevel",
    code: "A-Level",
    name: "A-Level ฟิสิกส์",
    shortName: "ฟิสิกส์",
    startTime: "11:00",
    timeRange: "11:00–12:30 น.",
    subjectKeywords: ["a-level ฟิสิกส์", "ฟิสิกส์"],
    dek70Date: "2027-03-13",
    slot: "alevel_day1",
  },
  {
    id: "alevel-thai",
    group: "alevel",
    code: "A-Level",
    name: "A-Level ภาษาไทย",
    shortName: "ภาษาไทย",
    startTime: "13:30",
    timeRange: "13:30–15:00 น.",
    subjectKeywords: ["a-level ภาษาไทย", "ภาษาไทย"],
    dek70Date: "2027-03-13",
    slot: "alevel_day1",
  },
  {
    id: "alevel-social",
    group: "alevel",
    code: "A-Level",
    name: "A-Level สังคมศึกษา",
    shortName: "สังคมศึกษา",
    startTime: "15:30",
    timeRange: "15:30–17:00 น.",
    subjectKeywords: ["a-level สังคมศึกษา", "สังคมศึกษา"],
    dek70Date: "2027-03-13",
    slot: "alevel_day1",
  },
  {
    id: "alevel-math1",
    group: "alevel",
    code: "A-Level",
    name: "A-Level คณิตศาสตร์ประยุกต์ 1",
    shortName: "คณิตประยุกต์ 1",
    startTime: "08:30",
    timeRange: "08:30–10:00 น.",
    subjectKeywords: ["คณิตศาสตร์ประยุกต์ 1", "คณิต 1", "คณิต1"],
    dek70Date: "2027-03-14",
    slot: "alevel_day2",
  },
  {
    id: "alevel-eng",
    group: "alevel",
    code: "A-Level",
    name: "A-Level ภาษาอังกฤษ",
    shortName: "ภาษาอังกฤษ",
    startTime: "11:00",
    timeRange: "11:00–12:30 น.",
    subjectKeywords: ["a-level ภาษาอังกฤษ", "ภาษาอังกฤษ"],
    dek70Date: "2027-03-14",
    slot: "alevel_day2",
  },
  {
    id: "alevel-chem",
    group: "alevel",
    code: "A-Level",
    name: "A-Level เคมี",
    shortName: "เคมี",
    startTime: "13:30",
    timeRange: "13:30–15:00 น.",
    subjectKeywords: ["a-level เคมี", "เคมี"],
    dek70Date: "2027-03-14",
    slot: "alevel_day2",
  },
  {
    id: "alevel-math2",
    group: "alevel",
    code: "A-Level",
    name: "A-Level คณิตศาสตร์ประยุกต์ 2",
    shortName: "คณิตประยุกต์ 2",
    startTime: "08:30",
    timeRange: "08:30–10:00 น.",
    subjectKeywords: ["คณิตศาสตร์ประยุกต์ 2", "คณิต 2", "คณิต2"],
    dek70Date: "2027-03-15",
    slot: "alevel_day3",
  },
  {
    id: "alevel-sci",
    group: "alevel",
    code: "A-Level",
    name: "A-Level วิทยาศาสตร์ประยุกต์",
    shortName: "วิทยาศาสตร์ประยุกต์",
    startTime: "11:00",
    timeRange: "11:00–12:30 น.",
    subjectKeywords: ["วิทยาศาสตร์ประยุกต์", "วิทย์ประยุกต์"],
    dek70Date: "2027-03-15",
    slot: "alevel_day3",
  },
  {
    id: "alevel-lang",
    group: "alevel",
    code: "A-Level",
    name: "A-Level ภาษาต่างประเทศ",
    shortName: "ภาษาต่างประเทศ",
    startTime: "13:30",
    timeRange: "13:30–15:00 น.",
    subjectKeywords: ["ภาษาต่างประเทศ", "ภาษาญี่ปุ่น", "ภาษาจีน", "ภาษาเกาหลี", "ภาษาฝรั่งเศส", "ภาษาเยอรมัน"],
    dek70Date: "2027-03-15",
    slot: "alevel_day3",
  },
];

export const TCAS_PRESET_BUNDLES: TcasPresetBundle[] = [
  {
    id: "med",
    label: "สายแพทย์ (กสพท)",
    description: "TGAT, TPAT1, A-Level 7 วิชาหลัก",
    examIds: [
      "tgat",
      "tpat1",
      "alevel-bio",
      "alevel-physics",
      "alevel-thai",
      "alevel-social",
      "alevel-math1",
      "alevel-eng",
      "alevel-chem",
    ],
  },
  {
    id: "eng",
    label: "สายวิศวะ / STEM",
    description: "TGAT, TPAT3, คณิต 1, ฟิสิกส์, เคมี, อังกฤษ",
    examIds: ["tgat", "tpat3", "alevel-math1", "alevel-physics", "alevel-chem", "alevel-eng"],
  },
  {
    id: "arts-math",
    label: "สายศิลป์-คำนวณ / บริหาร",
    description: "TGAT, คณิต 2, อังกฤษ, ไทย, สังคม",
    examIds: ["tgat", "alevel-math2", "alevel-eng", "alevel-thai", "alevel-social"],
  },
];

/** Converts Thai Dek cohort number (e.g. 70 -> 2570 BE) to Gregorian academic entry year (2027). */
export function dekYearToGregorian(dekYear: number): number {
  return 1957 + dekYear;
}

/** Returns the Nth Saturday (1-based) of a given Gregorian year & 1-based month as YYYY-MM-DD. */
function nthSaturday(year: number, month: number, n: number): Date {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const dayOfWeek = firstOfMonth.getUTCDay(); // 0=Sun .. 6=Sat
  const offsetToFirstSat = (6 - dayOfWeek + 7) % 7;
  const day = 1 + offsetToFirstSat + (n - 1) * 7;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysUTC(date: Date, days: number): string {
  const d = new Date(date.getTime() + days * 86_400_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Resolves all TCAS exam dates for a given Dek cohort (e.g. 70, 71, 72...).
 * - Dek70 uses the official myTCAS TCAS70 dates (Jan 30 – Feb 1, Feb 13, Mar 13 – 15, 2027).
 * - Other cohorts use estimated Sat–Mon windows based on standard myTCAS calendars (marked isOfficial = false).
 */
export function getTcasExamsForCohort(dekYear: number): TcasResolvedExam[] {
  const safeDek = Math.max(MIN_DEK_YEAR, Math.min(MAX_DEK_YEAR, Math.floor(dekYear)));
  const isOfficial = safeDek === 70;
  const entryYear = dekYearToGregorian(safeDek);

  // Standard estimated anchors for non-official cohorts:
  // - TGAT/TPAT2-5: 2nd Saturday of December (entryYear - 1)
  // - TPAT1: 2nd Saturday of February (entryYear)
  // - A-Level: 2nd Saturday of March (entryYear)
  const tgatSat = nthSaturday(entryYear - 1, 12, 2);
  const tpat1Sat = nthSaturday(entryYear, 2, 2);
  const alevelSat = nthSaturday(entryYear, 3, 2);

  const slotDate: Record<TcasExamTemplate["slot"], string> = {
    tgat_day1: addDaysUTC(tgatSat, 0),
    tgat_day2: addDaysUTC(tgatSat, 1),
    tgat_day3: addDaysUTC(tgatSat, 2),
    tpat1: addDaysUTC(tpat1Sat, 0),
    alevel_day1: addDaysUTC(alevelSat, 0),
    alevel_day2: addDaysUTC(alevelSat, 1),
    alevel_day3: addDaysUTC(alevelSat, 2),
  };

  return TCAS_EXAM_TEMPLATES.map((tpl) => ({
    ...tpl,
    dekYear: safeDek,
    date: isOfficial ? tpl.dek70Date : slotDate[tpl.slot],
    isOfficial,
    examTitle: `${tpl.name} (Dek${safeDek})`,
  }));
}

/** Finds a matching user Subject for a TCAS exam so chapter readiness links automatically. */
export function findMatchingSubjectForTcas(
  exam: TcasExamTemplate,
  subjects: Subject[]
): Subject | null {
  if (subjects.length === 0) return null;
  const normalizedName = normalizeTitle(exam.name);

  // 1. Exact subject name match (e.g., imported directly from /library)
  const exact = subjects.find((s) => normalizeTitle(s.name) === normalizedName);
  if (exact) return exact;

  // 2. Keyword match in priority order
  for (const kw of exam.subjectKeywords) {
    const k = normalizeTitle(kw);
    const match = subjects.find((s) => normalizeTitle(s.name).includes(k));
    if (match) return match;
  }

  return null;
}

/** Checks if a resolved TCAS exam is already present in the user's exam list. */
export function isTcasExamAlreadyAdded(resolved: TcasResolvedExam, exams: Exam[]): boolean {
  const targetTitle = normalizeTitle(resolved.examTitle);
  const targetShort = normalizeTitle(resolved.name);
  return exams.some((e) => {
    const existingTitle = normalizeTitle(e.title);
    if (existingTitle === targetTitle) return true;
    if (e.date === resolved.date && existingTitle.includes(targetShort)) return true;
    return false;
  });
}

/** Converts a resolved TCAS exam into a StudyTable Exam entity. */
export function buildExamFromTcas(resolved: TcasResolvedExam, subjects: Subject[]): Exam {
  const matched = findMatchingSubjectForTcas(resolved, subjects);
  const scheduleTag = resolved.isOfficial
    ? `กำหนดการจริง ทปอ. TCAS${resolved.dekYear}`
    : `วันสอบคาดการณ์ Dek${resolved.dekYear} (ตรวจสอบและปรับแก้ได้เมื่อ ทปอ. ประกาศจริง)`;

  return {
    id: uid(),
    subjectId: matched?.id ?? "",
    title: resolved.examTitle,
    date: resolved.date,
    time: resolved.startTime,
    chapterIds: matched ? matched.chapters.map((c) => c.id) : [],
    extraTopics: [],
    notes: `เวลาสอบ ${resolved.timeRange} · ${scheduleTag}`,
  };
}
