import { describe, expect, it } from "vitest";
import {
  buildExamFromTcas,
  dekYearToGregorian,
  findMatchingSubjectForTcas,
  getTcasExamsForCohort,
  isTcasExamAlreadyAdded,
  TCAS_EXAM_TEMPLATES,
} from "./tcas-exams";
import type { Subject } from "@/types/study";

describe("tcas-exams", () => {
  it("maps Thai Dek cohort years to Gregorian entry years", () => {
    expect(dekYearToGregorian(70)).toBe(2027);
    expect(dekYearToGregorian(71)).toBe(2028);
    expect(dekYearToGregorian(72)).toBe(2029);
  });

  it("uses official myTCAS dates for Dek70", () => {
    const dek70 = getTcasExamsForCohort(70);
    expect(dek70).toHaveLength(TCAS_EXAM_TEMPLATES.length);

    const tgat = dek70.find((e) => e.id === "tgat");
    const tpat1 = dek70.find((e) => e.id === "tpat1");
    const math1 = dek70.find((e) => e.id === "alevel-math1");

    expect(tgat?.isOfficial).toBe(true);
    expect(tgat?.date).toBe("2027-01-30");
    expect(tgat?.examTitle).toBe("TGAT ความถนัดทั่วไป (TGAT1–3) (Dek70)");
    expect(tpat1?.date).toBe("2027-02-13");
    expect(math1?.date).toBe("2027-03-14");
  });

  it("generates estimated Sat-Mon schedule for Dek71 and custom cohorts", () => {
    const dek71 = getTcasExamsForCohort(71);
    const tgat = dek71.find((e) => e.id === "tgat")!;
    const alevelBio = dek71.find((e) => e.id === "alevel-bio")!;
    const alevelMath1 = dek71.find((e) => e.id === "alevel-math1")!;

    expect(tgat.isOfficial).toBe(false);
    expect(tgat.date).toMatch(/^2027-12-\d{2}$/);
    expect(alevelBio.date).toMatch(/^2028-03-\d{2}$/);
    expect(alevelMath1.date).toMatch(/^2028-03-\d{2}$/);
    // Day 2 of A-Level should be the day immediately after Day 1
    const d1 = new Date(`${alevelBio.date}T00:00:00Z`).getTime();
    const d2 = new Date(`${alevelMath1.date}T00:00:00Z`).getTime();
    expect(d2 - d1).toBe(86_400_000);
  });

  it("auto-matches existing subjects and detects duplicates", () => {
    const subjects: Subject[] = [
      {
        id: "sub-phys",
        name: "A-Level ฟิสิกส์",
        color: "slate",
        chapters: [
          { id: "c1", title: "กลศาสตร์", done: true },
          { id: "c2", title: "ไฟฟ้า", done: false },
        ],
      },
    ];

    const dek70 = getTcasExamsForCohort(70);
    const physics = dek70.find((e) => e.id === "alevel-physics")!;
    const matched = findMatchingSubjectForTcas(physics, subjects);
    expect(matched?.id).toBe("sub-phys");

    const built = buildExamFromTcas(physics, subjects);
    expect(built.subjectId).toBe("sub-phys");
    expect(built.chapterIds).toEqual(["c1", "c2"]);
    expect(built.date).toBe("2027-03-13");
    expect(built.time).toBe("11:00");

    expect(isTcasExamAlreadyAdded(physics, [])).toBe(false);
    expect(isTcasExamAlreadyAdded(physics, [built])).toBe(true);
  });
});
