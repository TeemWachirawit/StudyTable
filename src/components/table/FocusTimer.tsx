"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  Save,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getSubjectColor } from "@/lib/colors";
import { formatClock, formatStudySeconds } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/types/study";

type TimerMode = "countdown" | "stopwatch";

const FOCUS_STORAGE_KEY = "studytable:focus-timer:v1";
const PRESET_MINUTES = [25, 45, 60] as const;

interface PersistedTimer {
  mode: TimerMode;
  subjectId: string;
  targetMinutes: number;
  elapsedBaseSec: number;
  startedAt: number | null;
  soundEnabled: boolean;
}

function playGentleChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  } catch {
    /* ignore audio errors */
  }
}

interface Props {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onLogStudyTime: (subjectId: string, seconds: number) => void;
}

export function FocusTimer({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onLogStudyTime,
}: Props) {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("25");
  const [elapsedBaseSec, setElapsedBaseSec] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [restored, setRestored] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);

  const originalTitleRef = useRef<string>("");
  const completedRef = useRef<boolean>(false);

  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0],
    [subjects, selectedSubjectId]
  );

  // Restore persisted timer state once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedTimer>;
        if (parsed.mode === "countdown" || parsed.mode === "stopwatch") {
          setMode(parsed.mode);
        }
        if (typeof parsed.targetMinutes === "number" && parsed.targetMinutes >= 1 && parsed.targetMinutes <= 180) {
          setTargetMinutes(parsed.targetMinutes);
          setCustomMinutesInput(String(parsed.targetMinutes));
        }
        if (typeof parsed.elapsedBaseSec === "number" && parsed.elapsedBaseSec >= 0) {
          setElapsedBaseSec(parsed.elapsedBaseSec);
        }
        if (typeof parsed.startedAt === "number" || parsed.startedAt === null) {
          setStartedAt(parsed.startedAt ?? null);
        }
        if (typeof parsed.soundEnabled === "boolean") {
          setSoundEnabled(parsed.soundEnabled);
        }
        if (
          typeof parsed.subjectId === "string" &&
          subjects.some((s) => s.id === parsed.subjectId)
        ) {
          onSelectSubject(parsed.subjectId);
        }
      }
    } catch {
      /* ignore corrupted storage */
    } finally {
      setRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist timer state changes
  useEffect(() => {
    if (!restored || !activeSubject) return;
    const payload: PersistedTimer = {
      mode,
      subjectId: activeSubject.id,
      targetMinutes,
      elapsedBaseSec,
      startedAt,
      soundEnabled,
    };
    try {
      localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore storage errors */
    }
  }, [restored, mode, activeSubject, targetMinutes, elapsedBaseSec, startedAt, soundEnabled]);

  const isRunning = startedAt !== null;

  // Tick every 250ms while running
  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const liveDeltaSec = isRunning ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const targetTotalSec = targetMinutes * 60;
  const elapsedSec =
    mode === "countdown"
      ? Math.min(targetTotalSec, elapsedBaseSec + liveDeltaSec)
      : elapsedBaseSec + liveDeltaSec;

  const displaySec =
    mode === "countdown" ? Math.max(0, targetTotalSec - elapsedSec) : elapsedSec;

  const progressPct =
    mode === "countdown" && targetTotalSec > 0
      ? Math.min(100, Math.round((elapsedSec / targetTotalSec) * 100))
      : 0;

  const commitAndReset = useCallback(
    (secondsToSave: number, autoCompleted = false) => {
      if (!activeSubject || secondsToSave <= 0) {
        setStartedAt(null);
        setElapsedBaseSec(0);
        return;
      }
      onLogStudyTime(activeSubject.id, secondsToSave);
      setStartedAt(null);
      setElapsedBaseSec(0);
      setBanner(
        autoCompleted
          ? `ครบเวลาโฟกัสแล้ว! บันทึก +${formatStudySeconds(secondsToSave)} ให้วิชา ${activeSubject.name} แล้ว`
          : `บันทึก +${formatStudySeconds(secondsToSave)} ให้วิชา ${activeSubject.name} แล้ว`
      );
      if (autoCompleted && soundEnabled) {
        playGentleChime();
      }
    },
    [activeSubject, onLogStudyTime, soundEnabled]
  );

  // Auto-complete when countdown reaches 0
  useEffect(() => {
    if (mode === "countdown" && isRunning && elapsedSec >= targetTotalSec) {
      if (!completedRef.current) {
        completedRef.current = true;
        commitAndReset(targetTotalSec, true);
      }
    } else {
      completedRef.current = false;
    }
  }, [mode, isRunning, elapsedSec, targetTotalSec, commitAndReset]);

  // Reflect live countdown/stopwatch in document.title while running
  useEffect(() => {
    if (!originalTitleRef.current && typeof document !== "undefined") {
      originalTitleRef.current = document.title;
    }
    if (isRunning && activeSubject) {
      document.title = `⏱ ${formatClock(displaySec)} · ${activeSubject.name} — StudyTable`;
    } else if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isRunning, displaySec, activeSubject]);

  if (!activeSubject) return null;

  const color = getSubjectColor(activeSubject.color);

  const handleStart = () => {
    setBanner(null);
    setNow(Date.now());
    setStartedAt(Date.now());
  };

  const handlePause = () => {
    if (!isRunning) return;
    setElapsedBaseSec(elapsedSec);
    setStartedAt(null);
  };

  const handleReset = () => {
    setStartedAt(null);
    setElapsedBaseSec(0);
    setBanner(null);
  };

  const handleModeSwitch = (nextMode: TimerMode) => {
    if (nextMode === mode) return;
    if (isRunning) {
      setElapsedBaseSec(elapsedSec);
      setStartedAt(null);
    }
    setElapsedBaseSec(0);
    setStartedAt(null);
    setBanner(null);
    setMode(nextMode);
  };

  const applyTargetMinutes = (mins: number) => {
    const clamped = Math.max(1, Math.min(180, Math.round(mins)));
    setTargetMinutes(clamped);
    setCustomMinutesInput(String(clamped));
    if (!isRunning) {
      setElapsedBaseSec(0);
    }
  };

  const handleSubjectChange = (nextId: string) => {
    if (nextId === activeSubject.id) return;
    // If user already accumulated elapsed time on the previous subject, save it first
    if (elapsedSec >= 5) {
      commitAndReset(elapsedSec, false);
    } else {
      setStartedAt(null);
      setElapsedBaseSec(0);
    }
    onSelectSubject(nextId);
  };

  return (
    <section
      aria-label="จับเวลาโฟกัสอ่านหนังสือ"
      className="mb-8 overflow-hidden rounded-2xl border border-line-strong bg-sheet shadow-[0_14px_34px_-24px_rgba(15,23,42,0.16)]"
    >
      <div className={cn("h-1.5 transition-colors", color.solidClass)} style={color.solidStyle} />

      <div className="p-5 sm:p-6">
        {/* Top bar: title + mode switcher + sound toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border",
                color.blockClass
              )}
              style={color.blockStyle}
            >
              <Timer className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Focus Timer</h2>
              <p className="text-xs text-ink-soft">
                เลือกวิชาแล้วจับเวลาอ่านหนังสือ ระบบสะสมเวลาให้แต่ละวิชาอัตโนมัติ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="โหมดจับเวลา"
              className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1 text-xs"
            >
              <button
                type="button"
                aria-pressed={mode === "countdown"}
                onClick={() => handleModeSwitch("countdown")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-colors",
                  mode === "countdown"
                    ? "border border-line bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Hourglass className="h-3.5 w-3.5 text-terracotta" />
                โฟกัส (นับถอยหลัง)
              </button>
              <button
                type="button"
                aria-pressed={mode === "stopwatch"}
                onClick={() => handleModeSwitch("stopwatch")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-colors",
                  mode === "stopwatch"
                    ? "border border-line bg-sheet text-ink shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                <Timer className="h-3.5 w-3.5 text-sage" />
                จับเวลาเดินหน้า
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? "ปิดเสียงแจ้งเตือน" : "เปิดเสียงแจ้งเตือน"}
              title={soundEnabled ? "เปิดเสียงแจ้งเตือนเมื่อครบเวลา" : "ปิดเสียงแจ้งเตือน"}
              className="rounded-lg border border-line bg-paper p-2 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-ink-muted" />}
            </button>
          </div>
        </div>

        {/* Main body */}
        <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* Left: Subject selector + presets */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="focus-subject-select"
                className="mb-1.5 block text-xs font-semibold text-ink-soft"
              >
                กำลังอ่านวิชา
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="focus-subject-select"
                  value={activeSubject.id}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="h-10 min-w-[200px] flex-1 rounded-xl border border-line-strong bg-paper px-3 text-sm font-semibold text-ink transition-colors focus:border-terracotta focus:bg-sheet focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji ? `${s.emoji} ` : ""}
                      {s.name} ({formatStudySeconds(s.studySeconds ?? 0)})
                    </option>
                  ))}
                </select>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold",
                    color.blockClass
                  )}
                  style={color.blockStyle}
                >
                  สะสมแล้ว {formatStudySeconds(activeSubject.studySeconds ?? 0)}
                </span>
              </div>
            </div>

            {mode === "countdown" ? (
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                  ตั้งเวลาโฟกัส
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_MINUTES.map((mins) => {
                    const active = targetMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        disabled={isRunning}
                        onClick={() => applyTargetMinutes(mins)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-terracotta bg-terracotta-tint text-terracotta-deep"
                            : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
                        )}
                      >
                        {mins} นาที
                      </button>
                    );
                  })}
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1 text-xs">
                    <span className="text-ink-muted">กำหนดเอง</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      disabled={isRunning}
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      onBlur={() => {
                        const n = parseInt(customMinutesInput, 10);
                        if (!isNaN(n)) applyTargetMinutes(n);
                        else setCustomMinutesInput(String(targetMinutes));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const n = parseInt(customMinutesInput, 10);
                          if (!isNaN(n)) applyTargetMinutes(n);
                        }
                      }}
                      aria-label="กำหนดเวลาโฟกัสเป็นนาที"
                      className="w-12 rounded bg-sheet px-1.5 py-0.5 text-center font-mono text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50"
                    />
                    <span className="text-ink-muted">นาที</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-paper/70 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
                โหมดจับเวลาเดินหน้าเหมาะสำหรับอ่านแบบไม่จำกัดเวลา กด{" "}
                <strong className="text-ink">เริ่ม</strong> แล้วกด{" "}
                <strong className="text-ink">บันทึกเวลา</strong> เมื่ออ่านจบเพื่อสะสมเข้าวิชานี้
              </p>
            )}

            {banner && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 rounded-xl border border-sage/35 bg-sage-tint px-3.5 py-2 text-xs font-medium text-sage-deep"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
                <span>{banner}</span>
              </div>
            )}
          </div>

          {/* Right: Clock readout & controls */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-paper/75 px-5 py-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isRunning ? "animate-pulse bg-sage" : "bg-ink-muted/50"
                )}
                aria-hidden="true"
              />
              <span>
                {isRunning
                  ? `กำลังโฟกัส · ${activeSubject.name}`
                  : elapsedSec > 0
                    ? `พักอยู่ (อ่านไปแล้ว ${formatStudySeconds(elapsedSec)})`
                    : `พร้อมเริ่มอ่าน · ${activeSubject.name}`}
              </span>
            </div>

            <div
              className="mt-2 font-mono text-5xl font-bold tracking-tight text-ink tabular-nums sm:text-6xl"
              aria-live="off"
            >
              {formatClock(displaySec)}
            </div>

            {mode === "countdown" && (
              <div className="mt-3 w-full max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-300", color.solidClass)}
                    style={{ ...color.solidStyle, width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {!isRunning ? (
                <Button onClick={handleStart} className="min-w-28 gap-1.5">
                  <Play className="h-4 w-4 fill-current" />
                  {elapsedSec > 0 ? "อ่านต่อ" : "เริ่มโฟกัส"}
                </Button>
              ) : (
                <Button variant="outline" onClick={handlePause} className="min-w-28 gap-1.5 bg-sheet">
                  <Pause className="h-4 w-4" />
                  พักชั่วคราว
                </Button>
              )}

              {elapsedSec > 0 && (
                <Button
                  variant="outline"
                  onClick={() => commitAndReset(elapsedSec, false)}
                  className="gap-1.5 border-sage/40 bg-sage-tint/60 text-sage-deep hover:bg-sage-tint"
                >
                  <Save className="h-4 w-4" />
                  บันทึก (+{formatStudySeconds(elapsedSec)})
                </Button>
              )}

              {elapsedSec > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  title="รีเซ็ตเวลาที่กำลังจับอยู่โดยไม่บันทึก"
                  className="gap-1 text-ink-muted hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  รีเซ็ต
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
