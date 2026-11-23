import type { SubjectColor } from "@/lib/colors";
import type { Subject } from "@/types/study";

export type LibraryCategory = "tgat" | "tpat" | "alevel" | "highschool";

export interface LibraryCategoryMeta {
  id: LibraryCategory;
  label: string;
  badgeClass: string;
}

export const LIBRARY_CATEGORIES: LibraryCategoryMeta[] = [
  {
    id: "tgat",
    label: "TGAT",
    badgeClass: "border-terracotta/30 bg-terracotta-tint text-terracotta-deep",
  },
  {
    id: "tpat",
    label: "TPAT",
    badgeClass: "border-plum/30 bg-plum-tint text-plum-deep",
  },
  {
    id: "alevel",
    label: "A-Level",
    badgeClass: "border-slate/30 bg-slate-tint text-slate-deep",
  },
  {
    id: "highschool",
    label: "ม.ปลาย",
    badgeClass: "border-sage/30 bg-sage-tint text-sage-deep",
  },
];

export interface LibraryItem {
  id: string;
  category: LibraryCategory;
  code?: string;
  name: string;
  description: string;
  color: SubjectColor;
  emoji: string;
  chapters: string[];
}

export const LIBRARY_CATALOG: LibraryItem[] = [
  // ── TGAT ──────────────────────────────────────────────────────────────
  {
    id: "tgat1-english",
    category: "tgat",
    code: "TGAT1",
    name: "TGAT1 การสื่อสารภาษาอังกฤษ",
    description: "ทักษะการสื่อสารภาษาอังกฤษเพื่อการเรียนต่อ ครอบคลุม Speaking, Reading, Vocabulary และ Grammar",
    color: "terracotta",
    emoji: "🇬🇧",
    chapters: [
      "Question-Response (ถาม-ตอบสั้น)",
      "Short Conversations (บทสนทนาสั้น)",
      "Long Conversations (บทสนทนายาว)",
      "Text Completion (เติมคำและโครงสร้างในบทความ)",
      "Reading Comprehension (การอ่านจับใจความ)",
      "Vocabulary & Idioms (คำศัพท์และสำนวนที่ออกบ่อย)",
    ],
  },
  {
    id: "tgat2-reasoning",
    category: "tgat",
    code: "TGAT2",
    name: "TGAT2 การคิดอย่างมีเหตุผล",
    description: "วัดความสามารถด้านภาษา ตัวเลข มิติสัมพันธ์ และการใช้เหตุผลเชิงตรรกะ",
    color: "mustard",
    emoji: "🧠",
    chapters: [
      "ความสามารถทางภาษา (การสื่อความหมาย การใช้ภาษา การอ่าน)",
      "ความสามารถทางตัวเลข (อนุกรมมิติ โจทย์ปัญหา เปรียบเทียบข้อมูล)",
      "ความสามารถทางมิติสัมพันธ์ (พับกล่อง หาภาพต่าง หมุนภาพสามมิติ)",
      "ความสามารถทางเหตุผล (อนุกรมภาพ อุปมาอุปไมย สรุปความ วิเคราะห์ข้อความ)",
    ],
  },
  {
    id: "tgat3-workforce",
    category: "tgat",
    code: "TGAT3",
    name: "TGAT3 สมรรถนะการทำงาน",
    description: "การคิดเชิงนวัตกรรม การแก้ปัญหาที่ซับซ้อน การบริหารอารมณ์ และการเป็นพลเมือง",
    color: "sage",
    emoji: "💼",
    chapters: [
      "การสร้างคุณค่าและนวัตกรรม (Value Creation & Innovation)",
      "การแก้ไขปัญหาที่ซับซ้อน (Complex Problem Solving)",
      "การบริหารจัดการอารมณ์ (Emotional Governance)",
      "การเป็นพลเมืองที่มีส่วนร่วมของสังคม (Civic Engagement)",
    ],
  },

  // ── TPAT ──────────────────────────────────────────────────────────────
  {
    id: "tpat1-med",
    category: "tpat",
    code: "TPAT1",
    name: "TPAT1 วิชาเฉพาะ กสพท",
    description: "ข้อสอบความถนัดแพทย์ 3 พาร์ตหลักสำหรับสายวิทยาศาสตร์สุขภาพ",
    color: "plum",
    emoji: "🩺",
    chapters: [
      "พาร์ตเชาวน์ปัญญา (อนุกรม มิติสัมพันธ์ ตรรกะ และโจทย์คณิตวิเคราะห์)",
      "พาร์ตจริยธรรมทางการแพทย์ (กฎหมายและสถานการณ์จำลองทางการแพทย์)",
      "พาร์ตความคิดเชื่อมโยง (บทความเชื่อมโยง GAT เดิมแบบ 20 ข้อความ)",
    ],
  },
  {
    id: "tpat3-stem",
    category: "tpat",
    code: "TPAT3",
    name: "TPAT3 ความถนัดวิทย์-เทคโนโลยี-วิศวะ",
    description: "วัดความถนัดด้านตัวเลข มิติสัมพันธ์ เชิงกล-ฟิสิกส์ และข่าวสารวิทยาศาสตร์เทคโนโลยี",
    color: "#4f46e5",
    emoji: "⚙️",
    chapters: [
      "ความถนัดด้านตัวเลข (Numerical Reasoning)",
      "ความถนัดด้านมิติสัมพันธ์ (Diagrammatic & Spatial Reasoning)",
      "ความถนัดด้านเชิงกลและฟิสิกส์ (Mechanical & Physics Aptitude)",
      "ความคิดเชิงวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์",
      "ความสนใจข่าวสารความรู้ทางด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์",
    ],
  },

  // ── A-Level ───────────────────────────────────────────────────────────
  {
    id: "alevel-math1",
    category: "alevel",
    code: "Math 1",
    name: "A-Level คณิตศาสตร์ประยุกต์ 1",
    description: "เนื้อหาคณิตศาสตร์พื้นฐานและเพิ่มเติมครบตาม Test Blueprint ทปอ.",
    color: "terracotta",
    emoji: "📐",
    chapters: [
      "เซต",
      "ตรรกศาสตร์",
      "จำนวนจริงและพหุนาม",
      "ฟังก์ชัน",
      "ฟังก์ชันเอกซ์โพเนนเชียลและฟังก์ชันลอการิทึม",
      "ฟังก์ชันตรีโกณมิติ",
      "เมทริกซ์",
      "เวกเตอร์ในสามมิติ",
      "จำนวนเชิงซ้อน",
      "เรขาคณิตวิเคราะห์และภาคตัดกรวย",
      "ลำดับและอนุกรม",
      "แคลคูลัสเบื้องต้น",
      "หลักการนับเบื้องต้นและความน่าจะเป็น",
      "สถิติ",
      "การแจกแจงความน่าจะเป็นเบื้องต้น",
    ],
  },
  {
    id: "alevel-math2",
    category: "alevel",
    code: "Math 2",
    name: "A-Level คณิตศาสตร์ประยุกต์ 2",
    description: "เนื้อหาคณิตศาสตร์พื้นฐานสำหรับสายศิลป์-คำนวณและสายบริหารตาม Blueprint ทปอ.",
    color: "#0284c7",
    emoji: "📊",
    chapters: [
      "เซต",
      "ตรรกศาสตร์เบื้องต้น",
      "เลขยกกำลัง",
      "ฟังก์ชัน",
      "ลำดับและอนุกรม",
      "ดอกเบี้ยและมูลค่าของเงิน",
      "สถิติ",
      "หลักการนับเบื้องต้น",
      "ความน่าจะเป็น",
    ],
  },
  {
    id: "alevel-physics",
    category: "alevel",
    code: "Phy",
    name: "A-Level ฟิสิกส์",
    description: "ครบทั้ง 5 กลุ่มสาระ: กลศาสตร์ คลื่น ไฟฟ้า ความร้อน-สสาร และฟิสิกส์แผนใหม่",
    color: "slate",
    emoji: "⚡",
    chapters: [
      "ธรรมชาติและพัฒนาการทางฟิสิกส์",
      "การเคลื่อนที่แนวตรง",
      "แรงและกฎการเคลื่อนที่",
      "สมดุลกลของวัตถุ",
      "งานและกฎการอนุรักษ์พลังงานกล",
      "โมเมนตัมและการชน",
      "การเคลื่อนที่แนวโค้ง",
      "การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย",
      "คลื่น",
      "แสงเชิงคลื่น",
      "แสงเชิงรังสี",
      "เสียง",
      "ไฟฟ้าสถิต",
      "ไฟฟ้ากระแส",
      "แม่เหล็กและไฟฟ้า",
      "คลื่นแม่เหล็กไฟฟ้า",
      "ความร้อนและแก๊ส",
      "ของแข็งและของไหล",
      "ฟิสิกส์อะตอม",
      "ฟิสิกส์นิวเคลียร์และฟิสิกส์อนุภาค",
    ],
  },
  {
    id: "alevel-chemistry",
    category: "alevel",
    code: "Chem",
    name: "A-Level เคมี",
    description: "ครอบคลุมสมบัติสาร ปริมาณสัมพันธ์ เคมีคำนวณ เคมีอินทรีย์ และพอลิเมอร์",
    color: "plum",
    emoji: "🧪",
    chapters: [
      "ความปลอดภัยและทักษะในปฏิบัติการเคมี",
      "อะตอมและสมบัติของธาตุ",
      "พันธะเคมี",
      "โมลและสูตรเคมี",
      "สารละลาย",
      "ปริมาณสัมพันธ์",
      "แก๊สและสมบัติของแก๊ส",
      "อัตราการเกิดปฏิกิริยาเคมี",
      "สมดุลเคมี",
      "กรด-เบส",
      "เคมีไฟฟ้า",
      "เคมีอินทรีย์",
      "พอลิเมอร์",
    ],
  },
  {
    id: "alevel-biology",
    category: "alevel",
    code: "Bio",
    name: "A-Level ชีววิทยา",
    description: "ครบทุกบทตั้งแต่เซลล์ ระบบร่างกาย พืช พันธุศาสตร์ ไปจนถึงระบบนิเวศ",
    color: "sage",
    emoji: "🧬",
    chapters: [
      "การศึกษาชีววิทยา",
      "เคมีที่เป็นพื้นฐานของสิ่งมีชีวิต",
      "เซลล์และการทำงานของเซลล์",
      "ระบบย่อยอาหาร",
      "ระบบหมุนเวียนเลือดและระบบน้ำเหลือง",
      "ระบบภูมิคุ้มกัน",
      "ระบบหายใจ",
      "ระบบขับถ่าย",
      "ระบบประสาทและอวัยวะรับความรู้สึก",
      "การเคลื่อนที่ของสิ่งมีชีวิต",
      "ระบบต่อมไร้ท่อ",
      "ระบบสืบพันธุ์และการเจริญเติบโต",
      "พฤติกรรมของสัตว์",
      "โครงสร้างและการเจริญเติบโตของพืชดอก",
      "การลำเลียงของพืช",
      "การสังเคราะห์ด้วยแสง",
      "การสืบพันธุ์ของพืชดอก",
      "การควบคุมการเจริญเติบโตและการตอบสนองของพืช",
      "โครงสร้างและหน้าที่ของดีเอ็นเอ",
      "การถ่ายทอดลักษณะทางพันธุกรรม",
      "พันธุศาสตร์โมเลกุลและเทคโนโลยีดีเอ็นเอ",
      "วิวัฒนาการ",
      "ความหลากหลายทางชีวภาพ",
      "ระบบนิเวศและไบโอม",
      "ประชากร",
      "มนุษย์กับความยั่งยืนของทรัพยากรธรรมชาติและสิ่งแวดล้อม",
    ],
  },
  {
    id: "alevel-english",
    category: "alevel",
    code: "Eng",
    name: "A-Level ภาษาอังกฤษ",
    description: "ทักษะการฟัง-พูด การอ่านบทความยาว และการเขียนเชิงโครงสร้างตาม Blueprint",
    color: "mustard",
    emoji: "📚",
    chapters: [
      "Listening and Speaking Skills (Short & Long Conversations)",
      "Reading Skills — Advertisement, Product Review & News Report",
      "Reading Skills — Visual & Long Academic Passage",
      "Writing Skills — Text Completion (Cloze Test)",
      "Writing Skills — Paragraph Organization",
    ],
  },
  {
    id: "alevel-thai",
    category: "alevel",
    code: "Thai",
    name: "A-Level ภาษาไทย",
    description: "การอ่านจับใจความ การเขียนเชิงเหตุผล การพูด-ฟัง และหลักการใช้ภาษาไทย",
    color: "#ea580c",
    emoji: "📖",
    chapters: [
      "การอ่าน (จับใจความ ตีความ วิเคราะห์เจตนาและน้ำเสียง)",
      "การเขียน (เรียงลำดับข้อความ การใช้เหตุผล การโต้แย้งและโน้มน้าว)",
      "การพูดและการฟัง (การวิเคราะห์จุดประสงค์และข้อคิด)",
      "หลักการใช้ภาษา (สะกดคำ คำประสม ประโยคกำกวม ระดับภาษา ราชาศัพท์)",
    ],
  },
  {
    id: "alevel-social",
    category: "alevel",
    code: "Soc",
    name: "A-Level สังคมศึกษา",
    description: "ครบทั้ง 5 สาระ: ศาสนา หน้าที่พลเมือง เศรษฐศาสตร์ ประวัติศาสตร์ และภูมิศาสตร์",
    color: "#16a34a",
    emoji: "🌏",
    chapters: [
      "ศาสนา ศีลธรรม จริยธรรม",
      "หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม",
      "เศรษฐศาสตร์",
      "ประวัติศาสตร์ (ไทยและสากล)",
      "ภูมิศาสตร์และเครื่องมือทางภูมิศาสตร์",
    ],
  },
  {
    id: "alevel-applied-sci",
    category: "alevel",
    code: "Sci",
    name: "A-Level วิทยาศาสตร์ประยุกต์",
    description: "วิทยาศาสตร์พื้นฐานสำหรับสายศิลป์ ครอบคลุมชีวภาพ กายภาพ และโลก-อวกาศ",
    color: "#db2777",
    emoji: "🔭",
    chapters: [
      "วิทยาศาสตร์ชีวภาพ (ระบบนิเวศ การรักษาดุลยภาพ พันธุกรรม)",
      "วิทยาศาสตร์กายภาพ (สารรอบตัว แรงและการเคลื่อนที่ พลังงาน คลื่น)",
      "วิทยาศาสตร์โลกและอวกาศ (เอกภพ โครงสร้างโลก การเปลี่ยนแปลงภูมิอากาศ)",
    ],
  },

  // ── ม.ปลาย (High School) ──────────────────────────────────────────────
  {
    id: "hs-math-m4",
    category: "highschool",
    code: "ม.4",
    name: "คณิตศาสตร์ ม.4",
    description: "เนื้อหาคณิตศาสตร์พื้นฐานและเพิ่มเติมระดับชั้น ม.4 สำหรับเก็บเกรดและปูพื้นฐาน",
    color: "terracotta",
    emoji: "✏️",
    chapters: [
      "เซต",
      "ตรรกศาสตร์เบื้องต้น",
      "จำนวนจริงและพหุนาม",
      "ความสัมพันธ์และฟังก์ชัน",
      "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม",
      "เรขาคณิตวิเคราะห์และภาคตัดกรวย",
    ],
  },
  {
    id: "hs-math-m5",
    category: "highschool",
    code: "ม.5",
    name: "คณิตศาสตร์ ม.5",
    description: "เนื้อหาคณิตศาสตร์ระดับชั้น ม.5 ตรีโกณมิติ เมทริกซ์ เวกเตอร์ จำนวนเชิงซ้อน และความน่าจะเป็น",
    color: "#0284c7",
    emoji: "📏",
    chapters: [
      "ฟังก์ชันตรีโกณมิติ",
      "เมทริกซ์",
      "เวกเตอร์ในสามมิติ",
      "จำนวนเชิงซ้อน",
      "หลักการนับเบื้องต้นและความน่าจะเป็น",
    ],
  },
  {
    id: "hs-math-m6",
    category: "highschool",
    code: "ม.6",
    name: "คณิตศาสตร์ ม.6",
    description: "เนื้อหาคณิตศาสตร์ระดับชั้น ม.6 ลำดับ-อนุกรม แคลคูลัส และสถิติ",
    color: "#4f46e5",
    emoji: "🎓",
    chapters: [
      "ลำดับและอนุกรม",
      "แคลคูลัสเบื้องต้น",
      "การวิเคราะห์และนำเสนอข้อมูลเชิงคุณภาพและเชิงปริมาณ",
      "ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น",
    ],
  },
  {
    id: "hs-physics-m4",
    category: "highschool",
    code: "ม.4",
    name: "ฟิสิกส์ ม.4 (กลศาสตร์)",
    description: "เนื้อหากลศาสตร์พื้นฐานระดับชั้น ม.4 ตั้งแต่การเคลื่อนที่แนวตรงจนถึงการเคลื่อนที่แนวโค้ง",
    color: "slate",
    emoji: "🚀",
    chapters: [
      "ธรรมชาติและพัฒนาการทางฟิสิกส์",
      "การเคลื่อนที่แนวตรง",
      "แรงและกฎการเคลื่อนที่",
      "สมดุลกล",
      "งานและพลังงาน",
      "โมเมนตัมและการชน",
      "การเคลื่อนที่แนวโค้ง",
    ],
  },
  {
    id: "hs-physics-m5",
    category: "highschool",
    code: "ม.5",
    name: "ฟิสิกส์ ม.5 (คลื่นและไฟฟ้า)",
    description: "เนื้อหาคลื่น แสง เสียง และไฟฟ้าเบื้องต้นระดับชั้น ม.5",
    color: "mustard",
    emoji: "🌊",
    chapters: [
      "การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย",
      "คลื่นกล",
      "แสงเชิงคลื่น",
      "แสงเชิงรังสี",
      "เสียง",
      "ไฟฟ้าสถิต",
      "ไฟฟ้ากระแส",
    ],
  },
  {
    id: "hs-physics-m6",
    category: "highschool",
    code: "ม.6",
    name: "ฟิสิกส์ ม.6 (แม่เหล็ก ความร้อน อะตอม)",
    description: "เนื้อหาแม่เหล็กไฟฟ้า ความร้อน-แก๊ส ของแข็ง-ของไหล และฟิสิกส์แผนใหม่ระดับชั้น ม.6",
    color: "plum",
    emoji: "⚛️",
    chapters: [
      "แม่เหล็กและไฟฟ้า",
      "ความร้อนและแก๊ส",
      "ของแข็งและของไหล",
      "คลื่นแม่เหล็กไฟฟ้า",
      "ฟิสิกส์อะตอม",
      "ฟิสิกส์นิวเคลียร์และฟิสิกส์อนุภาค",
    ],
  },
];

export function normalizeTitle(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function filterLibraryItems(
  items: LibraryItem[],
  category: LibraryCategory | "all",
  query: string
): LibraryItem[] {
  const q = normalizeTitle(query);
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    const inName = normalizeTitle(item.name).includes(q);
    const inCode = item.code ? normalizeTitle(item.code).includes(q) : false;
    const inDesc = normalizeTitle(item.description).includes(q);
    const inChapters = item.chapters.some((ch) => normalizeTitle(ch).includes(q));
    return inName || inCode || inDesc || inChapters;
  });
}

export interface LibraryMatchStatus {
  matchedSubject: Subject | null;
  existingChapterCount: number;
  totalChapters: number;
  missingChapters: string[];
  isFullyImported: boolean;
}

export function getLibraryMatchStatus(
  item: LibraryItem,
  subjects: Subject[]
): LibraryMatchStatus {
  const targetName = normalizeTitle(item.name);
  const matchedSubject =
    subjects.find((s) => normalizeTitle(s.name) === targetName) ?? null;

  if (!matchedSubject) {
    return {
      matchedSubject: null,
      existingChapterCount: 0,
      totalChapters: item.chapters.length,
      missingChapters: item.chapters,
      isFullyImported: false,
    };
  }

  const existingSet = new Set(matchedSubject.chapters.map((c) => normalizeTitle(c.title)));
  const missingChapters = item.chapters.filter((ch) => !existingSet.has(normalizeTitle(ch)));
  const existingChapterCount = item.chapters.length - missingChapters.length;

  return {
    matchedSubject,
    existingChapterCount,
    totalChapters: item.chapters.length,
    missingChapters,
    isFullyImported: missingChapters.length === 0,
  };
}
