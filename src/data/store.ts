import { achievementByKey, earnedAchievementKeys, type AchievementStats } from '../engine/achievements';
import { replyTo } from '../engine/chat';
import { daysBetween, isoWeekKey, todayKey } from '../engine/dates';
import { createId } from '../engine/ids';
import { accessoryUnlocked, environmentUnlocked, lookUnlocked, moodAfterWin, moodOnOpen, skillUnlocked } from '../engine/loop';
import { generatePlan, planDates, rollingMissions } from '../engine/plan';
import { bondForChat, bondForDifficulty, bondLevel, BOND_ACHIEVEMENT, BOND_STREAK, levelFromTotal, sumXp, xpFor, xpForGoal, XP } from '../engine/progression';
import { streakAfterCompletion } from '../engine/streak';
import type {
  AccessoryId,
  Bundle,
  CategoryId,
  ChatMessage,
  CompletionResult,
  EnvironmentId,
  Goal,
  Habit,
  HabitLog,
  Horizon,
  LookId,
  LoopState,
  Mission,
  Notice,
  Onboarding,
  Settings,
  SkillId,
  StepId,
  UnlockedAchievement,
  User,
  XpTransaction,
} from '../engine/types';
import { CATEGORY_IDS } from '../engine/types';
import { getDb } from './db';
import { deleteSecret, hashPassword, makeSecret, readSecret, sameSecret, saveSecret, validEmail } from './secret';

let chain: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function nowIso(): string {
  return new Date().toISOString();
}

function bool(value: number | null | undefined): boolean {
  return value === 1;
}

async function metaGet(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

async function metaSet(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}

export async function initDb(): Promise<void> {
  await getDb();
}

export async function hasRealAccount(): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM users WHERE is_anonymous = 0');
  return (row?.n ?? 0) > 0;
}

async function readUser(id: string): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    email: string | null;
    avatar_uri: string | null;
    apple_sub: string | null;
    is_anonymous: number;
    created_at: string;
  }>('SELECT * FROM users WHERE id = ?', id);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUri: row.avatar_uri,
    appleSub: row.apple_sub,
    isAnonymous: bool(row.is_anonymous),
    createdAt: row.created_at,
  };
}

async function readOnboarding(userId: string): Promise<Onboarding> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    step: StepId;
    categories_json: string;
    routine: string | null;
    consistency: string | null;
    challenge: string | null;
    change_wish: string | null;
    daily_minutes: number | null;
    motivation: string | null;
    intention: string | null;
    completed: number;
  }>('SELECT * FROM onboarding WHERE user_id = ?', userId);
  if (!row) {
    return {
      step: 'welcome',
      categories: [],
      routine: null,
      consistency: null,
      challenge: null,
      changeWish: null,
      dailyMinutes: null,
      motivation: null,
      intention: null,
      completed: false,
    };
  }
  const parsed = JSON.parse(row.categories_json) as CategoryId[];
  const minutes = row.daily_minutes;
  return {
    step: row.step,
    categories: parsed.filter((id) => CATEGORY_IDS.includes(id)),
    routine: row.routine,
    consistency: row.consistency,
    challenge: row.challenge,
    changeWish: row.change_wish,
    dailyMinutes: minutes === 5 || minutes === 10 || minutes === 20 || minutes === 30 ? minutes : null,
    motivation: row.motivation,
    intention: row.intention,
    completed: bool(row.completed),
  };
}

async function readBundle(userId: string): Promise<Bundle> {
  const db = await getDb();
  const user = await readUser(userId);
  if (!user) throw new Error('That profile is no longer on this device.');
  const onboarding = await readOnboarding(userId);
  const missions = (await db.getAllAsync<{
    id: string;
    title: string;
    description: string;
    category: CategoryId;
    duration_minutes: number;
    difficulty: Mission['difficulty'];
    day: string;
    challenge_day: number | null;
    slot: Mission['slot'];
    status: Mission['status'];
    completed_at: string | null;
    origin: Mission['origin'];
  }>('SELECT * FROM missions WHERE user_id = ? ORDER BY day, title', userId)).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    day: row.day,
    challengeDay: row.challenge_day,
    slot: row.slot,
    status: row.status,
    completedAt: row.completed_at,
    origin: row.origin,
  }));
  const goals = (await db.getAllAsync<{
    id: string;
    title: string;
    description: string;
    category: CategoryId;
    target_value: number;
    current_value: number;
    unit: string;
    deadline: string | null;
    horizon: Horizon;
    status: Goal['status'];
    origin: Goal['origin'];
    created_at: string;
  }>('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', userId)).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    deadline: row.deadline,
    horizon: row.horizon,
    status: row.status,
    origin: row.origin,
    createdAt: row.created_at,
  }));
  const habits = (await db.getAllAsync<{
    id: string;
    goal_id: string | null;
    title: string;
    cadence: Habit['cadence'];
    origin: Habit['origin'];
    created_at: string;
  }>('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', userId)).map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    cadence: row.cadence,
    origin: row.origin,
    createdAt: row.created_at,
  }));
  const habitLogs = (await db.getAllAsync<{ id: string; habit_id: string; day: string; created_at: string }>(
    'SELECT * FROM habit_logs WHERE user_id = ?',
    userId,
  )).map((row) => ({ id: row.id, habitId: row.habit_id, day: row.day, createdAt: row.created_at }));
  const transactions = (await db.getAllAsync<{
    id: string;
    amount: number;
    reason: string;
    source_type: XpTransaction['sourceType'];
    source_id: string | null;
    created_at: string;
    origin: XpTransaction['origin'];
  }>('SELECT * FROM xp_transactions WHERE user_id = ? ORDER BY created_at', userId)).map((row) => ({
    id: row.id,
    amount: row.amount,
    reason: row.reason,
    sourceType: row.source_type,
    sourceId: row.source_id,
    createdAt: row.created_at,
    origin: row.origin,
  }));
  const achievements = (await db.getAllAsync<{ key: string; unlocked_at: string }>(
    'SELECT key, unlocked_at FROM achievements WHERE user_id = ?',
    userId,
  )).map((row) => ({ key: row.key, unlockedAt: row.unlocked_at }));
  const messages = (await db.getAllAsync<{ id: string; role: ChatMessage['role']; text: string; created_at: string }>(
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at',
    userId,
  )).map((row) => ({ id: row.id, role: row.role, text: row.text, createdAt: row.created_at }));
  const notices = (await db.getAllAsync<{ id: string; title: string; body: string; read: number; created_at: string }>(
    'SELECT * FROM notices WHERE user_id = ? ORDER BY created_at DESC',
    userId,
  )).map((row) => ({ id: row.id, title: row.title, body: row.body, read: bool(row.read), createdAt: row.created_at }));
  const loopRow = await db.getFirstAsync<{
    bond_xp: number;
    skin: LookId;
    accessory: AccessoryId;
    environment: EnvironmentId;
    skill: SkillId;
    mood: LoopState['mood'];
    mood_until: string | null;
    chat_bond_day: string | null;
    chat_bond_today: number;
  }>('SELECT * FROM loop_state WHERE user_id = ?', userId);
  const settingsRow = await db.getFirstAsync<{
    theme: Settings['theme'];
    notifications_enabled: number;
    reminder_hour: number;
    reminder_minute: number;
    share_progress: number;
    streak_count: number;
    streak_last_day: string | null;
    best_streak: number;
    recovery_week: string | null;
    recovery_armed: number;
    comeback_unlocked: number;
    last_open_day: string | null;
  }>('SELECT * FROM settings WHERE user_id = ?', userId);
  return {
    user,
    onboarding,
    missions,
    goals,
    habits,
    habitLogs,
    transactions,
    achievements,
    messages,
    notices,
    loop: {
      bondXp: loopRow?.bond_xp ?? 0,
      skin: loopRow?.skin ?? 'classic',
      accessory: loopRow?.accessory ?? 'none',
      environment: loopRow?.environment ?? 'island',
      skill: loopRow?.skill ?? 'steady',
      mood: loopRow?.mood ?? 'idle',
      moodUntil: loopRow?.mood_until ?? null,
      chatBondDay: loopRow?.chat_bond_day ?? null,
      chatBondToday: loopRow?.chat_bond_today ?? 0,
    },
    settings: {
      theme: settingsRow?.theme ?? 'dark',
      notificationsEnabled: bool(settingsRow?.notifications_enabled),
      reminderHour: settingsRow?.reminder_hour ?? 8,
      reminderMinute: settingsRow?.reminder_minute ?? 0,
      shareProgress: settingsRow ? bool(settingsRow.share_progress) : true,
      streakCount: settingsRow?.streak_count ?? 0,
      streakLastDay: settingsRow?.streak_last_day ?? null,
      bestStreak: settingsRow?.best_streak ?? 0,
      recoveryWeek: settingsRow?.recovery_week ?? null,
      recoveryArmed: bool(settingsRow?.recovery_armed),
      comebackUnlocked: bool(settingsRow?.comeback_unlocked),
      lastOpenDay: settingsRow?.last_open_day ?? null,
    },
  };
}

async function insertUserShell(id: string, name: string): Promise<void> {
  const db = await getDb();
  const created = nowIso();
  await db.runAsync('INSERT INTO users (id, name, email, avatar_uri, apple_sub, is_anonymous, created_at) VALUES (?, ?, NULL, NULL, NULL, 1, ?)', id, name, created);
  await db.runAsync(
    `INSERT INTO onboarding (user_id, step, categories_json, completed) VALUES (?, 'welcome', '[]', 0)`,
    id,
  );
  await db.runAsync(
    `INSERT INTO loop_state (user_id, bond_xp, skin, accessory, environment, skill, mood, chat_bond_today) VALUES (?, 0, 'classic', 'none', 'island', 'steady', 'idle', 0)`,
    id,
  );
  await db.runAsync(
    `INSERT INTO settings (user_id, theme, notifications_enabled, reminder_hour, reminder_minute, share_progress, streak_count, best_streak, recovery_armed, comeback_unlocked)
     VALUES (?, 'dark', 0, 8, 0, 1, 0, 0, 0, 0)`,
    id,
  );
}

async function achievementStats(userId: string, level: number): Promise<AchievementStats> {
  const db = await getDb();
  const missions = await db.getAllAsync<{ category: CategoryId; difficulty: string }>(
    `SELECT category, difficulty FROM missions WHERE user_id = ? AND status = 'complete' AND origin = 'user'`,
    userId,
  );
  const byCategory: AchievementStats['byCategory'] = { fitness: 0, mindset: 0, money: 0, business: 0, learning: 0, lifestyle: 0 };
  missions.forEach((mission) => {
    byCategory[mission.category] += 1;
  });
  const streak = await db.getFirstAsync<{ streak_count: number }>('SELECT streak_count FROM settings WHERE user_id = ?', userId);
  return {
    missionCount: missions.length,
    streak: streak?.streak_count ?? 0,
    weeklyCompletions: missions.filter((mission) => mission.difficulty === 'weekly').length,
    byCategory,
    level,
  };
}

async function addNotice(userId: string, title: string, body: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO notices (id, user_id, title, body, read, created_at) VALUES (?, ?, ?, ?, 0, ?)', createId(), userId, title, body, nowIso());
}

async function grantXp(userId: string, amount: number, reason: string, sourceType: XpTransaction['sourceType'], sourceId: string | null): Promise<{
  unlocked: { key: string; title: string; group: string }[];
  level: number;
  previousLevel: number;
  leveledUp: boolean;
  total: number;
}> {
  const db = await getDb();
  const beforeRows = await db.getAllAsync<{ amount: number; origin: XpTransaction['origin'] }>(
    `SELECT amount, origin FROM xp_transactions WHERE user_id = ?`,
    userId,
  );
  const previousLevel = levelFromTotal(sumXp(beforeRows)).level;
  await db.runAsync(
    `INSERT INTO xp_transactions (id, user_id, amount, reason, source_type, source_id, created_at, origin) VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
    createId(),
    userId,
    amount,
    reason,
    sourceType,
    sourceId,
    nowIso(),
  );
  const unlocked: { key: string; title: string; group: string }[] = [];
  let guard = 0;
  while (guard < 4) {
    guard += 1;
    const rows = await db.getAllAsync<{ amount: number; origin: XpTransaction['origin'] }>(
      `SELECT amount, origin FROM xp_transactions WHERE user_id = ?`,
      userId,
    );
    const total = sumXp(rows);
    const level = levelFromTotal(total).level;
    const stats = await achievementStats(userId, level);
    const owned = new Set((await db.getAllAsync<{ key: string }>('SELECT key FROM achievements WHERE user_id = ?', userId)).map((row) => row.key));
    const fresh = earnedAchievementKeys(stats).filter((key) => !owned.has(key));
    if (!fresh.length) break;
    for (const key of fresh) {
      const def = achievementByKey(key);
      if (!def) continue;
      await db.runAsync('INSERT INTO achievements (user_id, key, unlocked_at) VALUES (?, ?, ?)', userId, key, nowIso());
      unlocked.push({ key, title: def.title, group: def.group });
      await addNotice(userId, def.title, def.detail);
      if (def.major) {
        await db.runAsync(
          `INSERT INTO xp_transactions (id, user_id, amount, reason, source_type, source_id, created_at, origin) VALUES (?, ?, ?, ?, 'achievement', ?, ?, 'user')`,
          createId(),
          userId,
          XP.major,
          `Major achievement: ${def.title}`,
          key,
          nowIso(),
        );
      }
    }
  }
  const finalRows = await db.getAllAsync<{ amount: number; origin: XpTransaction['origin'] }>(
    `SELECT amount, origin FROM xp_transactions WHERE user_id = ?`,
    userId,
  );
  const total = sumXp(finalRows);
  const level = levelFromTotal(total).level;
  return { unlocked, level, previousLevel, leveledUp: level > previousLevel, total };
}

async function setMood(userId: string, mood: LoopState['mood'], hours: number): Promise<void> {
  const db = await getDb();
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  await db.runAsync('UPDATE loop_state SET mood = ?, mood_until = ? WHERE user_id = ?', mood, until, userId);
}

async function addBond(userId: string, amount: number): Promise<number> {
  if (amount <= 0) {
    const db = await getDb();
    const row = await db.getFirstAsync<{ bond_xp: number }>('SELECT bond_xp FROM loop_state WHERE user_id = ?', userId);
    return row?.bond_xp ?? 0;
  }
  const db = await getDb();
  await db.runAsync('UPDATE loop_state SET bond_xp = bond_xp + ? WHERE user_id = ?', amount, userId);
  const row = await db.getFirstAsync<{ bond_xp: number }>('SELECT bond_xp FROM loop_state WHERE user_id = ?', userId);
  return row?.bond_xp ?? 0;
}

export async function loadSession(): Promise<Bundle | null> {
  return enqueue(async () => {
    const session = await metaGet('session_user_id');
    if (!session) return null;
    const user = await readUser(session);
    if (!user) {
      await metaSet('session_user_id', '');
      return null;
    }
    await settleOpen(session);
    return readBundle(session);
  });
}

async function settleOpen(userId: string): Promise<void> {
  const db = await getDb();
  const onboarding = await readOnboarding(userId);
  const today = todayKey();
  if (onboarding.completed) {
    const todayCount = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM missions WHERE user_id = ? AND day = ? AND origin = 'user'`, userId, today);
    const later = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM missions WHERE user_id = ? AND day > ? AND origin = 'user'`, userId, today);
    if ((todayCount?.n ?? 0) === 0 && (later?.n ?? 0) === 0) {
      const existing = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM missions WHERE user_id = ?`, userId);
      const goal = await db.getFirstAsync<{ title: string }>(`SELECT title FROM goals WHERE user_id = ? AND status = 'active' AND origin = 'user' ORDER BY created_at LIMIT 1`, userId);
      const drafts = rollingMissions(onboarding, existing?.n ?? 0);
      for (const draft of drafts) {
        const description = goal ? `${draft.description} This supports your goal: ${goal.title}.` : draft.description;
        await db.runAsync(
          `INSERT INTO missions (id, user_id, title, description, category, duration_minutes, difficulty, day, challenge_day, slot, status, origin)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'open', 'user')`,
          createId(),
          userId,
          draft.title,
          description,
          draft.category,
          draft.durationMinutes,
          draft.difficulty,
          today,
          draft.slot,
        );
      }
    }
  }
  const settings = await db.getFirstAsync<{ last_open_day: string | null; mood: string }>(
    `SELECT settings.last_open_day AS last_open_day, loop_state.mood AS mood FROM settings JOIN loop_state ON loop_state.user_id = settings.user_id WHERE settings.user_id = ?`,
    userId,
  );
  const lastCompletion = await db.getFirstAsync<{ completed_at: string | null }>(
    `SELECT completed_at FROM missions WHERE user_id = ? AND status = 'complete' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1`,
    userId,
  );
  const loop = (await readBundle(userId)).loop;
  const mood = moodOnOpen({
    now: new Date(),
    today,
    lastCompletionAt: lastCompletion?.completed_at ?? null,
    lastOpenDay: settings?.last_open_day ?? null,
    loop,
  });
  const returning = settings?.last_open_day ? daysBetween(settings.last_open_day, today) >= 3 : false;
  if (returning) await setMood(userId, 'welcoming', 12);
  else await db.runAsync('UPDATE loop_state SET mood = ? WHERE user_id = ? AND (mood_until IS NULL OR mood_until < ?)', mood, userId, nowIso());
  await db.runAsync('UPDATE settings SET last_open_day = ? WHERE user_id = ?', today, userId);
}

export async function startJourney(): Promise<Bundle> {
  return enqueue(async () => {
    const existing = await metaGet('session_user_id');
    if (existing) {
      const user = await readUser(existing);
      if (user) return readBundle(existing);
    }
    const id = createId();
    await insertUserShell(id, 'Friend');
    await metaSet('session_user_id', id);
    return readBundle(id);
  });
}

export async function saveOnboarding(userId: string, patch: Partial<Onboarding>): Promise<Bundle> {
  return enqueue(async () => {
    const current = await readOnboarding(userId);
    const next = { ...current, ...patch };
    const db = await getDb();
    await db.runAsync(
      `UPDATE onboarding SET step = ?, categories_json = ?, routine = ?, consistency = ?, challenge = ?, change_wish = ?, daily_minutes = ?, motivation = ?, intention = ?, completed = ? WHERE user_id = ?`,
      next.step,
      JSON.stringify(next.categories),
      next.routine,
      next.consistency,
      next.challenge,
      next.changeWish,
      next.dailyMinutes,
      next.motivation,
      next.intention,
      next.completed ? 1 : 0,
      userId,
    );
    return readBundle(userId);
  });
}

export async function buildPlan(userId: string): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    const done = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM missions WHERE user_id = ? AND status = 'complete'`, userId);
    if ((done?.n ?? 0) > 0) {
      await db.runAsync(`UPDATE onboarding SET step = 'plan' WHERE user_id = ?`, userId);
      return readBundle(userId);
    }
    const onboarding = await readOnboarding(userId);
    const dated = planDates(todayKey(), generatePlan(onboarding));
    await db.runAsync(`DELETE FROM missions WHERE user_id = ? AND origin = 'user'`, userId);
    for (const draft of dated) {
      await db.runAsync(
        `INSERT INTO missions (id, user_id, title, description, category, duration_minutes, difficulty, day, challenge_day, slot, status, origin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 'user')`,
        createId(),
        userId,
        draft.title,
        draft.description,
        draft.category,
        draft.durationMinutes,
        draft.difficulty,
        draft.day,
        draft.challengeDay,
        draft.slot,
      );
    }
    await db.runAsync(`UPDATE onboarding SET step = 'plan' WHERE user_id = ?`, userId);
    return readBundle(userId);
  });
}

async function finishProgress(userId: string, input: {
  amount: number;
  reason: string;
  sourceType: XpTransaction['sourceType'];
  sourceId: string | null;
  bond: number;
  weekly: boolean;
  streak: boolean;
  gapBefore: number;
  firstOfDay: boolean;
}): Promise<CompletionResult> {
  const db = await getDb();
  let streakCount = 0;
  if (input.streak) {
    const settings = await db.getFirstAsync<{
      streak_count: number;
      streak_last_day: string | null;
      best_streak: number;
      recovery_week: string | null;
      recovery_armed: number;
    }>('SELECT streak_count, streak_last_day, best_streak, recovery_week, recovery_armed FROM settings WHERE user_id = ?', userId);
    const next = streakAfterCompletion(
      {
        count: settings?.streak_count ?? 0,
        lastDay: settings?.streak_last_day ?? null,
        best: settings?.best_streak ?? 0,
        recoveryWeek: settings?.recovery_week ?? null,
        recoveryArmed: bool(settings?.recovery_armed),
      },
      todayKey(),
    );
    streakCount = next.count;
    const comeback = input.gapBefore >= 2 ? 1 : 0;
    await db.runAsync(
      `UPDATE settings SET streak_count = ?, streak_last_day = ?, best_streak = ?, recovery_week = ?, recovery_armed = ?, comeback_unlocked = CASE WHEN ? = 1 THEN 1 ELSE comeback_unlocked END WHERE user_id = ?`,
      next.count,
      next.lastDay,
      next.best,
      next.recoveryWeek,
      next.recoveryArmed ? 1 : 0,
      comeback,
      userId,
    );
  } else {
    const settings = await db.getFirstAsync<{ streak_count: number }>('SELECT streak_count FROM settings WHERE user_id = ?', userId);
    streakCount = settings?.streak_count ?? 0;
  }
  const granted = await grantXp(userId, input.amount, input.reason, input.sourceType, input.sourceId);
  let bond = input.bond;
  if (input.streak && input.firstOfDay) bond += BOND_STREAK;
  bond += granted.unlocked.length * BOND_ACHIEVEMENT;
  const bondXp = await addBond(userId, bond);
  const mood = moodAfterWin({ leveledUp: granted.leveledUp, weekly: input.weekly });
  await setMood(userId, mood.mood, mood.hours);
  if (granted.leveledUp) await addNotice(userId, `Level ${granted.level}`, 'You reached a new level. Loop felt that.');
  return {
    already: false,
    xp: input.amount,
    level: granted.level,
    leveledUp: granted.leveledUp,
    previousLevel: granted.previousLevel,
    unlocked: granted.unlocked,
    streak: streakCount,
    bondXp,
    bondLevel: bondLevel(bondXp).level,
  };
}

export async function completeMission(userId: string, missionId: string): Promise<{ bundle: Bundle; result: CompletionResult }> {
  return enqueue(async () => {
    const db = await getDb();
    const mission = await db.getFirstAsync<{
      id: string;
      title: string;
      difficulty: Mission['difficulty'];
      status: string;
      origin: string;
      day: string;
    }>('SELECT id, title, difficulty, status, origin, day FROM missions WHERE id = ? AND user_id = ?', missionId, userId);
    if (!mission || mission.origin !== 'user') throw new Error('That mission is not on this device.');
    if (mission.status === 'complete') {
      const bundle = await readBundle(userId);
      const level = levelFromTotal(sumXp(bundle.transactions)).level;
      return {
        bundle,
        result: {
          already: true,
          xp: 0,
          level,
          leveledUp: false,
          previousLevel: level,
          unlocked: [],
          streak: bundle.settings.streakCount,
          bondXp: bundle.loop.bondXp,
          bondLevel: bondLevel(bundle.loop.bondXp).level,
        },
      };
    }
    const settings = await db.getFirstAsync<{ streak_last_day: string | null }>('SELECT streak_last_day FROM settings WHERE user_id = ?', userId);
    const gapBefore = settings?.streak_last_day ? daysBetween(settings.streak_last_day, todayKey()) : 0;
    const firstOfDay = settings?.streak_last_day !== todayKey();
    await db.runAsync(`UPDATE missions SET status = 'complete', completed_at = ? WHERE id = ?`, nowIso(), missionId);
    const amount = xpFor(mission.difficulty);
    const result = await finishProgress(userId, {
      amount,
      reason: `Completed a mission: ${mission.title}`,
      sourceType: 'mission',
      sourceId: mission.id,
      bond: bondForDifficulty(mission.difficulty),
      weekly: mission.difficulty === 'weekly',
      streak: true,
      gapBefore,
      firstOfDay,
    });
    return { bundle: await readBundle(userId), result };
  });
}

export async function createAccount(userId: string, input: { name: string; email: string; password: string }): Promise<Bundle> {
  return enqueue(async () => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 1) throw new Error('Enter a name.');
    if (!validEmail(email)) throw new Error('Enter a valid email.');
    if (input.password.length < 8) throw new Error('Use at least 8 characters.');
    const db = await getDb();
    const taken = await db.getFirstAsync<{ id: string }>('SELECT id FROM users WHERE email = ? AND id != ?', email, userId);
    if (taken) throw new Error('An account with that email is already on this device.');
    const secret = await makeSecret(input.password);
    await db.runAsync('INSERT INTO secrets (user_id, salt, hash) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET salt = excluded.salt, hash = excluded.hash', userId, secret.salt, secret.hash);
    await saveSecret(userId, secret.salt, secret.hash);
    await db.runAsync('UPDATE users SET name = ?, email = ?, is_anonymous = 0 WHERE id = ?', name, email, userId);
    await db.runAsync(`UPDATE onboarding SET completed = 1, step = 'done' WHERE user_id = ?`, userId);
    await metaSet('session_user_id', userId);
    await settleOpen(userId);
    return readBundle(userId);
  });
}

export async function signInWithApple(userId: string | null, input: { appleSub: string; email: string | null; name: string | null }): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM users WHERE apple_sub = ?', input.appleSub);
    if (existing) {
      await metaSet('session_user_id', existing.id);
      await settleOpen(existing.id);
      return readBundle(existing.id);
    }
    if (userId) {
      const name = input.name?.trim() || (await readUser(userId))?.name || 'Friend';
      await db.runAsync('UPDATE users SET apple_sub = ?, email = COALESCE(?, email), name = ?, is_anonymous = 0 WHERE id = ?', input.appleSub, input.email, name, userId);
      await db.runAsync(`UPDATE onboarding SET completed = 1, step = 'done' WHERE user_id = ?`, userId);
      await metaSet('session_user_id', userId);
      await settleOpen(userId);
      return readBundle(userId);
    }
    throw new Error('No LEVELUP journey is saved for this Apple ID on this device.');
  });
}

export async function signIn(emailRaw: string, password: string): Promise<Bundle> {
  return enqueue(async () => {
    const email = emailRaw.trim().toLowerCase();
    const db = await getDb();
    const user = await db.getFirstAsync<{ id: string }>('SELECT id FROM users WHERE email = ?', email);
    if (!user) throw new Error('That email and password don’t match.');
    const secure = await readSecret(user.id);
    const stored = secure ?? (await db.getFirstAsync<{ salt: string; hash: string }>('SELECT salt, hash FROM secrets WHERE user_id = ?', user.id));
    if (!stored) throw new Error('That email and password don’t match.');
    const hash = await hashPassword(password, stored.salt);
    if (!sameSecret(hash, stored.hash)) throw new Error('That email and password don’t match.');
    await metaSet('session_user_id', user.id);
    await settleOpen(user.id);
    return readBundle(user.id);
  });
}

export async function signOut(): Promise<void> {
  return enqueue(async () => {
    await metaSet('session_user_id', '');
  });
}

export async function deleteAccount(userId: string): Promise<void> {
  return enqueue(async () => {
    const db = await getDb();
    const tables = ['missions', 'goals', 'habits', 'habit_logs', 'xp_transactions', 'achievements', 'messages', 'notices', 'loop_state', 'settings', 'onboarding', 'secrets'];
    for (const table of tables) {
      await db.runAsync(`DELETE FROM ${table} WHERE user_id = ?`, userId);
    }
    await db.runAsync('DELETE FROM users WHERE id = ?', userId);
    await deleteSecret(userId);
    const session = await metaGet('session_user_id');
    if (session === userId) await metaSet('session_user_id', '');
  });
}

export async function updateProfile(userId: string, patch: { name?: string; avatarUri?: string | null }): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new Error('Enter a name.');
      await db.runAsync('UPDATE users SET name = ? WHERE id = ?', name, userId);
    }
    if (patch.avatarUri !== undefined) await db.runAsync('UPDATE users SET avatar_uri = ? WHERE id = ?', patch.avatarUri, userId);
    return readBundle(userId);
  });
}

export async function changePassword(userId: string, current: string, next: string): Promise<void> {
  return enqueue(async () => {
    if (next.length < 8) throw new Error('Use at least 8 characters.');
    const db = await getDb();
    const secure = await readSecret(userId);
    const stored = secure ?? (await db.getFirstAsync<{ salt: string; hash: string }>('SELECT salt, hash FROM secrets WHERE user_id = ?', userId));
    if (!stored) throw new Error('This account uses Apple and has no password on this device.');
    const hash = await hashPassword(current, stored.salt);
    if (!sameSecret(hash, stored.hash)) throw new Error('The current password doesn’t match.');
    const secret = await makeSecret(next);
    await db.runAsync('UPDATE secrets SET salt = ?, hash = ? WHERE user_id = ?', secret.salt, secret.hash, userId);
    await saveSecret(userId, secret.salt, secret.hash);
  });
}

export async function updateSettings(userId: string, patch: Partial<Settings>): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    const current = (await readBundle(userId)).settings;
    const next = { ...current, ...patch };
    await db.runAsync(
      `UPDATE settings SET theme = ?, notifications_enabled = ?, reminder_hour = ?, reminder_minute = ?, share_progress = ?, recovery_armed = ? WHERE user_id = ?`,
      next.theme,
      next.notificationsEnabled ? 1 : 0,
      next.reminderHour,
      next.reminderMinute,
      next.shareProgress ? 1 : 0,
      next.recoveryArmed ? 1 : 0,
      userId,
    );
    return readBundle(userId);
  });
}

export async function equipLoop(userId: string, patch: Partial<Pick<LoopState, 'skin' | 'accessory' | 'environment' | 'skill'>>): Promise<{ bundle: Bundle; error: string | null }> {
  return enqueue(async () => {
    const bundle = await readBundle(userId);
    const level = levelFromTotal(sumXp(bundle.transactions)).level;
    const weeklyDone = bundle.missions.some((mission) => mission.origin === 'user' && mission.status === 'complete' && mission.difficulty === 'weekly');
    const missionCount = bundle.missions.filter((mission) => mission.origin === 'user' && mission.status === 'complete').length;
    if (patch.skin && !lookUnlocked(patch.skin, bundle.loop.bondXp, level)) {
      return { bundle, error: 'That look opens as your bond and level grow.' };
    }
    if (patch.accessory && !accessoryUnlocked(patch.accessory, bundle.loop.bondXp, level, weeklyDone)) {
      return { bundle, error: 'That item is still locked.' };
    }
    if (patch.environment && !environmentUnlocked(patch.environment, bundle.loop.bondXp, level)) {
      return { bundle, error: 'That place opens later.' };
    }
    if (patch.skill && !skillUnlocked(patch.skill, { missionCount, level, comeback: bundle.settings.comebackUnlocked })) {
      return { bundle, error: 'That skill is still locked.' };
    }
    const db = await getDb();
    const next = { ...bundle.loop, ...patch };
    await db.runAsync(
      'UPDATE loop_state SET skin = ?, accessory = ?, environment = ?, skill = ? WHERE user_id = ?',
      next.skin,
      next.accessory,
      next.environment,
      next.skill,
      userId,
    );
    return { bundle: await readBundle(userId), error: null };
  });
}

export async function createGoal(userId: string, input: {
  title: string;
  description: string;
  category: CategoryId;
  targetValue: number;
  unit: string;
  deadline: string | null;
  horizon: Horizon;
}): Promise<Bundle> {
  return enqueue(async () => {
    const title = input.title.trim();
    if (!title) throw new Error('Give the goal a title.');
    if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) throw new Error('Set a target above zero.');
    const db = await getDb();
    const id = createId();
    await db.runAsync(
      `INSERT INTO goals (id, user_id, title, description, category, target_value, current_value, unit, deadline, horizon, status, origin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'active', 'user', ?)`,
      id,
      userId,
      title,
      input.description.trim(),
      input.category,
      input.targetValue,
      input.unit.trim() || 'check-ins',
      input.deadline,
      input.horizon,
      nowIso(),
    );
    if (input.horizon === 'daily' || input.horizon === 'weekly') {
      await db.runAsync(
        `INSERT INTO habits (id, user_id, goal_id, title, cadence, origin, created_at) VALUES (?, ?, ?, ?, ?, 'user', ?)`,
        createId(),
        userId,
        id,
        title,
        input.horizon === 'weekly' ? 'weekly' : 'daily',
        nowIso(),
      );
    }
    return readBundle(userId);
  });
}

export async function updateGoalProgress(userId: string, goalId: string, value: number): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    const goal = await db.getFirstAsync<{ target_value: number; status: string }>('SELECT target_value, status FROM goals WHERE id = ? AND user_id = ? AND origin = \'user\'', goalId, userId);
    if (!goal) throw new Error('That goal is not on this device.');
    if (goal.status === 'complete') return readBundle(userId);
    const next = Math.max(0, Math.min(goal.target_value, value));
    await db.runAsync('UPDATE goals SET current_value = ? WHERE id = ?', next, goalId);
    return readBundle(userId);
  });
}

export async function completeGoal(userId: string, goalId: string): Promise<{ bundle: Bundle; result: CompletionResult }> {
  return enqueue(async () => {
    const db = await getDb();
    const goal = await db.getFirstAsync<{ id: string; title: string; horizon: Horizon; target_value: number; status: string }>(
      `SELECT id, title, horizon, target_value, status FROM goals WHERE id = ? AND user_id = ? AND origin = 'user'`,
      goalId,
      userId,
    );
    if (!goal) throw new Error('That goal is not on this device.');
    if (goal.status === 'complete') {
      const bundle = await readBundle(userId);
      const level = levelFromTotal(sumXp(bundle.transactions)).level;
      return { bundle, result: { already: true, xp: 0, level, leveledUp: false, previousLevel: level, unlocked: [], streak: bundle.settings.streakCount, bondXp: bundle.loop.bondXp, bondLevel: bondLevel(bundle.loop.bondXp).level } };
    }
    await db.runAsync(`UPDATE goals SET status = 'complete', current_value = ? WHERE id = ?`, goal.target_value, goalId);
    const amount = xpForGoal(goal.horizon);
    const result = await finishProgress(userId, {
      amount,
      reason: `Completed a goal: ${goal.title}`,
      sourceType: 'goal',
      sourceId: goal.id,
      bond: 25,
      weekly: false,
      streak: false,
      gapBefore: 0,
      firstOfDay: false,
    });
    return { bundle: await readBundle(userId), result };
  });
}

export async function deleteGoal(userId: string, goalId: string): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    const habits = await db.getAllAsync<{ id: string }>('SELECT id FROM habits WHERE user_id = ? AND goal_id = ?', userId, goalId);
    for (const habit of habits) await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', habit.id);
    await db.runAsync('DELETE FROM habits WHERE user_id = ? AND goal_id = ?', userId, goalId);
    await db.runAsync('DELETE FROM goals WHERE id = ? AND user_id = ?', goalId, userId);
    return readBundle(userId);
  });
}

export async function createHabit(userId: string, input: { title: string; cadence: 'daily' | 'weekly'; goalId: string | null }): Promise<Bundle> {
  return enqueue(async () => {
    const title = input.title.trim();
    if (!title) throw new Error('Name the habit.');
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO habits (id, user_id, goal_id, title, cadence, origin, created_at) VALUES (?, ?, ?, ?, ?, 'user', ?)`,
      createId(),
      userId,
      input.goalId,
      title,
      input.cadence,
      nowIso(),
    );
    return readBundle(userId);
  });
}

export async function checkHabit(userId: string, habitId: string): Promise<{ bundle: Bundle; result: CompletionResult | null }> {
  return enqueue(async () => {
    const db = await getDb();
    const habit = await db.getFirstAsync<{ id: string; title: string; goal_id: string | null; cadence: string }>(
      `SELECT id, title, goal_id, cadence FROM habits WHERE id = ? AND user_id = ? AND origin = 'user'`,
      habitId,
      userId,
    );
    if (!habit) throw new Error('That habit is not on this device.');
    const today = todayKey();
    const day = habit.cadence === 'weekly' ? isoWeekKey(today) : today;
    const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM habit_logs WHERE habit_id = ? AND day = ?', habitId, day);
    if (existing) return { bundle: await readBundle(userId), result: null };
    await db.runAsync('INSERT INTO habit_logs (id, habit_id, user_id, day, created_at) VALUES (?, ?, ?, ?, ?)', createId(), habitId, userId, day, nowIso());
    if (habit.goal_id) {
      const goal = await db.getFirstAsync<{ current_value: number; target_value: number; status: string }>('SELECT current_value, target_value, status FROM goals WHERE id = ?', habit.goal_id);
      if (goal && goal.status === 'active') {
        const next = Math.min(goal.target_value, goal.current_value + 1);
        await db.runAsync('UPDATE goals SET current_value = ? WHERE id = ?', next, habit.goal_id);
      }
    }
    const result = await finishProgress(userId, {
      amount: XP.small,
      reason: `Habit check-in: ${habit.title}`,
      sourceType: 'habit',
      sourceId: habit.id,
      bond: 8,
      weekly: false,
      streak: false,
      gapBefore: 0,
      firstOfDay: false,
    });
    return { bundle: await readBundle(userId), result };
  });
}

export async function addUserMessage(userId: string, text: string): Promise<Bundle> {
  return enqueue(async () => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Write a message first.');
    const db = await getDb();
    await db.runAsync('INSERT INTO messages (id, user_id, role, text, created_at) VALUES (?, ?, \'user\', ?, ?)', createId(), userId, trimmed.slice(0, 500), nowIso());
    return readBundle(userId);
  });
}

export async function addLoopReply(userId: string): Promise<Bundle> {
  return enqueue(async () => {
    const bundle = await readBundle(userId);
    const last = bundle.messages[bundle.messages.length - 1];
    if (!last || last.role !== 'user') return bundle;
    const level = levelFromTotal(sumXp(bundle.transactions)).level;
    const today = todayKey();
    const reply = replyTo({
      name: bundle.user.name,
      text: last.text,
      level,
      streak: bundle.settings.streakCount,
      openMissions: bundle.missions.filter((mission) => mission.status === 'open' && mission.day === today && mission.origin === 'user'),
      goals: bundle.goals,
      onboarding: bundle.onboarding,
      skill: bundle.loop.skill,
    });
    const db = await getDb();
    await db.runAsync('INSERT INTO messages (id, user_id, role, text, created_at) VALUES (?, ?, \'loop\', ?, ?)', createId(), userId, reply.text, nowIso());
    const already = bundle.loop.chatBondDay === today ? bundle.loop.chatBondToday : 0;
    const gain = bondForChat(already);
    await db.runAsync('UPDATE loop_state SET chat_bond_day = ?, chat_bond_today = ? WHERE user_id = ?', today, already + gain, userId);
    await addBond(userId, gain);
    return readBundle(userId);
  });
}

export async function markNoticesRead(userId: string): Promise<Bundle> {
  return enqueue(async () => {
    const db = await getDb();
    await db.runAsync('UPDATE notices SET read = 1 WHERE user_id = ?', userId);
    return readBundle(userId);
  });
}

export type { Notice, UnlockedAchievement };
