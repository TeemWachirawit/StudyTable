"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DayOfWeek,
  ExamGoal,
  HomeworkItem,
  HomeworkStatus,
  StudyBlock,
  Subject,
} from "@/types/study";
import {
  INITIAL_EXAMS,
  INITIAL_HOMEWORKS,
  INITIAL_STUDY_BLOCKS,
  INITIAL_SUBJECTS,
} from "@/data/seed-data";
import { createStudyBlockFromHomework } from "@/lib/planner-engine";

const STORAGE_KEY = "studytable_planner_v1";

interface StoredStudyData {
  subjects: Subject[];
  studyBlocks: StudyBlock[];
  homeworks: HomeworkItem[];
  exams: ExamGoal[];
}

export function useStudyStore() {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>(
    INITIAL_STUDY_BLOCKS
  );
  const [homeworks, setHomeworks] =
    useState<HomeworkItem[]>(INITIAL_HOMEWORKS);
  const [exams, setExams] = useState<ExamGoal[]>(INITIAL_EXAMS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredStudyData = JSON.parse(raw);
        if (parsed.subjects?.length) setSubjects(parsed.subjects);
        if (parsed.studyBlocks) setStudyBlocks(parsed.studyBlocks);
        if (parsed.homeworks) setHomeworks(parsed.homeworks);
        if (parsed.exams) setExams(parsed.exams);
      }
    } catch (err) {
      console.error("Failed to load StudyTable data from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload: StoredStudyData = {
        subjects,
        studyBlocks,
        homeworks,
        exams,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to save StudyTable data to localStorage:", err);
    }
  }, [subjects, studyBlocks, homeworks, exams, isLoaded]);

  // Subject Actions
  const addSubject = useCallback((newSubject: Omit<Subject, "id">) => {
    const created: Subject = {
      ...newSubject,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setSubjects((prev) => [...prev, created]);
    return created;
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setStudyBlocks((prev) => prev.filter((b) => b.subjectId !== subjectId));
    setHomeworks((prev) => prev.filter((h) => h.subjectId !== subjectId));
    setExams((prev) => prev.filter((e) => e.subjectId !== subjectId));
  }, []);

  // StudyBlock Actions
  const addStudyBlock = useCallback((block: Omit<StudyBlock, "id">) => {
    const created: StudyBlock = {
      ...block,
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setStudyBlocks((prev) => [...prev, created]);
    return created;
  }, []);

  const toggleStudyBlockCompleted = useCallback((blockId: string) => {
    setStudyBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      )
    );
  }, []);

  const deleteStudyBlock = useCallback((blockId: string) => {
    setStudyBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setHomeworks((prev) =>
      prev.map((hw) => ({
        ...hw,
        scheduledBlockIds: hw.scheduledBlockIds.filter((id) => id !== blockId),
      }))
    );
  }, []);

  // Homework Actions
  const addHomework = useCallback(
    (
      hw: Omit<HomeworkItem, "id" | "scheduledBlockIds" | "subtasks"> & {
        subtaskTitles?: string[];
      }
    ) => {
      const { subtaskTitles = [], ...rest } = hw;
      const created: HomeworkItem = {
        ...rest,
        id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        scheduledBlockIds: [],
        subtasks: subtaskTitles
          .map((t) => t.trim())
          .filter(Boolean)
          .map((title, idx) => ({
            id: `st-${Date.now()}-${idx}`,
            title,
            completed: false,
          })),
      };
      setHomeworks((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateHomeworkStatus = useCallback(
    (homeworkId: string, status: HomeworkStatus) => {
      setHomeworks((prev) =>
        prev.map((hw) => {
          if (hw.id !== homeworkId) return hw;
          const updatedSubtasks =
            status === "done"
              ? hw.subtasks.map((s) => ({ ...s, completed: true }))
              : hw.subtasks;
          return { ...hw, status, subtasks: updatedSubtasks };
        })
      );
    },
    []
  );

  const toggleHomeworkSubtask = useCallback(
    (homeworkId: string, subtaskId: string) => {
      setHomeworks((prev) =>
        prev.map((hw) => {
          if (hw.id !== homeworkId) return hw;
          const subtasks = hw.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone =
            subtasks.length > 0 && subtasks.every((s) => s.completed);
          const anyDone = subtasks.some((s) => s.completed);

          let nextStatus: HomeworkStatus = hw.status;
          if (allDone) nextStatus = "done";
          else if (anyDone) nextStatus = "in_progress";
          else if (hw.status === "done") nextStatus = "in_progress";

          return {
            ...hw,
            subtasks,
            status: nextStatus,
          };
        })
      );
    },
    []
  );

  const addHomeworkSubtask = useCallback(
    (homeworkId: string, subtaskTitle: string) => {
      const trimmed = subtaskTitle.trim();
      if (!trimmed) return;
      setHomeworks((prev) =>
        prev.map((hw) => {
          if (hw.id !== homeworkId) return hw;
          return {
            ...hw,
            subtasks: [
              ...hw.subtasks,
              {
                id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                title: trimmed,
                completed: false,
              },
            ],
            status: hw.status === "done" ? "in_progress" : hw.status,
          };
        })
      );
    },
    []
  );

  const deleteHomework = useCallback((homeworkId: string) => {
    setHomeworks((prev) => prev.filter((hw) => hw.id !== homeworkId));
    setStudyBlocks((prev) =>
      prev.map((b) =>
        b.linkedHomeworkId === homeworkId
          ? { ...b, linkedHomeworkId: undefined }
          : b
      )
    );
  }, []);

  // Bridge: Schedule Homework directly into Timetable
  const scheduleHomeworkToTimetable = useCallback(
    (
      homeworkId: string,
      slot: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        durationMinutes: number;
        notes?: string;
      }
    ) => {
      const targetHw = homeworks.find((h) => h.id === homeworkId);
      if (!targetHw) return null;

      const newBlock = createStudyBlockFromHomework(targetHw, slot);
      setStudyBlocks((prev) => [...prev, newBlock]);
      setHomeworks((prev) =>
        prev.map((hw) =>
          hw.id === homeworkId
            ? {
              ...hw,
              status: hw.status === "todo" ? "in_progress" : hw.status,
              scheduledBlockIds: [...hw.scheduledBlockIds, newBlock.id],
            }
            : hw
        )
      );
      return newBlock;
    },
    [homeworks]
  );

  // Exam Countdown & Syllabus Actions
  const addExamGoal = useCallback(
    (
      exam: Omit<ExamGoal, "id" | "topics"> & {
        topicTitles?: string[];
      }
    ) => {
      const { topicTitles = [], ...rest } = exam;
      const created: ExamGoal = {
        ...rest,
        id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        topics: topicTitles
          .map((t) => t.trim())
          .filter(Boolean)
          .map((title, idx) => ({
            id: `top-${Date.now()}-${idx}`,
            chapterCode: `บทที่ ${idx + 1}`,
            title,
            completed: false,
          })),
      };
      setExams((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const toggleExamTopic = useCallback((examId: string, topicId: string) => {
    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== examId) return exam;
        return {
          ...exam,
          topics: exam.topics.map((t) =>
            t.id === topicId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  }, []);

  const addExamTopic = useCallback(
    (examId: string, title: string, chapterCode?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setExams((prev) =>
        prev.map((exam) => {
          if (exam.id !== examId) return exam;
          return {
            ...exam,
            topics: [
              ...exam.topics,
              {
                id: `top-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                chapterCode:
                  chapterCode?.trim() || `บทที่ ${exam.topics.length + 1}`,
                title: trimmed,
                completed: false,
              },
            ],
          };
        })
      );
    },
    []
  );

  const deleteExamGoal = useCallback((examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  }, []);

  const resetToSeedData = useCallback(() => {
    setSubjects(INITIAL_SUBJECTS);
    setStudyBlocks(INITIAL_STUDY_BLOCKS);
    setHomeworks(INITIAL_HOMEWORKS);
    setExams(INITIAL_EXAMS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isLoaded,
    subjects,
    studyBlocks,
    homeworks,
    exams,
    addSubject,
    deleteSubject,
    addStudyBlock,
    toggleStudyBlockCompleted,
    deleteStudyBlock,
    addHomework,
    updateHomeworkStatus,
    toggleHomeworkSubtask,
    addHomeworkSubtask,
    deleteHomework,
    scheduleHomeworkToTimetable,
    addExamGoal,
    toggleExamTopic,
    addExamTopic,
    deleteExamGoal,
    resetToSeedData,
  };
}

