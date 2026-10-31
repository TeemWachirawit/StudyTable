import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  getBlockDurationMinutes,
  findConflictingBlocks,
  createStudyBlockFromHomework,
  calculateHomeworkProgress,
  getDueUrgency,
  getExamReadiness,
  calculateSubjectAnalytics,
  calculateDailyStudyLoad,
} from "../planner-engine";
import {
  StudyBlock,
  HomeworkItem,
  ExamGoal,
  Subject,
} from "@/types/study";

describe("StudyTable Planner Domain Engine (TDD)", () => {
  describe("Time parsing and duration calculation", () => {
    it("parses HH:mm into minutes from midnight accurately", () => {
      expect(parseTimeToMinutes("00:00")).toBe(0);
      expect(parseTimeToMinutes("08:30")).toBe(510);
      expect(parseTimeToMinutes("18:45")).toBe(1125);
    });

    it("calculates study block duration in minutes", () => {
      expect(
        getBlockDurationMinutes({
          startTime: "17:00",
          endTime: "19:30",
        })
      ).toBe(150);
    });
  });

  describe("Timetable conflict detection", () => {
    const existingBlocks: StudyBlock[] = [
      {
        id: "block-1",
        subjectId: "sub-math",
        title: "สรุปสูตรแคลคูลัส บทที่ 1-2",
        dayOfWeek: 0,
        startTime: "18:00",
        endTime: "20:00",
        sessionType: "review",
        completed: false,
      },
      {
        id: "block-2",
        subjectId: "sub-phys",
        title: "ตะลุยโจทย์กลศาสตร์",
        dayOfWeek: 1,
        startTime: "18:00",
        endTime: "20:00",
        sessionType: "exam-prep",
        completed: false,
      },
    ];

    it("detects overlapping time slots on the same day", () => {
      const conflicts = findConflictingBlocks(existingBlocks, {
        dayOfWeek: 0,
        startTime: "19:00",
        endTime: "21:00",
      });
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe("block-1");
    });

    it("allows adjacent non-overlapping blocks (end == start)", () => {
      const conflicts = findConflictingBlocks(existingBlocks, {
        dayOfWeek: 0,
        startTime: "20:00",
        endTime: "21:30",
      });
      expect(conflicts).toHaveLength(0);
    });

    it("ignores itself when editing an existing study block", () => {
      const conflicts = findConflictingBlocks(
        existingBlocks,
        {
          dayOfWeek: 0,
          startTime: "18:30",
          endTime: "20:30",
        },
        "block-1"
      );
      expect(conflicts).toHaveLength(0);
    });
  });

  describe("Homework-to-Timetable Bridge", () => {
    const sampleHomework: HomeworkItem = {
      id: "hw-101",
      subjectId: "sub-math",
      title: "แบบฝึกหัดท้ายบท เรื่อง ลิมิตและความต่อเนื่อง",
      dueDate: "2026-11-03",
      priority: "high",
      status: "in_progress",
      estimatedMinutes: 90,
      subtasks: [
        { id: "st-1", title: "ข้อ 1-10 (หาค่าลิมิตด้วยกราฟ)", completed: true },
        { id: "st-2", title: "ข้อ 11-20 (พิสูจน์ความต่อเนื่อง)", completed: false },
      ],
      scheduledBlockIds: [],
    };

    it("converts a homework item into a linked StudyBlock with correct duration and metadata", () => {
      const block = createStudyBlockFromHomework(sampleHomework, {
        dayOfWeek: 2,
        startTime: "17:30",
        durationMinutes: 90,
      });

      expect(block.subjectId).toBe("sub-math");
      expect(block.dayOfWeek).toBe(2);
      expect(block.startTime).toBe("17:30");
      expect(block.endTime).toBe("19:00");
      expect(block.sessionType).toBe("homework");
      expect(block.linkedHomeworkId).toBe("hw-101");
      expect(block.title).toContain("แบบฝึกหัดท้ายบท เรื่อง ลิมิตและความต่อเนื่อง");
    });
  });

  describe("Homework Progress & Due Date Urgency", () => {
    it("calculates subtask completion percentage accurately", () => {
      const hwWithSubtasks: HomeworkItem = {
        id: "hw-1",
        subjectId: "sub-eng",
        title: "เขียน Essay 500 คำ",
        dueDate: "2026-11-02",
        priority: "medium",
        status: "in_progress",
        estimatedMinutes: 60,
        subtasks: [
          { id: "1", title: "วาง Outline", completed: true },
          { id: "2", title: "เขียน Draft แรก", completed: true },
          { id: "3", title: "ตรวจ Grammar", completed: false },
          { id: "4", title: "จัดหน้าส่งอาจารย์", completed: false },
        ],
        scheduledBlockIds: [],
      };

      const progress = calculateHomeworkProgress(hwWithSubtasks);
      expect(progress.completedCount).toBe(2);
      expect(progress.totalCount).toBe(4);
      expect(progress.percentage).toBe(50);
    });

    it("evaluates due date urgency relative to reference date", () => {
      const refDate = "2026-10-31";
      expect(getDueUrgency("2026-10-29", false, refDate)).toEqual({
        daysDiff: -2,
        level: "overdue",
        label: "เลยกำหนด 2 วัน",
      });
      expect(getDueUrgency("2026-10-31", false, refDate)).toEqual({
        daysDiff: 0,
        level: "today",
        label: "ส่งวันนี้",
      });
      expect(getDueUrgency("2026-11-01", false, refDate)).toEqual({
        daysDiff: 1,
        level: "soon",
        label: "พรุ่งนี้",
      });
      expect(getDueUrgency("2026-10-29", true, refDate).level).toBe("completed");
    });
  });

  describe("Exam Countdown & Syllabus Readiness", () => {
    it("calculates days remaining and syllabus completion readiness", () => {
      const exam: ExamGoal = {
        id: "exam-1",
        subjectId: "sub-bio",
        title: "สอบกลางภาค ชีววิทยาเซลล์",
        examDate: "2026-11-10",
        topics: [
          { id: "t1", title: "โครงสร้างเยื่อหุ้มเซลล์", completed: true },
          { id: "t2", title: "การหายใจระดับเซลล์", completed: true },
          { id: "t3", title: "การแบ่งเซลล์ไมโทซิส-ไมโอซิส", completed: false },
        ],
      };

      const readiness = getExamReadiness(exam, "2026-10-31");
      expect(readiness.daysRemaining).toBe(10);
      expect(readiness.completedTopics).toBe(2);
      expect(readiness.totalTopics).toBe(3);
      expect(readiness.readinessPercent).toBe(67);
    });
  });

  describe("Study Hours Analytics", () => {
    const subjects: Subject[] = [
      {
        id: "sub-math",
        code: "MATH101",
        name: "แคลคูลัส 1",
        color: "terracotta",
        weeklyTargetHours: 4,
      },
    ];

    const blocks: StudyBlock[] = [
      {
        id: "b1",
        subjectId: "sub-math",
        title: "อ่านลิมิต",
        dayOfWeek: 0,
        startTime: "18:00",
        endTime: "20:00",
        sessionType: "review",
        completed: true,
      },
      {
        id: "b2",
        subjectId: "sub-math",
        title: "ทำการบ้านดิฟ",
        dayOfWeek: 2,
        startTime: "19:00",
        endTime: "20:00",
        sessionType: "homework",
        completed: false,
      },
    ];

    const homeworks: HomeworkItem[] = [
      {
        id: "hw1",
        subjectId: "sub-math",
        title: "แบบฝึกหัดดิฟ",
        dueDate: "2026-11-04",
        priority: "high",
        status: "todo",
        estimatedMinutes: 60,
        subtasks: [],
        scheduledBlockIds: [],
      },
    ];

    it("aggregates planned vs completed hours and homework counts per subject", () => {
      const stats = calculateSubjectAnalytics(subjects, blocks, homeworks);
      expect(stats).toHaveLength(1);
      expect(stats[0].plannedHours).toBe(3);
      expect(stats[0].completedHours).toBe(2);
      expect(stats[0].targetProgressRate).toBe(50); // 2 of 4 target hours
      expect(stats[0].pendingHomeworkCount).toBe(1);
    });

    it("computes daily study load across all 7 days of the week", () => {
      const daily = calculateDailyStudyLoad(blocks);
      expect(daily).toHaveLength(7);
      expect(daily[0].plannedHours).toBe(2);
      expect(daily[0].completedHours).toBe(2);
      expect(daily[2].plannedHours).toBe(1);
      expect(daily[2].completedHours).toBe(0);
    });
  });
});

