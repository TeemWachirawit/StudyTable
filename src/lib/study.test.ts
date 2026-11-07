import { describe, expect, it } from "vitest";
import {
  daysUntil,
  examReadiness,
  findConflict,
  subjectProgress,
  weekdayIndex,
} from "./study";
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

