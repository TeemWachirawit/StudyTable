"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { Exam, StudyBlock, StudyState } from "@/types/study";
import type { SubjectColor } from "@/lib/colors";
import { createSeedState, uid } from "@/lib/study";

const BASE_STORAGE_KEY = "studytable:v1";

type Action =
  | { type: "hydrate"; state: StudyState }
  | { type: "reset" }
  | { type: "saveSubject"; id?: string; name: string; color: SubjectColor }
  | { type: "deleteSubject"; id: string }
  | { type: "addChapter"; subjectId: string; title: string }
  | { type: "updateChapter"; subjectId: string; chapterId: string; title: string }
  | { type: "toggleChapter"; subjectId: string; chapterId: string }
  | { type: "deleteChapter"; subjectId: string; chapterId: string }
  | { type: "saveBlock"; block: StudyBlock }
  | { type: "deleteBlock"; id: string }
  | { type: "saveExam"; exam: Exam }
  | { type: "deleteExam"; id: string };

const empty: StudyState = { subjects: [], blocks: [], exams: [] };

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [...list, item];
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
        subjects: [
          ...state.subjects,
          { id: uid(), name: action.name, color: action.color, chapters: [] },
        ],
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
            ? {
              ...s,
              chapters: [...s.chapters, { id: uid(), title: action.title, done: false }],
            }
            : s
        ),
      };
    case "updateChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId
            ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id === action.chapterId ? { ...c, title: action.title } : c
              ),
            }
            : s
        ),
      };
    case "toggleChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId
            ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id === action.chapterId ? { ...c, done: !c.done } : c
              ),
            }
            : s
        ),
      };
    case "deleteChapter":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.subjectId
            ? { ...s, chapters: s.chapters.filter((c) => c.id !== action.chapterId) }
            : s
        ),
        exams: state.exams.map((e) => ({
          ...e,
          chapterIds: e.chapterIds.filter((id) => id !== action.chapterId),
        })),
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

export type SyncStatus = "idle" | "saving" | "saved" | "error";

interface StoreValue {
  state: StudyState;
  dispatch: React.Dispatch<Action>;
  /** false until initial state has been loaded */
  hydrated: boolean;
  syncStatus: SyncStatus;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StudyStoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;
  const storageKey = userId ? `${BASE_STORAGE_KEY}:${userId}` : BASE_STORAGE_KEY;

  const [state, rawDispatch] = useReducer(reducer, empty);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const isDirtyRef = useRef(false);

  const dispatch: React.Dispatch<Action> = (action) => {
    if (action.type !== "hydrate") {
      isDirtyRef.current = true;
    }
    rawDispatch(action);
  };

  useEffect(() => {
    if (sessionStatus === "loading") return;

    let cancelled = false;
    isDirtyRef.current = false;

    async function loadInitialState() {
      // 1. Read local cache first for fast fallback
      let localLoaded: StudyState | null = null;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) localLoaded = JSON.parse(raw) as StudyState;
      } catch {
        localLoaded = null;
      }

      // 2. If signed in, fetch from PostgreSQL database
      if (userId) {
        try {
          const res = await fetch("/api/study", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { state?: StudyState | null };
            if (!cancelled && data.state) {
              rawDispatch({ type: "hydrate", state: data.state });
              setHydrated(true);
              setSyncStatus("saved");
              try {
                localStorage.setItem(storageKey, JSON.stringify(data.state));
              } catch {
                /* ignore storage errors */
              }
              return;
            }
          }
        } catch {
          // Fall back to local cache if offline
        }
      }

      if (!cancelled) {
        rawDispatch({ type: "hydrate", state: localLoaded ?? createSeedState() });
        setHydrated(true);
      }
    }

    loadInitialState();

    return () => {
      cancelled = true;
    };
  }, [userId, sessionStatus, storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* storage full or disabled — keep working in memory */
    }

    if (!userId || !isDirtyRef.current) return;

    setSyncStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/study", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        });
        if (res.ok) {
          isDirtyRef.current = false;
          setSyncStatus("saved");
        } else {
          setSyncStatus("error");
        }
      } catch {
        setSyncStatus("error");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [state, hydrated, userId, storageKey]);

  return (
    <StoreContext.Provider value={{ state, dispatch, hydrated, syncStatus }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStudyStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStudyStore must be used inside <StudyStoreProvider>");
  return ctx;
}
