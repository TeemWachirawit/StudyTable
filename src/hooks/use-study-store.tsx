"use client";

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import type { Exam, StudyBlock, StudyState } from "@/types/study";
import type { SubjectColor } from "@/lib/colors";
import { createSeedState, uid } from "@/lib/study";

const STORAGE_KEY = "studytable:v1";

type Action =
  | { type: "hydrate"; state: StudyState }
  | { type: "reset" }
  | { type: "saveSubject"; id?: string; name: string; color: SubjectColor }
  | { type: "deleteSubject"; id: string }
  | { type: "addChapter"; subjectId: string; title: string }
  | { type: "toggleChapter"; subjectId: string; chapterId: string }
  | { type: "deleteChapter"; subjectId: string; chapterId: string }
  | { type: "saveBlock"; block: StudyBlock }
  | { type: "deleteBlock"; id: string }
  | { type: "saveExam"; exam: Exam }
  | { type: "deleteExam"; id: string };

const empty: StudyState = { subjects: [], blocks: [], exams: [] };

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

function reducer(state: StudyState, action: Action): StudyState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return createSeedState();

    case "saveSubject": {
      if (action.id) {
        return {
          ...state,
          subjects: state.subjects.map((s) =>
            s.id === action.id ? { ...s, name: action.name, color: action.color } : s
          ),
        };
      }
      return {
        ...state,
        subjects: [...state.subjects, { id: uid(), name: action.name, color: action.color, chapters: [] }],
      };
    }
    case "deleteSubject":
      return {
        subjects: state.subjects.filter((s) => s.id !== action.id),
        blocks: state.blocks.filter((b) => b.subjectId !== action.id),
        exams: state.exams.filter((e) => e.subjectId !== action.id),
      };

    case "addChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId
            ? { ...s, chapters: [...s.chapters, { id: uid(), title: action.title, done: false }] }
            : s
        ),
      };
    case "toggleChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId
            ? { ...s, chapters: s.chapters.map((c) => (c.id === action.chapterId ? { ...c, done: !c.done } : c)) }
            : s
        ),
      };
    case "deleteChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId ? { ...s, chapters: s.chapters.filter((c) => c.id !== action.chapterId) } : s
        ),
        exams: state.exams.map((e) => ({ ...e, chapterIds: e.chapterIds.filter((id) => id !== action.chapterId) })),
      };

    case "saveBlock":
      return { ...state, blocks: upsert(state.blocks, action.block) };
    case "deleteBlock":
      return { ...state, blocks: state.blocks.filter((b) => b.id !== action.id) };

    case "saveExam":
      return { ...state, exams: upsert(state.exams, action.exam) };
    case "deleteExam":
      return { ...state, exams: state.exams.filter((e) => e.id !== action.id) };
  }
}

interface StoreValue {
  state: StudyState;
  dispatch: React.Dispatch<Action>;
  /** false until localStorage has been read on the client */
  hydrated: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StudyStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let loaded: StudyState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as StudyState;
    } catch {
      loaded = null;
    }
    dispatch({ type: "hydrate", state: loaded ?? createSeedState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or disabled — keep working in memory */
    }
  }, [state, hydrated]);

  return <StoreContext.Provider value={{ state, dispatch, hydrated }}>{children}</StoreContext.Provider>;
}

export function useStudyStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStudyStore must be used inside <StudyStoreProvider>");
  return ctx;
}

