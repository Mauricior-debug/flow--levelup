import { daysBetween, dayKeyFromIso } from './dates';
import type { AccessoryId, EnvironmentId, LookId, LoopState, Mood, SkillId } from './types';
import { LOOK_DEFS, ACCESSORY_DEFS, ENVIRONMENT_DEFS } from './catalog';
import { bondLevel } from './progression';

export function moodOnOpen(input: {
  now: Date;
  today: string;
  lastCompletionAt: string | null;
  lastOpenDay: string | null;
  loop: LoopState;
}): Mood {
  if (input.loop.moodUntil && new Date(input.loop.moodUntil).getTime() > input.now.getTime()) {
    return input.loop.mood;
  }
  const hour = input.now.getHours();
  if (hour >= 23 || hour < 6) return 'sleepy';
  if (input.lastOpenDay && daysBetween(input.lastOpenDay, input.today) >= 3) return 'welcoming';
  if (input.lastCompletionAt) {
    const age = input.now.getTime() - new Date(input.lastCompletionAt).getTime();
    if (age >= 0 && age < 3 * 60 * 60 * 1000) return 'happy';
    if (dayKeyFromIso(input.lastCompletionAt) !== input.today) return 'relaxed';
  }
  return input.lastCompletionAt ? 'happy' : 'idle';
}

export function moodAfterWin(input: { leveledUp: boolean; weekly: boolean }): { mood: Mood; hours: number } {
  if (input.leveledUp || input.weekly) return { mood: 'excited', hours: 2 };
  return { mood: 'happy', hours: 2 };
}

export function lookUnlocked(id: LookId, bondXp: number, level: number): boolean {
  if (id === 'custom') return false;
  const def = LOOK_DEFS.find((item) => item.id === id);
  if (!def) return false;
  const bond = bondLevel(bondXp).level;
  return bond >= def.bond && level >= def.level;
}

export function accessoryUnlocked(id: AccessoryId, bondXp: number, level: number, weeklyDone: boolean): boolean {
  const def = ACCESSORY_DEFS.find((item) => item.id === id);
  if (!def) return false;
  if (def.needsWeekly && !weeklyDone) return false;
  const bond = bondLevel(bondXp).level;
  return bond >= def.bond && level >= def.level;
}

export function environmentUnlocked(id: EnvironmentId, bondXp: number, level: number): boolean {
  const def = ENVIRONMENT_DEFS.find((item) => item.id === id);
  if (!def) return false;
  const bond = bondLevel(bondXp).level;
  return bond >= def.bond && level >= def.level;
}

export function skillUnlocked(id: SkillId, input: { missionCount: number; level: number; comeback: boolean }): boolean {
  if (id === 'steady') return true;
  if (id === 'focus') return input.missionCount >= 5;
  if (id === 'comeback') return input.comeback;
  if (id === 'deep') return input.level >= 4;
  return false;
}

export function lockReason(kind: string): string {
  return kind;
}
