"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mail,
  Palette,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PRESET_AVATARS } from "@/lib/avatars";
import { formatThaiDate } from "@/lib/study";
import { cn } from "@/lib/utils";

function compressImage(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SettingsBoard() {
  const { data: session, update, status } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [avatarTab, setAvatarTab] = useState<"presets" | "upload" | "url">("presets");
  const [customUrl, setCustomUrl] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fields from session & API
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || null);
    }
  }, [session]);

  useEffect(() => {
    async function loadFullProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.user.name) setName(data.user.name);
            if (data.user.image) setImage(data.user.image);
            if (data.user.createdAt) setCreatedAt(data.user.createdAt);
          }
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    }
    if (status === "authenticated") {
      loadFullProfile();
    }
  }, [status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMsg({ type: "error", text: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP)" });
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file, 256);
      setImage(compressedDataUrl);
      setStatusMsg(null);
    } catch {
      setStatusMsg({ type: "error", text: "ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง" });
    }
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setStatusMsg({ type: "error", text: "กรุณาระบุ URL ที่ขึ้นต้นด้วย http:// หรือ https://" });
      return;
    }
    setImage(trimmed);
    setCustomUrl("");
    setStatusMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatusMsg({ type: "error", text: "กรุณาระบุชื่อผู้ใช้" });
      return;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        setStatusMsg({ type: "error", text: "กรุณาระบุรหัสผ่านปัจจุบัน" });
        return;
      }
      if (newPassword.length < 6) {
        setStatusMsg({ type: "error", text: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMsg({ type: "error", text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: {
        name: string;
        image: string | null;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: trimmedName,
        image: image || "",
      };

      if (showPasswordChange) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }

      // Update the active NextAuth session immediately
      await update({
        name: trimmedName,
        image: image || "",
      });

      setStatusMsg({ type: "success", text: "บันทึกการเปลี่ยนแปลงบัญชีเรียบร้อยแล้ว" });
      if (showPasswordChange) {
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      setStatusMsg({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-terracotta" />
        <p className="mt-3 text-sm text-ink-muted">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Account Settings"
        tone="sky"
        title="ตั้งค่าบัญชีผู้ใช้"
        description="ปรับแต่งชื่อที่แสดง รูปโปรไฟล์ และจัดการความปลอดภัยของบัญชีของคุณ"
      />

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {statusMsg && (
            <div
              role="alert"
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-4 text-sm font-medium transition-all",
                statusMsg.type === "success"
                  ? "border-sage/40 bg-sage-tint text-sage-deep"
                  : "border-slate/40 bg-slate-tint text-slate-deep"
              )}
            >
              {statusMsg.type === "success" ? (
                <Check className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Section 1: Profile Picture */}
          <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Camera className="h-5 w-5 text-terracotta" />
              รูปโปรไฟล์
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              เลือกอวาตาร์น่ารักๆ ที่เราเตรียมไว้ให้ อัปโหลดรูปภาพของคุณเอง หรือระบุลิงก์รูปภาพ
            </p>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-2.5">
                <UserAvatar image={image} name={name} size="xl" />
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="inline-flex items-center gap-1 text-xs text-slate hover:text-slate-deep"
                  >
                    <Trash2 className="h-3 w-3" /> ลบรูปภาพ
                  </button>
                )}
              </div>

              {/* Avatar Chooser Tabs */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAvatarTab("presets")}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 transition-colors",
                      avatarTab === "presets"
                        ? "border border-line bg-sheet text-ink shadow-2xs"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-mustard" />
                      อวาตาร์แนะนำ
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab("upload")}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 transition-colors",
                      avatarTab === "upload"
                        ? "border border-line bg-sheet text-ink shadow-2xs"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-terracotta" />
                      อัปโหลดรูป
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab("url")}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 transition-colors",
                      avatarTab === "url"
                        ? "border border-line bg-sheet text-ink shadow-2xs"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5 text-sage" />
                      ลิงก์ URL
                    </span>
                  </button>
                </div>

                {/* Tab Content 1: Presets */}
                {avatarTab === "presets" && (
                  <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = image === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          title={preset.name}
                          className={cn(
                            "group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all",
                            isSelected
                              ? "border-terracotta bg-terracotta-tint/50 shadow-xs ring-2 ring-terracotta"
                              : "border-line bg-sheet hover:border-line-strong hover:bg-paper"
                          )}
                        >
                          <div className="h-12 w-12 overflow-hidden rounded-full border border-line">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="max-w-full truncate text-[11px] font-medium text-ink">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tab Content 2: Upload */}
                {avatarTab === "upload" && (
                  <div className="rounded-xl border border-dashed border-line-strong bg-paper p-5 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sheet shadow-2xs text-terracotta">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-ink">
                      คลิกเพื่อเลือกรูปภาพจากเครื่องของคุณ
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      รองรับไฟล์ JPG, PNG, WebP (ระบบจะย่อขนาดให้อัตโนมัติ)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      เลือกไฟล์รูปภาพ
                    </Button>
                  </div>
                )}

                {/* Tab Content 3: URL */}
                {avatarTab === "url" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/my-photo.jpg"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className={inputClass}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCustomUrl}
                        disabled={!customUrl.trim()}
                      >
                        นำไปใช้
                      </Button>
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      ระบุที่อยู่ลิงก์รูปภาพสาธารณะ เช่น จาก GitHub, Discord, หรือเว็บฝากรูป
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: General Profile Info */}
          <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-2xs space-y-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <User className="h-5 w-5 text-terracotta" />
              ข้อมูลบัญชี
            </h2>

            <Field
              label="ชื่อผู้ใช้ / ชื่อที่แสดง"
              htmlFor="profile-name"
              hint="ชื่อนี้จะแสดงบนแถบเมนูนำทางและแดชบอร์ดของคุณ"
            >
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                className={inputClass}
                placeholder="เช่น นนท์ อ่านหนังสือ"
              />
            </Field>

            <Field
              label="อีเมลบัญชี"
              htmlFor="profile-email"
              hint="อีเมลที่ใช้สำหรับเข้าสู่ระบบ (ไม่สามารถแก้ไขได้)"
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                <input
                  id="profile-email"
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className={cn(inputClass, "pl-9 cursor-not-allowed bg-paper text-ink-muted")}
                />
                <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-ink-muted" />
              </div>
            </Field>

            {createdAt && (
              <div className="flex items-center gap-2 pt-2 text-xs text-ink-muted">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  สมาชิกตั้งแต่: {formatThaiDate(createdAt.slice(0, 10))}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Password & Security */}
          <div className="rounded-2xl border border-line-strong bg-sheet p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <KeyRound className="h-5 w-5 text-terracotta" />
                  ความปลอดภัยและรหัสผ่าน
                </h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  เปลี่ยนรหัสผ่านเพื่อความปลอดภัยในการเข้าสู่ระบบ
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordChange((prev) => !prev);
                  setStatusMsg(null);
                }}
              >
                {showPasswordChange ? "ยกเลิก" : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </div>

            {showPasswordChange && (
              <div className="mt-4 space-y-4 border-t border-line pt-4 transition-all">
                <Field label="รหัสผ่านปัจจุบัน" htmlFor="current-password">
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={showPasswordChange}
                    className={inputClass}
                    placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="รหัสผ่านใหม่"
                    htmlFor="new-password"
                    hint="อย่างน้อย 6 ตัวอักษร"
                  >
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required={showPasswordChange}
                      minLength={6}
                      className={inputClass}
                      placeholder="รหัสผ่านใหม่"
                    />
                  </Field>

                  <Field label="ยืนยันรหัสผ่านใหม่" htmlFor="confirm-password">
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={showPasswordChange}
                      minLength={6}
                      className={inputClass}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="min-w-36 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
