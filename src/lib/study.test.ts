import { describe, expect, it } from "vitest";
import {
  blockDurationMinutes,
  daysUntil,
  examReadiness,
  findConflict,
  formatBlockTime,
  formatClock,
  formatDuration,
  formatStudySeconds,
  getTodayTodoItems,
  isClassBlock,
  isStudyBlock,
  orderSubjectsWithPinned,
  subjectProgress,
  weekdayIndex,
} from "./study";
import { isValidAvatarImage, PRESET_AVATARS } from "./avatars";
import {
  LIBRARY_CATALOG,
  filterLibraryItems,
  getLibraryMatchStatus,
} from "./library-catalog";
import { hashPassword, verifyPassword } from "./password";
import { checkRateLimit } from "./rate-limit";
import type { Exam, StudyBlock, Subject } from "@/types/study";

describe("weekdayIndex", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    // 2026-11-02 is Monday, 2026-11-08 is Sunday
    expect(weekdayIndex(new Date(2026, 10, 2))).toBe(0);
    expect(weekdayIndex(new Date(2026, 10, 8))).toBe(6);
  });
});

describe("daysUntil", () => {
  it("calculates positive, zero, and negative day differences accurately", () => {
    const today = new Date(2026, 10, 7, 15, 30); // 2026-11-07
    expect(daysUntil("2026-11-07", today)).toBe(0);
    expect(daysUntil("2026-11-12", today)).toBe(5);
    expect(daysUntil("2026-11-04", today)).toBe(-3);
  });
});

describe("subjectProgress", () => {
  it("returns 0% when subject has no chapters", () => {
    const subject: Subject = {
      id: "s1",
      name: "คณิตศาสตร์",
      color: "terracotta",
      chapters: [],
    };
    expect(subjectProgress(subject)).toEqual({ done: 0, total: 0, pct: 0 });
  });

  it("calculates done count and rounded percentage", () => {
    const subject: Subject = {
      id: "s1",
      name: "คณิตศาสตร์",
      color: "terracotta",
      chapters: [
        { id: "c1", title: "บทที่ 1", done: true },
        { id: "c2", title: "บทที่ 2", done: true },
        { id: "c3", title: "บทที่ 3", done: false },
      ],
    };
    expect(subjectProgress(subject)).toEqual({ done: 2, total: 3, pct: 67 });
  });
});

describe("findConflict", () => {
  const existing: StudyBlock[] = [
    {
      id: "b1",
      subjectId: "s1",
      day: 0,
      startHour: 17,
      duration: 2, // 17:00 - 19:00
      topic: "อนุพันธ์",
    },
  ];

  it("detects overlapping blocks on the same day", () => {
    const candidate: StudyBlock = {
      id: "b2",
      subjectId: "s2",
      day: 0,
      startHour: 18,
      duration: 2, // 18:00 - 20:00
      topic: "ฟิสิกส์",
    };
    expect(findConflict(existing, candidate)?.id).toBe("b1");
  });

  it("allows adjacent non-overlapping blocks and ignores self", () => {
    const adjacent: StudyBlock = {
      id: "b2",
      subjectId: "s2",
      day: 0,
      startHour: 19,
      duration: 2, // 19:00 - 21:00
      topic: "ชีววิทยา",
    };
    expect(findConflict(existing, adjacent)).toBeUndefined();
    expect(findConflict(existing, existing[0])).toBeUndefined();
  });

  it("handles minute-level overlap and adjacency correctly", () => {
    const existingWithMinutes: StudyBlock[] = [
      {
        id: "bm1",
        subjectId: "s1",
        day: 1,
        startHour: 8,
        startMinute: 30,
        endHour: 10,
        endMinute: 0,
        duration: 1.5,
        topic: "Calculus",
      },
    ];

    // Overlaps 09:30 - 11:00
    const overlapping: StudyBlock = {
      id: "bm2",
      subjectId: "s2",
      day: 1,
      startHour: 9,
      startMinute: 30,
      endHour: 11,
      endMinute: 0,
      duration: 1.5,
      topic: "Physics",
    };
    expect(findConflict(existingWithMinutes, overlapping)?.id).toBe("bm1");

    // Exactly adjacent 10:00 - 11:30 (should NOT conflict)
    const adjacent: StudyBlock = {
      id: "bm3",
      subjectId: "s2",
      day: 1,
      startHour: 10,
      startMinute: 0,
      endHour: 11,
      endMinute: 30,
      duration: 1.5,
      topic: "Chemistry",
    };
    expect(findConflict(existingWithMinutes, adjacent)).toBeUndefined();
  });
});

describe("examReadiness", () => {
  const subject: Subject = {
    id: "s1",
    name: "ฟิสิกส์",
    color: "slate",
    chapters: [
      { id: "c1", title: "ไฟฟ้าสถิต", done: true },
      { id: "c2", title: "ไฟฟ้ากระแส", done: false },
      { id: "c3", title: "แม่เหล็ก", done: true },
    ],
  };

  it("computes readiness only for chapters included in the exam", () => {
    const exam: Exam = {
      id: "e1",
      subjectId: "s1",
      title: "สอบกลางภาค",
      date: "2026-11-20",
      time: "09:00",
      chapterIds: ["c1", "c2"],
      extraTopics: [],
      notes: "",
    };
    expect(examReadiness(exam, subject)).toEqual({ done: 1, total: 2, pct: 50 });
  });
});

describe("isClassBlock and isStudyBlock", () => {
  it("identifies class block vs study block accurately", () => {
    const classBlock: StudyBlock = {
      id: "b1",
      subjectId: "s1",
      day: 0,
      startHour: 9,
      duration: 3,
      topic: "Lecture",
      type: "class",
      location: "Room 302",
    };
    const studyBlock: StudyBlock = {
      id: "b2",
      subjectId: "s1",
      day: 0,
      startHour: 18,
      duration: 2,
      topic: "Revision",
      type: "study",
    };
    const untypedBlock: StudyBlock = {
      id: "b3",
      subjectId: "s1",
      day: 1,
      startHour: 19,
      duration: 1,
      topic: "Reading",
    };

    expect(isClassBlock(classBlock)).toBe(true);
    expect(isStudyBlock(classBlock)).toBe(false);

    expect(isClassBlock(studyBlock)).toBe(false);
    expect(isStudyBlock(studyBlock)).toBe(true);

    expect(isClassBlock(untypedBlock)).toBe(false);
    expect(isStudyBlock(untypedBlock)).toBe(true);
  });
});

describe("security utilities", () => {
  it("validates safe avatar images and rejects arbitrary SVG data URIs", () => {
    expect(isValidAvatarImage(PRESET_AVATARS[0].url)).toBe(true);
    expect(isValidAvatarImage("https://example.com/avatar.png")).toBe(true);
    expect(isValidAvatarImage("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(
      isValidAvatarImage('data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>')
    ).toBe(false);
    expect(isValidAvatarImage("javascript:alert(1)")).toBe(false);
  });

  it("hashes and verifies passwords safely while enforcing max length", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
    expect(await verifyPassword("wrongpass", hash)).toBe(false);
    expect(await verifyPassword("a".repeat(200), hash)).toBe(false);
  });

  it("enforces rate limits per key", () => {
    const key = `test-key-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    const blocked = checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("time and duration formatters", () => {
  it("formats block time with hours and minutes", () => {
    const b: StudyBlock = {
      id: "b1",
      subjectId: "s1",
      day: 0,
      startHour: 8,
      startMinute: 30,
      endHour: 10,
      endMinute: 15,
      duration: 1.75,
      topic: "",
    };
    expect(formatBlockTime(b)).toBe("08:30–10:15");
  });

  it("formats duration into Thai hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 ชม. 30 นาที");
    expect(formatDuration(60)).toBe("1 ชม.");
    expect(formatDuration(45)).toBe("45 นาที");
    expect(formatDuration(150)).toBe("2 ชม. 30 นาที");
  });

  it("formats accumulated study seconds and focus clock", () => {
    expect(formatStudySeconds(0)).toBe("0 นาที");
    expect(formatStudySeconds(45)).toBe("45 วินาที");
    expect(formatStudySeconds(60)).toBe("1 นาที");
    expect(formatStudySeconds(1500)).toBe("25 นาที");
    expect(formatStudySeconds(5400)).toBe("1 ชม. 30 นาที");
    expect(formatStudySeconds(7200)).toBe("2 ชม.");

    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(1500)).toBe("25:00");
    expect(formatClock(3661)).toBe("01:01:01");
  });
});

describe("library catalog", () => {
  it("contains valid unique items within API payload limits", () => {
    const ids = new Set<string>();
    expect(LIBRARY_CATALOG.length).toBeGreaterThan(0);

    for (const item of LIBRARY_CATALOG) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(item.name.length).toBeLessThanOrEqual(120);
      expect(item.chapters.length).toBeGreaterThan(0);
      expect(item.chapters.length).toBeLessThanOrEqual(300);
      for (const ch of item.chapters) {
        expect(ch.trim().length).toBeGreaterThan(0);
        expect(ch.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it("filters items by category, subject name, code, and chapter title", () => {
    const tgatOnly = filterLibraryItems(LIBRARY_CATALOG, "tgat", "");
    expect(tgatOnly.length).toBe(3);
    expect(tgatOnly.every((i) => i.category === "tgat")).toBe(true);

    const byChapter = filterLibraryItems(LIBRARY_CATALOG, "all", "แคลคูลัส");
    expect(byChapter.some((i) => i.id === "alevel-math1")).toBe(true);

    const byCode = filterLibraryItems(LIBRARY_CATALOG, "alevel", "math 2");
    expect(byCode.map((i) => i.id)).toEqual(["alevel-math2"]);
  });

  it("detects unmatched, partially imported, and fully imported subjects", () => {
    const tgat3 = LIBRARY_CATALOG.find((i) => i.id === "tgat3-workforce")!;

    const unmatched = getLibraryMatchStatus(tgat3, []);
    expect(unmatched.matchedSubject).toBeNull();
    expect(unmatched.isFullyImported).toBe(false);
    expect(unmatched.missingChapters).toEqual(tgat3.chapters);

    const partialSubject: Subject = {
      id: "sub-1",
      name: tgat3.name,
      color: "sage",
      chapters: [
        { id: "c1", title: tgat3.chapters[0], done: true },
        { id: "c2", title: tgat3.chapters[1], done: false },
      ],
    };
    const partial = getLibraryMatchStatus(tgat3, [partialSubject]);
    expect(partial.matchedSubject?.id).toBe("sub-1");
    expect(partial.existingChapterCount).toBe(2);
    expect(partial.missingChapters).toEqual(tgat3.chapters.slice(2));
    expect(partial.isFullyImported).toBe(false);

    const fullSubject: Subject = {
      id: "sub-2",
      name: `  ${tgat3.name}  `,
      color: "sage",
      chapters: tgat3.chapters.map((title, idx) => ({
        id: `c-${idx}`,
        title,
        done: idx === 0,
      })),
    };
    const full = getLibraryMatchStatus(tgat3, [fullSubject]);
    expect(full.isFullyImported).toBe(true);
    expect(full.missingChapters).toEqual([]);
  });
});

describe("today todo and subject pinning", () => {
  const s1: Subject = { id: "s1", name: "คณิตศาสตร์", color: "terracotta", chapters: [] };
  const s2: Subject = { id: "s2", name: "ฟิสิกส์", color: "slate", chapters: [] };
  const s3: Subject = { id: "s3", name: "ชีววิทยา", color: "sage", chapters: [] };

  it("builds today todo list from today's study blocks and custom todos only", () => {
    // 2026-11-27 is Friday -> weekdayIndex = 4
    const friday = new Date(2026, 10, 27, 10, 0);
    const result = getTodayTodoItems(
      {
        subjects: [s1, s2, s3],
        blocks: [
          { id: "b-class", subjectId: "s1", day: 4, startHour: 9, duration: 2, topic: "Lecture", type: "class" },
          { id: "b-late", subjectId: "s2", day: 4, startHour: 20, duration: 1, topic: "โจทย์ไฟฟ้า", type: "study" },
          { id: "b-early", subjectId: "s1", day: 4, startHour: 17, duration: 2, topic: "แคลคูลัส", type: "study" },
          { id: "b-other-day", subjectId: "s3", day: 0, startHour: 18, duration: 1, topic: "เซลล์", type: "study" },
        ],
        exams: [],
        todos: [
          { id: "t-block", date: "2026-11-27", subjectId: "s1", title: "แคลคูลัส", done: true, sourceBlockId: "b-early" },
          { id: "t-custom", date: "2026-11-27", subjectId: "s3", title: "ทบทวนพันธุศาสตร์", done: false },
          { id: "t-yesterday", date: "2026-11-26", subjectId: "s2", title: "งานเมื่อวาน", done: false },
        ],
      },
      friday
    );

    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toMatchObject({ source: "planner", id: "b-early", done: true, subjectId: "s1" });
    expect(result.items[1]).toMatchObject({ source: "planner", id: "b-late", done: false, subjectId: "s2" });
    expect(result.items[2]).toMatchObject({ source: "custom", id: "t-custom", done: false, subjectId: "s3" });
    expect(result.done).toBe(1);
    expect(result.total).toBe(3);
    expect(result.pct).toBe(33);
  });

  it("moves pinned subject to index 0 while preserving order of others", () => {
    expect(orderSubjectsWithPinned([s1, s2, s3], "s3").map((s) => s.id)).toEqual(["s3", "s1", "s2"]);
    expect(orderSubjectsWithPinned([s1, s2, s3], "s1").map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
    expect(orderSubjectsWithPinned([s1, s2, s3], "missing").map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
    expect(orderSubjectsWithPinned([s1, s2, s3], null).map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
  });
});



