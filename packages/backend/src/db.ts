import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InquiryInput } from './schemas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// node-sqlite3-wasm ships as an Emscripten CommonJS module whose bundled
// type declarations are an ambient module with non-exported members, so we
// load it via createRequire and describe the slice of the API we use here.
const require = createRequire(import.meta.url);

interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}
type Row = Record<string, unknown>;
interface SqliteDb {
  exec(sql: string): void;
  run(sql: string, values?: unknown[]): RunResult;
  get(sql: string, values?: unknown[]): Row | null;
  all(sql: string, values?: unknown[]): Row[];
  close(): void;
}
type DatabaseCtor = new (filename?: string) => SqliteDb;

const { Database } = require('node-sqlite3-wasm') as { Database: DatabaseCtor };

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  deviceType: string;
  message: string;
  createdAt: string;
}

const dbFileEnv = process.env.DATABASE_FILE || './data/inquiries.db';
const isMemory = dbFileEnv === ':memory:';

const dbFile = isMemory ? ':memory:' : resolve(__dirname, '..', dbFileEnv);

// Ensure the data directory exists before opening the file (skip for :memory:).
if (!isMemory) {
  mkdirSync(dirname(dbFile), { recursive: true });
}

const db: SqliteDb = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT,
    device_type TEXT NOT NULL,
    message     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const SELECT_COLUMNS = `
  id, name, phone, email, device_type AS deviceType, message, created_at AS createdAt
`;

export function createInquiry(data: InquiryInput): Inquiry {
  const info = db.run(
    `INSERT INTO inquiries (name, phone, email, device_type, message)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.phone, data.email || null, data.deviceType, data.message],
  );
  return getInquiry(Number(info.lastInsertRowid))!;
}

export function getInquiry(id: number): Inquiry | undefined {
  const row = db.get(
    `SELECT ${SELECT_COLUMNS} FROM inquiries WHERE id = ?`,
    [id],
  );
  return (row as Inquiry | null) ?? undefined;
}

export function listInquiries(
  { limit = 100, offset = 0 }: { limit?: number; offset?: number } = {},
): Inquiry[] {
  const rows = db.all(
    `SELECT ${SELECT_COLUMNS} FROM inquiries ORDER BY id DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows as unknown as Inquiry[];
}

/** Test helper: wipe all rows and reset the autoincrement counter. */
export function clearInquiries(): void {
  db.exec('DELETE FROM inquiries;');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'inquiries';");
}

export default db;
