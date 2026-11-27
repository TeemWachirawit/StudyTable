"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import { formatThaiDate, getTodayTodoItems, toISODate } from "@/lib/study";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";

interface Props {
  /** When true (e.g. on Planner), renders with collapsible header to save vertical space */
  compact?: boolean;
}

export function TodayTodoCard({ compact = false }: Props) {
  const { state, dispatch } = useStudyStore();
  const [newTitle, setNewTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => toISODate(today), [today]);
  const todayLabel = useMemo(() => formatThaiDate(todayISO), [todayISO]);

  const subjectById = useMemo(
    () => new Map(state.subjects.map((s) => [s.id, s])),
    [state.subjects]
  );

  const { items, done, total, pct } = useMemo(
    () => getTodayTodoItems(state, today),
    [state, today]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    dispatch({
      type: "addTodo",
      date: todayISO,
      subjectId: selectedSubjectId,
      title: trimmed,
    });
    setNewTitle("");
  };

  return (
    <section
      aria-labelledby="today-todo-heading"
      className="rounded-2xl border border-line-strong bg-sheet shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]"
    >
      {/* Header */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6",
          !collapsed && "border-b border-line"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-terracotta uppercase">
              <ListTodo className="h-3.5 w-3.5" />
              Today&apos;s To-Do
            </span>
            <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[11px] font-medium text-ink-soft">
              {todayLabel}
            </span>
          </div>
          <h2 id="today-todo-heading" className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
            วันนี้ต้องอ่านอะไรบ้าง
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            รวมตารางอ่านของวันนี้และรายการที่เพิ่มเอง · กดที่วิชาเพื่อเปิดขึ้นบนสุดในหน้า Table
          </p>
        </div>

        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="font-mono text-xs font-semibold text-ink">
                  {done}/{total} เสร็จแล้ว
                </p>
                <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      pct === 100 ? "bg-sage" : "bg-terracotta"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  "rounded-lg px-2 py-1 font-mono text-xs font-bold",
                  pct === 100
                    ? "bg-sage-tint text-sage-deep"
                    : "bg-terracotta-tint text-terracotta-deep"
                )}
              >
                {pct}%
              </span>
            </div>
          )}

          {compact && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "ขยายรายการวันนี้" : "ย่อรายการวันนี้"}
              className="rounded-lg border border-line bg-paper p-1.5 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="p-5 sm:p-6">
          {/* Quick Add Form */}
          <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="เลือกวิชาสำหรับ To-Do"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={cn(inputClass, "h-10 sm:w-48")}
            >
              <option value="">ทั่วไป (ไม่ระบุวิชา)</option>
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji ? `${s.emoji} ` : ""}
                  {s.name}
                </option>
              ))}
            </select>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                className={cn(inputClass, "h-10 flex-1")}
                placeholder="เพิ่มสิ่งที่ต้องอ่านวันนี้ เช่น ทำโจทย์แคลคูลัส 20 ข้อ..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={200}
              />
              <Button type="submit" size="sm" className="h-10 shrink-0 px-3.5" disabled={!newTitle.trim()}>
                <Plus className="h-4 w-4" /> เพิ่ม
              </Button>
            </div>
          </form>

          {/* Checklist */}
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-paper/50 px-4 py-7 text-center">
              <p className="text-sm font-medium text-ink">ยังไม่มีรายการที่ต้องอ่านสำหรับวันนี้</p>
              <p className="mt-1 text-xs text-ink-muted">
                พิมพ์เพิ่มงานด้านบน หรือจัดตารางอ่านของวันนี้ในหน้า{" "}
                <Link href="/planner" className="font-semibold text-terracotta hover:underline">
                  Planner
                </Link>
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {items.map((item) => {
                const subj = item.subjectId ? subjectById.get(item.subjectId) : undefined;
                const color = subj ? getSubjectColor(subj.color) : null;
                const tableHref = subj ? `/table?subject=${encodeURIComponent(subj.id)}` : null;

                return (
                  <li
                    key={item.key}
                    className={cn(
                      "group flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 transition-colors sm:flex-nowrap",
                      item.done ? "bg-paper/60" : "bg-sheet hover:bg-paper/70"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={item.done}
                        aria-label={`ติ๊ก ${item.title}`}
                        onClick={() => {
                          if (item.source === "planner") {
                            dispatch({
                              type: "toggleBlockTodo",
                              date: todayISO,
                              blockId: item.id,
                              subjectId: item.subjectId,
                              title: item.title,
                            });
                          } else {
                            dispatch({ type: "toggleTodo", id: item.id });
                          }
                        }}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                          item.done
                            ? "border-sage bg-sage text-sheet"
                            : "border-line-strong bg-sheet hover:border-ink-muted"
                        )}
                      >
                        {item.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {subj && tableHref && (
                            <Link
                              href={tableHref}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-transform hover:scale-[1.02]",
                                color?.blockClass
                              )}
                              style={color?.blockStyle}
                              title={`เปิดวิชา ${subj.name} ขึ้นบนสุดในหน้า Table`}
                            >
                              {subj.emoji ? (
                                <span className="text-xs leading-none">{subj.emoji}</span>
                              ) : (
                                <span
                                  className={cn("h-2 w-2 rounded-full", color?.solidClass)}
                                  style={color?.solidStyle}
                                />
                              )}
                              {subj.name}
                            </Link>
                          )}

                          {item.timeLabel && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-paper-deep px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-soft">
                              <CalendarClock className="h-3 w-3 text-terracotta" />
                              {item.timeLabel}
                            </span>
                          )}
                        </div>

                        {tableHref ? (
                          <Link
                            href={tableHref}
                            className={cn(
                              "mt-0.5 block truncate text-sm font-medium transition-colors hover:text-terracotta-deep",
                              item.done ? "text-ink-muted line-through decoration-line-strong" : "text-ink"
                            )}
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p
                            className={cn(
                              "mt-0.5 truncate text-sm font-medium",
                              item.done ? "text-ink-muted line-through decoration-line-strong" : "text-ink"
                            )}
                          >
                            {item.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {tableHref && (
                        <Link
                          href={tableHref}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-terracotta/40 hover:bg-terracotta-tint hover:text-terracotta-deep"
                        >
                          ไปอ่าน
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {item.source === "custom" && (
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "deleteTodo", id: item.id })}
                          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger-deep"
                          aria-label={`ลบ ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
