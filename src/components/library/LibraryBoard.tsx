"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookPlus,
  Check,
  CheckCircle2,
  ListChecks,
  Search,
  X,
} from "lucide-react";
import { useStudyStore } from "@/hooks/use-study-store";
import { getSubjectColor } from "@/lib/colors";
import {
  LIBRARY_CATALOG,
  LIBRARY_CATEGORIES,
  filterLibraryItems,
  getLibraryMatchStatus,
  type LibraryCategory,
  type LibraryItem,
} from "@/lib/library-catalog";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { LoadingDesk, PageHeader } from "@/components/PageHeader";
import { LibraryPreviewModal } from "./LibraryPreviewModal";

export function LibraryBoard() {
  const { state, dispatch, hydrated } = useStudyStore();
  const [category, setCategory] = useState<LibraryCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [notice, setNotice] = useState<{ title: string; detail: string } | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<LibraryCategory | "all", number> = {
      all: LIBRARY_CATALOG.length,
      tgat: 0,
      tpat: 0,
      alevel: 0,
      highschool: 0,
    };
    for (const item of LIBRARY_CATALOG) {
      counts[item.category] += 1;
    }
    return counts;
  }, []);

  const filteredItems = useMemo(
    () => filterLibraryItems(LIBRARY_CATALOG, category, query),
    [category, query]
  );

  const matchById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getLibraryMatchStatus>>();
    for (const item of LIBRARY_CATALOG) {
      map.set(item.id, getLibraryMatchStatus(item, state.subjects));
    }
    return map;
  }, [state.subjects]);

  const importedCount = useMemo(
    () => Array.from(matchById.values()).filter((m) => m.matchedSubject !== null).length,
    [matchById]
  );

  const handleQuickImport = (item: LibraryItem) => {
    const match = matchById.get(item.id);
    if (match?.matchedSubject) {
      if (match.missingChapters.length === 0) {
        setPreviewItem(item);
        return;
      }
      dispatch({
        type: "importLibrarySubject",
        name: match.matchedSubject.name,
        color: item.color,
        emoji: item.emoji,
        chapters: match.missingChapters,
        mergeIntoSubjectId: match.matchedSubject.id,
      });
      setNotice({
        title: `เติมบทเรียนให้ "${match.matchedSubject.name}" แล้ว`,
        detail: `เพิ่ม ${match.missingChapters.length} บทที่ขาดลงหน้า Table เรียบร้อย`,
      });
      return;
    }

    dispatch({
      type: "importLibrarySubject",
      name: item.name,
      color: item.color,
      emoji: item.emoji,
      chapters: item.chapters,
    });
    setNotice({
      title: `หยิบ "${item.name}" เข้า Table แล้ว`,
      detail: `เพิ่มทั้งหมด ${item.chapters.length} บทเรียน พร้อมเริ่มติ๊กติดตามได้ทันที`,
    });
  };

  const header = (
    <PageHeader
      eyebrow="Library"
      tone="coral"
      title="คลังเนื้อหาสอบและบทเรียน"
      description="รวบรวมโครงสร้างข้อสอบ TGAT, TPAT, A-Level และบทเรียน ม.ปลาย เลือกหยิบวิชาหรือบทที่ต้องการแล้วจะขึ้นบนหน้า Table อัตโนมัติ"
      actions={
        hydrated ? (
          <Link href="/table" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <BookOpen className="h-4 w-4 text-sage" />
            ไปที่หน้า Table ({state.subjects.length} วิชา)
          </Link>
        ) : undefined
      }
    />
  );

  if (!hydrated) {
    return (
      <>
        {header}
        <LoadingDesk />
      </>
    );
  }

  return (
    <>
      {header}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Inline import success notice */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sage/35 bg-sage-tint px-4 py-3 text-sm text-sage-deep shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
              <div>
                <p className="font-semibold text-ink">{notice.title}</p>
                <p className="text-xs text-sage-deep">{notice.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/table"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-8 gap-1.5 text-xs"
                )}
              >
                เปิดดูที่หน้า Table
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="ปิดการแจ้งเตือน"
                className="rounded-lg p-1 text-sage-deep/70 transition-colors hover:bg-sheet/60 hover:text-sage-deep"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-line-strong bg-sheet p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.1)] lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="กรองตามหมวดหมู่ข้อสอบ"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                category === "all"
                  ? "border-ink bg-ink text-sheet shadow-2xs"
                  : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
              )}
            >
              ทั้งหมด ({categoryCounts.all})
            </button>
            {LIBRARY_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? cn(cat.badgeClass, "shadow-2xs")
                      : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
                  )}
                >
                  {cat.label} ({categoryCounts[cat.id]})
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาวิชาหรือชื่อบท เช่น แคลคูลัส, TGAT..."
              aria-label="ค้นหาวิชาหรือบทเรียนในคลัง"
              className={cn(inputClass, "h-9 pl-9 pr-8 text-sm")}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="ล้างคำค้นหา"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Summary bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          <p className="flex items-center gap-1.5">
            <BookMarked className="h-4 w-4 text-slate" />
            พบ <span className="font-mono font-semibold text-ink">{filteredItems.length}</span> ชุดเนื้อหา
            {query.trim() && (
              <span>
                {" "}สำหรับคำค้น &ldquo;<span className="font-medium text-ink">{query.trim()}</span>&rdquo;
              </span>
            )}
          </p>
          {importedCount > 0 && (
            <p>
              หยิบเข้า Table แล้ว{" "}
              <span className="font-mono font-semibold text-sage-deep">{importedCount}</span> วิชา
            </p>
          )}
        </div>

        {/* Catalog Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-sheet px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink">ไม่พบเนื้อหาที่ตรงกับคำค้นหา</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              ลองค้นหาด้วยคำอื่น เช่น &ldquo;ฟิสิกส์&rdquo;, &ldquo;TGAT&rdquo;, &ldquo;แคลคูลัส&rdquo; หรือเลือกดูทุกหมวดหมู่
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => {
                setCategory("all");
                setQuery("");
              }}
            >
              แสดงทั้งหมด
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const color = getSubjectColor(item.color);
              const catMeta = LIBRARY_CATEGORIES.find((c) => c.id === item.category);
              const match = matchById.get(item.id) ?? {
                matchedSubject: null,
                existingChapterCount: 0,
                totalChapters: item.chapters.length,
                missingChapters: item.chapters,
                isFullyImported: false,
              };

              const previewChapters = item.chapters.slice(0, 4);
              const remainingCount = item.chapters.length - previewChapters.length;

              return (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-line-strong bg-sheet shadow-[0_10px_26px_-22px_rgba(15,23,42,0.14)] transition-shadow hover:shadow-[0_14px_30px_-20px_rgba(15,23,42,0.18)]"
                >
                  <div className={cn("h-1.5", color.solidClass)} style={color.solidStyle} />

                  <div className="flex flex-1 flex-col p-5">
                    {/* Top badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {catMeta && (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                              catMeta.badgeClass
                            )}
                          >
                            {catMeta.label}
                          </span>
                        )}
                        {item.code && (
                          <span className="rounded-md bg-paper-deep px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                            {item.code}
                          </span>
                        )}
                      </div>

                      {match.matchedSubject ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sage-tint px-2 py-0.5 text-[11px] font-semibold text-sage-deep">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          {match.isFullyImported
                            ? "อยู่บน Table แล้ว"
                            : `มีแล้ว ${match.existingChapterCount}/${match.totalChapters}`}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] font-medium text-ink-muted">
                          {item.chapters.length} บท
                        </span>
                      )}
                    </div>

                    {/* Title & description */}
                    <div className="mt-3 flex items-start gap-2.5">
                      <span
                        className="mt-0.5 text-2xl leading-none select-none"
                        role="img"
                        aria-hidden="true"
                      >
                        {item.emoji}
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-display text-lg leading-snug font-bold text-ink">
                          {item.name}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Chapter preview list */}
                    <div className="mt-4 flex-1 rounded-lg border border-line bg-paper/70 px-3 py-2.5">
                      <p className="mb-1.5 text-[11px] font-semibold text-ink-muted">
                        ตัวอย่างบทเรียน ({item.chapters.length} บท)
                      </p>
                      <ul className="space-y-1 text-xs text-ink-soft">
                        {previewChapters.map((ch, idx) => (
                          <li key={idx} className="flex items-baseline gap-2">
                            <span className="font-mono text-[10px] text-ink-muted">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="truncate">{ch}</span>
                          </li>
                        ))}
                      </ul>
                      {remainingCount > 0 && (
                        <p className="mt-1.5 text-[11px] font-medium text-ink-muted">
                          + อีก {remainingCount} บทเรียน...
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-1">
                      {match.isFullyImported ? (
                        <Link
                          href="/table"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex-1 gap-1.5 border-sage/35 bg-sage-tint/50 text-sage-deep hover:bg-sage-tint"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                          ดูบนหน้า Table
                        </Link>
                      ) : match.matchedSubject ? (
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleQuickImport(item)}
                        >
                          <BookPlus className="h-3.5 w-3.5" />
                          เพิ่ม {match.missingChapters.length} บทที่ขาด
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleQuickImport(item)}
                        >
                          <BookPlus className="h-3.5 w-3.5" />
                          หยิบเข้า Table
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(item)}
                        title="ดูรายชื่อบททั้งหมดและเลือกเฉพาะบทที่ต้องการ"
                        className="shrink-0 gap-1"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                        เลือกบท
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {previewItem && (
        <LibraryPreviewModal
          item={previewItem}
          match={
            matchById.get(previewItem.id) ?? {
              matchedSubject: null,
              existingChapterCount: 0,
              totalChapters: previewItem.chapters.length,
              missingChapters: previewItem.chapters,
              isFullyImported: false,
            }
          }
          onClose={() => setPreviewItem(null)}
          onConfirm={({ name, chapters, mergeIntoSubjectId }) => {
            dispatch({
              type: "importLibrarySubject",
              name,
              color: previewItem.color,
              emoji: previewItem.emoji,
              chapters,
              mergeIntoSubjectId,
            });
            setNotice(
              mergeIntoSubjectId
                ? {
                    title: `เติมบทเรียนให้ "${name}" แล้ว`,
                    detail: `เพิ่ม ${chapters.length} บทเรียนเข้าหน้า Table เรียบร้อย`,
                  }
                : {
                    title: `หยิบ "${name}" เข้า Table แล้ว`,
                    detail: `เพิ่ม ${chapters.length} บทเรียนที่เลือก พร้อมเริ่มติ๊กติดตามได้ทันที`,
                  }
            );
            setPreviewItem(null);
          }}
        />
      )}
    </>
  );
}
