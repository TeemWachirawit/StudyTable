import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL?.trim();

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

const client = connectionString
  ? (globalForDb.conn ??
    postgres(connectionString, {
      prepare: false,
      connect_timeout: 10,
    }))
  : null;

if (process.env.NODE_ENV !== "production" && client) {
  globalForDb.conn = client;
}

export const db = client ? drizzle(client, { schema }) : null;

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString && db);
}
