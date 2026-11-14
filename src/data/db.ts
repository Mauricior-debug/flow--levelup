import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_uri TEXT,
  apple_sub TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_apple_unique ON users(apple_sub) WHERE apple_sub IS NOT NULL;
CREATE TABLE IF NOT EXISTS secrets (
  user_id TEXT PRIMARY KEY,
  salt TEXT NOT NULL,
  hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS onboarding (
  user_id TEXT PRIMARY KEY,
  step TEXT NOT NULL,
  categories_json TEXT NOT NULL,
  routine TEXT,
  consistency TEXT,
  challenge TEXT,
  change_wish TEXT,
  daily_minutes INTEGER,
  motivation TEXT,
  intention TEXT,
  completed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  day TEXT NOT NULL,
  challenge_day INTEGER,
  slot TEXT NOT NULL,
  status TEXT NOT NULL,
  completed_at TEXT,
  origin TEXT NOT NULL DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_value REAL NOT NULL,
  current_value REAL NOT NULL,
  unit TEXT NOT NULL,
  deadline TEXT,
  horizon TEXT NOT NULL,
  status TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_id TEXT,
  title TEXT NOT NULL,
  cadence TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS habit_logs_once ON habit_logs(habit_id, day);
CREATE TABLE IF NOT EXISTS xp_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  created_at TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS achievements (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  unlocked_at TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS loop_state (
  user_id TEXT PRIMARY KEY,
  bond_xp INTEGER NOT NULL,
  skin TEXT NOT NULL,
  accessory TEXT NOT NULL,
  environment TEXT NOT NULL,
  skill TEXT NOT NULL,
  mood TEXT NOT NULL,
  mood_until TEXT,
  chat_bond_day TEXT,
  chat_bond_today INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  notifications_enabled INTEGER NOT NULL,
  reminder_hour INTEGER NOT NULL,
  reminder_minute INTEGER NOT NULL,
  share_progress INTEGER NOT NULL,
  streak_count INTEGER NOT NULL,
  streak_last_day TEXT,
  best_streak INTEGER NOT NULL,
  recovery_week TEXT,
  recovery_armed INTEGER NOT NULL,
  comeback_unlocked INTEGER NOT NULL,
  last_open_day TEXT
);
`;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('levelup.db');
      await db.execAsync(SCHEMA);
      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

export function resetDbForTests(): void {
  dbPromise = null;
}
