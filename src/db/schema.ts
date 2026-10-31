import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

/**
 * ตัวอย่าง Schema เริ่มต้นสำหรับ Supabase / PostgreSQL ผ่าน Drizzle ORM
 * คุณสามารถเพิ่ม/แก้ไขตารางข้อมูลได้ตามฟีเจอร์ของเว็บที่ต้องการสร้างในภายหลัง
 */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
