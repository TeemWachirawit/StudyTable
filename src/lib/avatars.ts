export interface AvatarPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: "student",
    name: "นักเรียนแว่นตา",
    category: "study",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#fdf2ee"/>
        <!-- hair -->
        <circle cx="50" cy="46" r="26" fill="#c46d4e"/>
        <!-- face -->
        <circle cx="50" cy="50" r="21" fill="#fed7aa"/>
        <!-- bangs -->
        <path d="M29 44 Q50 34 71 44 Q60 36 50 36 Q38 36 29 44 Z" fill="#9a3412"/>
        <!-- glasses -->
        <circle cx="42" cy="49" r="6.5" fill="none" stroke="#431407" stroke-width="2.5"/>
        <circle cx="58" cy="49" r="6.5" fill="none" stroke="#431407" stroke-width="2.5"/>
        <path d="M48.5 49 L51.5 49" stroke="#431407" stroke-width="2.5"/>
        <!-- eyes -->
        <circle cx="42" cy="49" r="2" fill="#431407"/>
        <circle cx="58" cy="49" r="2" fill="#431407"/>
        <!-- smile -->
        <path d="M46 59 Q50 63 54 59" fill="none" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>
        <!-- shirt -->
        <path d="M26 88 Q50 72 74 88 L74 100 L26 100 Z" fill="#c46d4e"/>
        <!-- collar -->
        <path d="M42 78 L50 86 L58 78" fill="none" stroke="#ffffff" stroke-width="3"/>
      </svg>
    `),
  },
  {
    id: "cat",
    name: "แมวรักเรียน",
    category: "cute",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#eef5f1"/>
        <!-- ears -->
        <polygon points="30,42 22,20 44,30" fill="#5b8266"/>
        <polygon points="32,40 26,24 41,31" fill="#fbcfe8"/>
        <polygon points="70,42 78,20 56,30" fill="#5b8266"/>
        <polygon points="68,40 74,24 59,31" fill="#fbcfe8"/>
        <!-- head -->
        <circle cx="50" cy="52" r="25" fill="#719b7d"/>
        <!-- eyes -->
        <ellipse cx="41" cy="48" rx="3.5" ry="5" fill="#14532d"/>
        <ellipse cx="59" cy="48" rx="3.5" ry="5" fill="#14532d"/>
        <circle cx="42" cy="46" r="1.5" fill="#ffffff"/>
        <circle cx="60" cy="46" r="1.5" fill="#ffffff"/>
        <!-- nose & mouth -->
        <polygon points="48,55 52,55 50,57.5" fill="#f472b6"/>
        <path d="M47 58 Q50 61 50 57.5 Q50 61 53 58" fill="none" stroke="#14532d" stroke-width="1.8" stroke-linecap="round"/>
        <!-- whiskers -->
        <line x1="33" y1="53" x2="22" y2="51" stroke="#14532d" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="33" y1="57" x2="21" y2="59" stroke="#14532d" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="67" y1="53" x2="78" y2="51" stroke="#14532d" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="67" y1="57" x2="79" y2="59" stroke="#14532d" stroke-width="1.5" stroke-linecap="round"/>
        <!-- collar -->
        <path d="M30 84 Q50 74 70 84 L70 100 L30 100 Z" fill="#5b8266"/>
        <circle cx="50" cy="80" r="3.5" fill="#fbbf24"/>
      </svg>
    `),
  },
  {
    id: "owl",
    name: "นกฮูกปัญญา",
    category: "study",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#fdf8ed"/>
        <!-- body -->
        <ellipse cx="50" cy="56" rx="27" ry="28" fill="#d4973b"/>
        <!-- belly -->
        <ellipse cx="50" cy="62" rx="17" ry="19" fill="#fef3c7"/>
        <!-- belly feathers -->
        <path d="M44 58 Q47 61 50 58 Q53 61 56 58" fill="none" stroke="#d4973b" stroke-width="2"/>
        <path d="M44 65 Q47 68 50 65 Q53 68 56 65" fill="none" stroke="#d4973b" stroke-width="2"/>
        <!-- eye patches -->
        <circle cx="39" cy="44" r="10.5" fill="#ffffff"/>
        <circle cx="61" cy="44" r="10.5" fill="#ffffff"/>
        <!-- pupils -->
        <circle cx="39" cy="44" r="5" fill="#78350f"/>
        <circle cx="61" cy="44" r="5" fill="#78350f"/>
        <circle cx="37.5" cy="42" r="1.8" fill="#ffffff"/>
        <circle cx="59.5" cy="42" r="1.8" fill="#ffffff"/>
        <!-- beak -->
        <polygon points="47,48 53,48 50,56" fill="#b45309"/>
        <!-- ears / feather tufts -->
        <polygon points="32,32 25,18 40,26" fill="#b45309"/>
        <polygon points="68,32 75,18 60,26" fill="#b45309"/>
        <!-- graduation cap -->
        <polygon points="50,14 74,22 50,30 26,22" fill="#1e293b"/>
        <rect x="42" y="27" width="16" height="6" fill="#1e293b" rx="2"/>
        <path d="M68 22 L70 34" stroke="#f59e0b" stroke-width="2"/>
      </svg>
    `),
  },
  {
    id: "fox",
    name: "สุนัขจิ้งจอกนักอ่าน",
    category: "cute",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#fef2f2"/>
        <!-- ears -->
        <polygon points="26,38 18,14 42,24" fill="#ea580c"/>
        <polygon points="28,34 22,20 38,26" fill="#ffffff"/>
        <polygon points="74,38 82,14 58,24" fill="#ea580c"/>
        <polygon points="72,34 78,20 62,26" fill="#ffffff"/>
        <!-- head -->
        <polygon points="20,44 80,44 50,78" fill="#ea580c"/>
        <!-- cheeks white -->
        <polygon points="20,44 50,78 35,58" fill="#ffffff"/>
        <polygon points="80,44 50,78 65,58" fill="#ffffff"/>
        <!-- eyes -->
        <circle cx="38" cy="46" r="3.5" fill="#431407"/>
        <circle cx="62" cy="46" r="3.5" fill="#431407"/>
        <circle cx="39" cy="44.5" r="1.2" fill="#ffffff"/>
        <circle cx="63" cy="44.5" r="1.2" fill="#ffffff"/>
        <!-- nose -->
        <circle cx="50" cy="74" r="4" fill="#1c1917"/>
        <!-- shirt -->
        <path d="M26 86 Q50 74 74 86 L74 100 L26 100 Z" fill="#0284c7"/>
      </svg>
    `),
  },
  {
    id: "coffee",
    name: "กาแฟ & สมุดจด",
    category: "cozy",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#f1f5f9"/>
        <!-- steam -->
        <path d="M43 28 Q40 22 43 16" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M50 26 Q47 20 50 14" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M57 28 Q54 22 57 16" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <!-- mug body -->
        <path d="M32 36 L68 36 L64 74 Q62 82 50 82 Q38 82 36 74 Z" fill="#475569"/>
        <!-- handle -->
        <path d="M66 42 Q80 42 80 56 Q80 70 65 70" fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
        <!-- mug heart -->
        <path d="M50 61 Q45 54 44 49 A 3.5 3.5 0 0 1 50 47 A 3.5 3.5 0 0 1 56 49 Q55 54 50 61 Z" fill="#f87171"/>
        <!-- base saucer -->
        <ellipse cx="50" cy="85" rx="26" ry="5" fill="#334155"/>
      </svg>
    `),
  },
  {
    id: "rocket",
    name: "จรวดทะยานสู่เป้าหมาย",
    category: "focus",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#f0f9ff"/>
        <!-- flame -->
        <path d="M44 76 Q50 94 50 90 Q50 94 56 76 Z" fill="#f97316"/>
        <path d="M47 76 Q50 86 50 83 Q50 86 53 76 Z" fill="#facc15"/>
        <!-- rocket body -->
        <path d="M50 16 Q66 38 66 66 L34 66 Q34 38 50 16 Z" fill="#0284c7"/>
        <path d="M50 16 Q42 38 42 66 L34 66 Q34 38 50 16 Z" fill="#0369a1"/>
        <!-- nose cone tip -->
        <path d="M50 16 Q58 28 61 36 L39 36 Q42 28 50 16 Z" fill="#ef4444"/>
        <!-- window -->
        <circle cx="50" cy="46" r="8" fill="#e0f2fe" stroke="#0f172a" stroke-width="2"/>
        <circle cx="50" cy="46" r="5.5" fill="#38bdf8"/>
        <!-- wings -->
        <polygon points="34,56 20,72 34,70" fill="#ef4444"/>
        <polygon points="66,56 80,72 66,70" fill="#ef4444"/>
      </svg>
    `),
  },
  {
    id: "sprout",
    name: "ต้นกล้าแห่งการเรียนรู้",
    category: "nature",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#f0fdf4"/>
        <!-- pot -->
        <polygon points="34,60 66,60 62,86 38,86" fill="#d97706"/>
        <rect x="31" y="54" width="38" height="7" rx="2" fill="#b45309"/>
        <!-- stem -->
        <path d="M50 56 Q50 36 50 26" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>
        <!-- left leaf -->
        <path d="M50 38 Q32 30 32 44 Q44 46 50 38 Z" fill="#22c55e"/>
        <!-- right leaf -->
        <path d="M50 30 Q68 22 68 36 Q56 38 50 30 Z" fill="#4ade80"/>
        <!-- little heart sparkle -->
        <circle cx="50" cy="18" r="3.5" fill="#fbbf24"/>
      </svg>
    `),
  },
  {
    id: "artist",
    name: "จานสีความคิดสร้างสรรค์",
    category: "art",
    url: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#faf5ff"/>
        <!-- palette -->
        <path d="M24 50 C24 32 38 20 54 20 C70 20 82 32 82 50 C82 66 72 78 58 78 C52 78 48 74 48 68 C48 64 50 61 50 58 C50 53 46 50 41 50 C30 50 24 56 24 50 Z" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/>
        <!-- thumb hole -->
        <ellipse cx="64" cy="62" rx="4.5" ry="6" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
        <!-- paint blobs -->
        <circle cx="38" cy="32" r="4.5" fill="#ef4444"/>
        <circle cx="52" cy="28" r="4.5" fill="#f59e0b"/>
        <circle cx="66" cy="34" r="4.5" fill="#10b981"/>
        <circle cx="74" cy="46" r="4.5" fill="#3b82f6"/>
        <circle cx="36" cy="44" r="4.5" fill="#ec4899"/>
      </svg>
    `),
  },
];
