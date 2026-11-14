import { categoryById } from './catalog';
import { dayKeyFromIso, lastDays, weekdayLetter } from './dates';
import { bondLevel, levelFromTotal, sumXp } from './progression';
import { streakView } from './streak';
import type { Bundle, CategoryId } from './types';

export type Period = 'week' | 'month' | 'all';

function startMs(period: Period, now: Date): number | null {
  if (period === 'all') return null;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (period === 'week' ? 6 : 29));
  return start.getTime();
}

function inPeriod(iso: string, period: Period, now: Date): boolean {
  const from = startMs(period, now);
  if (from === null) return true;
  return new Date(iso).getTime() >= from;
}

export function progressModel(bundle: Bundle, period: Period, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const userTx = bundle.transactions.filter((row) => row.origin === 'user');
  const periodTx = userTx.filter((row) => inPeriod(row.createdAt, period, now));
  const totalXp = sumXp(userTx);
  const periodXp = sumXp(periodTx);
  const level = levelFromTotal(totalXp);
  const missions = bundle.missions.filter((mission) => mission.origin === 'user');
  const completed = missions.filter((mission) => mission.status === 'complete' && mission.completedAt && inPeriod(mission.completedAt, period, now));
  const byCategory = {
    fitness: 0,
    mindset: 0,
    money: 0,
    business: 0,
    learning: 0,
    lifestyle: 0,
  } as Record<CategoryId, number>;
  completed.forEach((mission) => {
    byCategory[mission.category] += 1;
  });
  const divisor = period === 'week' ? 2 : period === 'month' ? 6 : 12;
  const scores = (Object.keys(byCategory) as CategoryId[]).map((id) => ({
    id,
    label: categoryById(id).title.split(' ')[0] ?? id,
    full: categoryById(id).title,
    count: byCategory[id],
    score: Math.max(0, Math.min(100, Math.round((byCategory[id] / divisor) * 100))),
  }));
  const days = lastDays(today, period === 'month' ? 28 : period === 'all' ? 7 : 7);
  const buckets =
    period === 'month'
      ? [0, 1, 2, 3].map((index) => days.slice(index * 7, index * 7 + 7))
      : period === 'all'
        ? groupMonths(userTx.map((row) => row.createdAt), now)
        : days.map((day) => [day]);
  const activity =
    period === 'all'
      ? (buckets as { label: string; keys: string[] }[]).map((bucket) => ({
          label: bucket.label,
          xp: userTx.filter((row) => bucket.keys.includes(dayKeyFromIso(row.createdAt))).reduce((sum, row) => sum + row.amount, 0),
        }))
      : (buckets as string[][]).map((group, index) => ({
          label: period === 'week' ? weekdayLetter(group[0] ?? today) : `W${index + 1}`,
          xp: userTx.filter((row) => group.includes(dayKeyFromIso(row.createdAt))).reduce((sum, row) => sum + row.amount, 0),
          key: group[0] ?? '',
        }));
  const weekStrip = lastDays(today, 7).map((day) => ({
    day,
    label: weekdayLetter(day),
    done: missions.some((mission) => mission.status === 'complete' && mission.day === day),
    isToday: day === today,
    xp: userTx.filter((row) => dayKeyFromIso(row.createdAt) === day).reduce((sum, row) => sum + row.amount, 0),
  }));
  const streak = streakView(
    {
      count: bundle.settings.streakCount,
      lastDay: bundle.settings.streakLastDay,
      best: bundle.settings.bestStreak,
      recoveryWeek: bundle.settings.recoveryWeek,
      recoveryArmed: bundle.settings.recoveryArmed,
    },
    today,
  );
  const goals = bundle.goals.filter((goal) => goal.origin === 'user');
  const bond = bondLevel(bundle.loop.bondXp);
  const achievements = bundle.achievements.filter((item) => (period === 'all' ? true : inPeriod(item.unlockedAt, period, now)));
  return {
    today,
    totalXp,
    periodXp,
    level: level.level,
    into: level.into,
    need: level.need,
    streak: streak.count,
    bestStreak: bundle.settings.bestStreak,
    pendingGap: streak.pendingGap,
    canRecover: streak.canRecover,
    completedToday: streak.completedToday,
    missionsCompleted: completed.length,
    achievementsUnlocked: achievements.length,
    bondLevel: bond.level,
    bondInto: bond.into,
    bondNeed: bond.need,
    scores,
    activity,
    weekStrip,
    goalRate: { done: goals.filter((goal) => goal.status === 'complete').length, total: goals.length },
    recent: [...userTx].reverse().slice(0, 8),
    todayMissions: missions.filter((mission) => mission.day === today),
  };
}

function groupMonths(isos: string[], now: Date): { label: string; keys: string[] }[] {
  const months: { label: string; keys: string[] }[] = [];
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = date.toLocaleString('en', { month: 'short' });
    const prefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const keys = Array.from(new Set(isos.map(dayKeyFromIso).filter((key) => key.startsWith(prefix))));
    months.push({ label, keys });
  }
  return months;
}
