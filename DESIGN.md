# StudyTable — Design System (`DESIGN.md`)

## Aesthetic Direction: Warm Academic Planner
ออกแบบด้วยแรงบันดาลใจจากสมุดแพลนเนอร์กระดาษถนอมสายตาสไตล์ญี่ปุ่นและยุโรป (Muji / Hobonichi / Monocle Editorial) ผสานความคมชัดของเส้นตาราง (Ledger Grid) เข้ากับโทนสีเอิร์ธโทนอบอุ่น ช่วยลดความล้าของสายตาขณะวางแผนเรียนหรืออ่านหนังสือเป็นเวลานาน

### Anti-Patterns Enforced (`impeccable`)
- **No AI Slop Gradients:** ห้ามใช้พื้นหลังไล่สีม่วง-น้ำเงินสะท้อนแสง
- **No Card Recursion:** หลีกเลี่ยงการซ้อนกรอบการ์ดหลายชั้น ใช้เส้นคั่นตารางขนาด `1px` (`#E4DDD3`) และพื้นที่ว่าง (Negative Space) ในการแบ่งสัดส่วน
- **Distinctive Typography:** ผสมผสานฟอนต์ Serif สำหรับหัวข้อวิชาการ (`Fraunces`), ฟอนต์ไทยไร้หัวที่อ่านง่ายคมชัด (`IBM Plex Sans Thai`), และฟอนต์ Monospace สำหรับตัวเลขเวลาและสถิติ (`JetBrains Mono`)

## Color Tokens

### Surface Palette (Warm Paper & Ink)
- `--bg-paper`: `#FAF7F2` (Warm Cream Paper — พื้นหลังหลัก)
- `--bg-ledger`: `#F3EFE6` (Soft Sand Ledger — พื้นหลังส่วนหัวตารางและแถบข้าง)
- `--bg-sheet`: `#FFFFFF` (Crisp Ivory Sheet — พื้นผิวการ์ดและช่องตารางที่ใช้งาน)
- `--border-ledger`: `#E4DDD3` (Hairline Ledger Rule — เส้นตารางหลัก)
- `--border-strong`: `#CBC2B5` (Defined Divider — เส้นแบ่งหมวดหมู่ชัดเจน)

### Typography & Ink
- `--ink-primary`: `#1E1B18` (Deep Espresso Ink — ข้อความหลัก คอนทราสต์สูง)
- `--ink-secondary`: `#575049` (Warm Charcoal — คำอธิบายและข้อความรอง)
- `--ink-muted`: `#8A8177` (Muted Stone — เวลา, ป้ายกำกับรอง)

### Subject & Semantic Accents (Earth & Botanical Palette)
- **Terracotta (`#C85A32` / `#FDF1EC`):** จุดเน้นหลัก, ปุ่ม Action, วิชาคณิตศาสตร์/แคลคูลัส
- **Botanical Sage (`#3D6B52` / `#EEF5F0`):** สถานะสำเร็จ, วิชาชีววิทยา/วิทยาศาสตร์
- **Warm Ochre (`#C27D1A` / `#FDF6EA`):** งานเร่งด่วนปานกลาง, วิชาประวัติศาสตร์/สังคม
- **Slate Indigo (`#3B5978` / `#EEF3F8`):** วิชาฟิสิกส์/คอมพิวเตอร์
- **Deep Plum (`#7A496B` / `#F7EFF5`):** วิชาภาษาต่างประเทศ/วรรณกรรม
- **Academic Crimson (`#B83B2A` / `#FCEEEB`):** งานสำคัญสูง (High Priority) / สอบใกล้ถึง

