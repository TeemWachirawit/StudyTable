"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Bug,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "general";

const FEEDBACK_TYPES: {
  value: FeedbackType;
  label: string;
  hint: string;
  icon: typeof Bug;
  activeClass: string;
  iconClass: string;
  placeholder: string;
}[] = [
  {
    value: "bug",
    label: "แจ้งบั๊ก / ปัญหา",
    hint: "ปุ่มกดไม่ได้ แสดงผลเพี้ยน หรือ error",
    icon: Bug,
    activeClass: "border-terracotta/50 bg-terracotta-tint text-terracotta-deep",
    iconClass: "text-terracotta",
    placeholder:
      "อธิบายสิ่งที่เกิดขึ้น ขั้นตอนที่ทำให้เกิดปัญหา และสิ่งที่คาดหวังว่าจะเกิดขึ้น...",
  },
  {
    value: "feature",
    label: "เสนอฟีเจอร์ใหม่",
    hint: "อยากให้เพิ่มเครื่องมือหรือความสามารถอะไร",
    icon: Lightbulb,
    activeClass: "border-mustard/50 bg-mustard-tint text-mustard-deep",
    iconClass: "text-mustard-deep",
    placeholder:
      "อยากให้ StudyTable เพิ่มฟีเจอร์อะไร และจะช่วยให้การอ่านหนังสือของคุณดีขึ้นอย่างไร...",
  },
  {
    value: "general",
    label: "ความคิดเห็นทั่วไป",
    hint: "คำติชม ประสบการณ์ใช้งาน หรือคำแนะนำอื่นๆ",
    icon: MessageSquare,
    activeClass: "border-sage/50 bg-sage-tint text-sage-deep",
    iconClass: "text-sage-deep",
    placeholder: "แชร์ความรู้สึกหรือข้อเสนอแนะที่คุณอยากบอกเรา...",
  },
];

const PAGE_OPTIONS = [
  { value: "", label: "ไม่ระบุหน้า" },
  { value: "/planner", label: "Planner (ตารางรายสัปดาห์)" },
  { value: "/table", label: "Table / Focus Timer" },
  { value: "/library", label: "Library (คลังวิชา)" },
  { value: "/exam", label: "Exam (นับถอยหลังวันสอบ)" },
  { value: "/dashboard", label: "Dashboard (ภาพรวม)" },
  { value: "/settings", label: "ตั้งค่าบัญชี / เข้าสู่ระบบ" },
  { value: "other", label: "อื่นๆ" },
];

export function FeedbackForm() {
  const { data: session } = useSession();
  const [type, setType] = useState<FeedbackType>("bug");
  const [pagePath, setPagePath] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (!emailTouched && session?.user?.email && !contactEmail) {
      setContactEmail(session.user.email);
    }
  }, [session?.user?.email, emailTouched, contactEmail]);

  const activeType = FEEDBACK_TYPES.find((item) => item.value === type) ?? FEEDBACK_TYPES[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError("กรุณากรอกหัวข้ออย่างน้อย 3 ตัวอักษร");
      return;
    }
    if (description.trim().length < 10) {
      setError("กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description,
          pagePath,
          contactEmail,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error || "ส่งรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setSubmittedId(data.id ?? "submitted");
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setTitle("");
    setDescription("");
    setPagePath("");
    setError(null);
    setSubmittedId(null);
  }

  if (submittedId) {
    return (
      <div className="rounded-2xl border border-line bg-sheet p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage-tint text-sage-deep">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">
          ส่งรายงานเรียบร้อยแล้ว
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          ขอบคุณที่ช่วยแจ้งปัญหาและแบ่งปันไอเดียให้ StudyTable ดียิ่งขึ้น
        </p>
        <p className="mt-3 inline-block rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs text-ink-muted">
          Ref: #{submittedId.slice(0, 8)}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            ส่งรายงานเพิ่มเติม
          </Button>
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-line bg-sheet p-6 shadow-sm sm:p-8"
    >
      <div>
        <label className="block text-sm font-semibold text-ink">ประเภทของรายงาน</label>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
          {FEEDBACK_TYPES.map((item) => {
            const Icon = item.icon;
            const selected = type === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                  selected
                    ? item.activeClass
                    : "border-line bg-paper text-ink-soft hover:border-line-strong hover:bg-paper-deep"
                )}
              >
                <Icon className={cn("h-4 w-4", selected ? "" : item.iconClass)} />
                <span className="mt-2 text-sm font-semibold text-ink">{item.label}</span>
                <span className="mt-0.5 text-xs text-ink-muted">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="feedback-page" className="block text-sm font-semibold text-ink">
            หน้าที่เกี่ยวข้อง <span className="font-normal text-ink-muted">(ไม่บังคับ)</span>
          </label>
          <select
            id="feedback-page"
            value={pagePath}
            onChange={(e) => setPagePath(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink transition-colors focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/25"
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="feedback-email" className="block text-sm font-semibold text-ink">
            อีเมลติดต่อกลับ <span className="font-normal text-ink-muted">(ไม่บังคับ)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={contactEmail}
            onChange={(e) => {
              setEmailTouched(true);
              setContactEmail(e.target.value);
            }}
            placeholder="you@example.com"
            maxLength={254}
            className="mt-1.5 h-11 w-full rounded-lg border border-line-strong bg-paper px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/25"
          />
        </div>
      </div>

      <div>
        <label htmlFor="feedback-title" className="block text-sm font-semibold text-ink">
          หัวข้อ <span className="text-terracotta">*</span>
        </label>
        <input
          id="feedback-title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            type === "bug"
              ? "เช่น กดบันทึกเวลาอ่านใน Focus Timer แล้วไม่ขึ้น"
              : type === "feature"
                ? "เช่น อยากให้ส่งออกตารางเป็นรูปภาพหรือ PDF ได้"
                : "เช่น ชอบโทนสีและหน้าตาเว็บมากครับ"
          }
          className="mt-1.5 h-11 w-full rounded-lg border border-line-strong bg-paper px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/25"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="feedback-description" className="block text-sm font-semibold text-ink">
            รายละเอียด <span className="text-terracotta">*</span>
          </label>
          <span className="font-mono text-xs text-ink-muted">
            {description.length}/2000
          </span>
        </div>
        <textarea
          id="feedback-description"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={activeType.placeholder}
          className="mt-1.5 w-full resize-y rounded-lg border border-line-strong bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/25"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-tint px-4 py-3 text-sm font-medium text-danger-deep"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
        <p className="text-xs text-ink-muted">
          ข้อมูลเบราว์เซอร์จะถูกแนบโดยอัตโนมัติเพื่อช่วยให้ตรวจสอบปัญหาได้เร็วขึ้น
        </p>
        <Button type="submit" disabled={submitting} className="shrink-0">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังส่ง…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              ส่งรายงาน
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
