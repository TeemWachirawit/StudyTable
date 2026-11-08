import { describe, expect, it } from "vitest";
import {
  daysUntil,
  examReadiness,
  findConflict,
  isClassBlock,
  isStudyBlock,
  suggestStudyBlocks,
  subjectProgress,
  weekdayIndex,
} from "./study";
import { isValidAvatarImage, PRESET_AVATARS } from "./avatars";
import { hashPassword, verifyPassword } from "./password";
import { checkRateLimit } from "./rate-limit";
import type { Exam, StudyBlock, StudyState, Subject } from "@/types/study";

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

describe("suggestStudyBlocks", () => {
  const math: Subject = {
    id: "sub-math",
    name: "คณิตศาสตร์",
    color: "terracotta",
    chapters: [
      { id: "c1", title: "ลิมิต", done: true },
      { id: "c2", title: "ปริพันธ์", done: false },
    ],
  };

  it("suggests non-conflicting study slots after class slots", () => {
    const classBlock: StudyBlock = {
      id: "cb1",
      subjectId: "sub-math",
      day: 0, // Monday
      startHour: 9,
      duration: 3, // 09:00 - 12:00
      topic: "บรรยาย",
      type: "class",
      location: "SC-302",
    };

    const state: StudyState = {
      subjects: [math],
      blocks: [classBlock],
      exams: [],
    };

    const suggestions = suggestStudyBlocks(state, {
      preferredWindow: "all",
      hoursPerSubject: 2,
    });

    expect(suggestions.length).toBeGreaterThan(0);
    // All suggested blocks must be of type study
    for (const sug of suggestions) {
      expect(sug.type).toBe("study");
      expect(sug.subjectId).toBe("sub-math");
      // Check that none of the suggestions conflict with the existing class
      const candidate: StudyBlock = {
        id: sug.id,
        subjectId: sug.subjectId,
        day: sug.day,
        startHour: sug.startHour,
        duration: sug.duration,
        topic: sug.topic,
        type: "study",
      };
      expect(findConflict([classBlock], candidate)).toBeUndefined();
    }
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


