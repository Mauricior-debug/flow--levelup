import type { Difficulty, Horizon, XpTransaction } from './types';

export const XP: Record<Difficulty, number> = {
  small: 25,
  standard: 50,
  challenging: 100,
  weekly: 250,
  major: 500,
};

export function xpFor(difficulty: Difficulty): number {
  return XP[difficulty];
}

export function xpForGoal(horizon: Horizon): number {
  if (horizon === 'long_term') return XP.major;
  if (horizon === 'monthly') return XP.challenging;
  return XP.standard;
}

export function xpToAdvance(level: number): number {
  if (level < 1) return 80;
  return 80 + (level - 1) * 40;
}

export function levelFromTotal(total: number): { level: number; into: number; need: number } {
  let level = 1;
  let remaining = Math.max(0, Math.floor(total));
  while (level < 500) {
    const need = xpToAdvance(level);
    if (remaining < need) return { level, into: remaining, need };
    remaining -= need;
    level += 1;
  }
  return { level: 500, into: 0, need: xpToAdvance(500) };
}

export function sumXp(rows: Pick<XpTransaction, 'amount' | 'origin'>[]): number {
  return rows.reduce((total, row) => (row.origin === 'user' ? total + row.amount : total), 0);
}

export const BOND_PER_LEVEL = 1000;

export function bondForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'small':
      return 8;
    case 'standard':
      return 15;
    case 'challenging':
      return 25;
    case 'weekly':
      return 40;
    case 'major':
      return 60;
  }
}

export function bondForChat(alreadyToday: number): number {
  const cap = 15;
  if (alreadyToday >= cap) return 0;
  return Math.min(3, cap - alreadyToday);
}

export const BOND_STREAK = 10;
export const BOND_ACHIEVEMENT = 20;

export function bondLevel(bondXp: number): { level: number; into: number; need: number } {
  const safe = Math.max(0, Math.floor(bondXp));
  return { level: Math.floor(safe / BOND_PER_LEVEL) + 1, into: safe % BOND_PER_LEVEL, need: BOND_PER_LEVEL };
}
