import { getSubjectColor, isLightHex } from "@/lib/colors";
import {
  DAYS,
  FIRST_HOUR,
  LAST_HOUR,
  blockDurationMinutes,
  blockEndMinutes,
  blockStartMinutes,
  formatBlockTime,
  formatHour,
  isClassBlock,
  isStudyBlock,
  toISODate,
} from "@/lib/study";
import type { StudyBlock, Subject } from "@/types/study";

export interface ExportPlannerOptions {
  blocks: StudyBlock[];
  subjects: Subject[];
  filterLabel?: string;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (maxWidth <= 0) return "";
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + ellipsis).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo > 0 ? text.slice(0, lo) + ellipsis : "";
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#2563eb";
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hexA: string, hexB: string, weightA: number): string {
  const parse = (h: string) => {
    const c = /^#[0-9a-fA-F]{6}$/.test(h) ? h : "#2563eb";
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const w2 = 1 - weightA;
  const r = Math.round(r1 * weightA + r2 * w2);
  const g = Math.round(g1 * weightA + g2 * w2);
  const b = Math.round(b1 * weightA + b2 * w2);
  return `rgb(${r}, ${g}, ${b})`;
}

export async function exportPlannerToPng({
  blocks,
  subjects,
  filterLabel,
}: ExportPlannerOptions): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const isDark = document.documentElement.classList.contains("dark");
  const palette = isDark
    ? {
        bg: "#0b1120",
        sheet: "#111827",
        headerCell: "#151e32",
        line: "#1f2937",
        lineStrong: "#334155",
        ink: "#f1f5f9",
        inkSoft: "#cbd5e1",
        inkMuted: "#94a3b8",
        accent: "#3b82f6",
        accentText: "#93c5fd",
        accentTint: "#172554",
        sage: "#14b8a6",
        sageText: "#5eead4",
        sageTint: "#042f2e",
      }
    : {
        bg: "#fafbfc",
        sheet: "#ffffff",
        headerCell: "#f8fafc",
        line: "#e5e9f0",
        lineStrong: "#cbd5e1",
        ink: "#0f172a",
        inkSoft: "#475569",
        inkMuted: "#64748b",
        accent: "#2563eb",
        accentText: "#1d4ed8",
        accentTint: "#eff6ff",
        sage: "#0d9488",
        sageText: "#0f766e",
        sageTint: "#ecfdf5",
      };

  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  // Auto-crop hour range around existing blocks so exported PNG is crisp and compact
  let startHour = 8;
  let endHour = 21;
  if (blocks.length > 0) {
    const minStart = Math.min(...blocks.map((b) => Math.floor(blockStartMinutes(b) / 60)));
    const maxEnd = Math.max(...blocks.map((b) => Math.ceil(blockEndMinutes(b) / 60)));
    startHour = Math.max(FIRST_HOUR, Math.min(minStart - 1, 18));
    endHour = Math.min(LAST_HOUR, Math.max(maxEnd + 1, startHour + 6));
  }
  const hourCount = Math.max(1, endHour - startHour);

  const padding = 32;
  const headerHeight = 76;
  const dayHeaderHeight = 42;
  const timeColWidth = 74;
  const dayColWidth = 172;
  const rowHeight = 68;
  const footerHeight = 32;

  const gridWidth = timeColWidth + dayColWidth * 7;
  const gridHeight = dayHeaderHeight + hourCount * rowHeight;
  const width = padding * 2 + gridWidth;
  const height = padding * 2 + headerHeight + gridHeight + footerHeight;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(scale, scale);

  const sansFont = `"IBM Plex Sans Thai", "Noto Sans Thai", system-ui, sans-serif`;
  const displayFont = `"Noto Serif Thai", "IBM Plex Sans Thai", Georgia, serif`;
  const monoFont = `"IBM Plex Mono", Consolas, monospace`;

  // Page background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // Header
  const totalHours =
    Math.round(blocks.reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10) / 10;
  const classHours =
    Math.round(
      blocks.filter(isClassBlock).reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10
    ) / 10;
  const studyHours =
    Math.round(
      blocks.filter(isStudyBlock).reduce((sum, b) => sum + blockDurationMinutes(b) / 60, 0) * 10
    ) / 10;

  ctx.fillStyle = palette.ink;
  ctx.font = `700 22px ${displayFont}`;
  ctx.textBaseline = "top";
  ctx.fillText("ตารางเรียนและตารางอ่านหนังสือ", padding, padding);

  ctx.fillStyle = palette.inkSoft;
  ctx.font = `500 13px ${sansFont}`;
  const subtitle = filterLabel ? `มุมมอง: ${filterLabel}` : "StudyTable Weekly Planner";
  ctx.fillText(subtitle, padding, padding + 32);

  // Summary pill on right
  const summaryText = `รวม ${totalHours} ชม./สัปดาห์  ·  เรียน ${classHours} ชม.  ·  อ่าน ${studyHours} ชม.`;
  ctx.font = `600 12px ${monoFont}`;
  const pillTextW = ctx.measureText(summaryText).width;
  const pillW = pillTextW + 28;
  const pillH = 32;
  const pillX = width - padding - pillW;
  const pillY = padding + 10;

  roundRectPath(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fillStyle = palette.sheet;
  ctx.fill();
  ctx.strokeStyle = palette.lineStrong;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = palette.ink;
  ctx.textBaseline = "middle";
  ctx.fillText(summaryText, pillX + 14, pillY + pillH / 2);

  // Main timetable container
  const gridX = padding;
  const gridY = padding + headerHeight;

  ctx.save();
  roundRectPath(ctx, gridX, gridY, gridWidth, gridHeight, 14);
  ctx.fillStyle = palette.sheet;
  ctx.fill();
  ctx.clip();

  // Day header background
  ctx.fillStyle = palette.headerCell;
  ctx.fillRect(gridX, gridY, gridWidth, dayHeaderHeight);

  // Day header labels & vertical grid lines
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1;

  for (let d = 0; d < 7; d++) {
    const colX = gridX + timeColWidth + d * dayColWidth;
    ctx.beginPath();
    ctx.moveTo(colX, gridY);
    ctx.lineTo(colX, gridY + gridHeight);
    ctx.stroke();

    ctx.fillStyle = palette.inkSoft;
    ctx.font = `600 13px ${sansFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(DAYS[d], colX + dayColWidth / 2, gridY + dayHeaderHeight / 2);
  }
  ctx.textAlign = "left";

  // Horizontal hour lines & time labels
  for (let r = 0; r <= hourCount; r++) {
    const y = gridY + dayHeaderHeight + r * rowHeight;
    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX + gridWidth, y);
    ctx.strokeStyle = r === 0 ? palette.lineStrong : palette.line;
    ctx.stroke();

    if (r < hourCount) {
      ctx.fillStyle = palette.inkMuted;
      ctx.font = `500 11px ${monoFont}`;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(formatHour(startHour + r), gridX + timeColWidth - 10, y + 8);
    }
  }
  ctx.textAlign = "left";

  // Draw blocks
  for (const b of blocks) {
    const subject = subjectById.get(b.subjectId);
    if (!subject) continue;

    const sc = getSubjectColor(subject.color);
    const sMin = blockStartMinutes(b);
    const eMin = blockEndMinutes(b);
    const topPx = ((sMin - startHour * 60) / 60) * rowHeight;
    const heightPx = ((eMin - sMin) / 60) * rowHeight;

    if (topPx + heightPx <= 0 || topPx >= hourCount * rowHeight) continue;

    const bx = gridX + timeColWidth + b.day * dayColWidth + 4;
    const by = gridY + dayHeaderHeight + topPx + 3;
    const bw = dayColWidth - 8;
    const bh = Math.max(24, heightPx - 6);

    const light = isLightHex(sc.hex);
    const fillBg = isDark
      ? mixHex(sc.hex, palette.sheet, 0.24)
      : mixHex(sc.hex, "#ffffff", light ? 0.2 : 0.12);
    const borderCol = hexToRgba(sc.hex, isDark ? 0.55 : 0.38);
    const textCol = isDark
      ? mixHex(sc.hex, "#f8fafc", 0.35)
      : mixHex(sc.hex, "#0f172a", light ? 0.45 : 0.72);

    roundRectPath(ctx, bx, by, bw, bh, 8);
    ctx.fillStyle = fillBg;
    ctx.fill();
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Left accent stripe
    roundRectPath(ctx, bx + 1, by + 1, 3.5, bh - 2, 2);
    ctx.fillStyle = sc.hex;
    ctx.fill();

    const innerX = bx + 10;
    const innerW = bw - 16;
    const isClass = isClassBlock(b);

    // Type badge on top-right
    const badgeLabel = isClass ? "เรียน" : "อ่าน";
    ctx.font = `700 10px ${sansFont}`;
    const badgeW = ctx.measureText(badgeLabel).width + 10;
    const badgeH = 16;
    const badgeX = bx + bw - badgeW - 6;
    const badgeY = by + 6;

    roundRectPath(ctx, badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fillStyle = isClass ? hexToRgba(palette.accent, 0.2) : hexToRgba(palette.sage, 0.2);
    ctx.fill();
    ctx.fillStyle = isClass ? palette.accentText : palette.sageText;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(badgeLabel, badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5);
    ctx.textAlign = "left";

    // Subject name
    ctx.fillStyle = textCol;
    ctx.font = `700 12px ${sansFont}`;
    ctx.textBaseline = "top";
    const titlePrefix = subject.emoji ? `${subject.emoji} ` : "";
    const titleText = truncateText(ctx, `${titlePrefix}${subject.name}`, innerW - badgeW - 6);
    ctx.fillText(titleText, innerX, by + 7);

    let cursorY = by + 24;

    if (isClass && b.location && bh >= 56) {
      ctx.fillStyle = textCol;
      ctx.globalAlpha = 0.85;
      ctx.font = `500 10.5px ${monoFont}`;
      ctx.fillText(truncateText(ctx, `📍 ${b.location}`, innerW), innerX, cursorY);
      ctx.globalAlpha = 1;
      cursorY += 15;
    }

    if (b.topic && bh >= 44 && cursorY + 14 < by + bh - 14) {
      ctx.fillStyle = textCol;
      ctx.globalAlpha = 0.88;
      ctx.font = `400 11px ${sansFont}`;
      ctx.fillText(truncateText(ctx, b.topic, innerW), innerX, cursorY);
      ctx.globalAlpha = 1;
    }

    if (bh >= 42) {
      ctx.fillStyle = textCol;
      ctx.globalAlpha = 0.72;
      ctx.font = `500 10.5px ${monoFont}`;
      ctx.textBaseline = "bottom";
      ctx.fillText(formatBlockTime(b), innerX, by + bh - 5);
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();

  // Outer border of grid
  roundRectPath(ctx, gridX, gridY, gridWidth, gridHeight, 14);
  ctx.strokeStyle = palette.lineStrong;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Subtle footer watermark
  ctx.fillStyle = palette.inkMuted;
  ctx.font = `500 11px ${monoFont}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(
    `StudyTable · ${toISODate(new Date())}`,
    width - padding,
    gridY + gridHeight + footerHeight / 2 + 4
  );

  // Trigger download
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `studytable-planner-${toISODate(new Date())}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
