import { daysBetween, isoWeekKey } from './dates';

export type StreakState = {
  count: number;
  lastDay: string | null;
  best: number;
  recoveryWeek: string | null;
  recoveryArmed: boolean;
};

export type StreakView = {
  count: number;
  pendingGap: number;
  canRecover: boolean;
  completedToday: boolean;
};

export function streakView(state: StreakState, today: string): StreakView {
  if (!state.lastDay || state.count <= 0) {
    return { count: 0, pendingGap: 0, canRecover: false, completedToday: false };
  }
  const gap = daysBetween(state.lastDay, today);
  if (gap <= 1) {
    return { count: state.count, pendingGap: 0, canRecover: false, completedToday: gap === 0 };
  }
  const missed = gap - 1;
  const week = isoWeekKey(today);
  const canRecover = missed === 1 && state.recoveryWeek !== week;
  return { count: state.count, pendingGap: missed, canRecover, completedToday: false };
}

export function streakAfterCompletion(state: StreakState, today: string): StreakState {
  if (state.lastDay === today) return state;
  let count = 1;
  let recoveryWeek = state.recoveryWeek;
  let recoveryArmed = false;
  if (!state.lastDay) {
    count = 1;
  } else {
    const gap = daysBetween(state.lastDay, today);
    if (gap === 1) count = state.count + 1;
    else if (gap === 2 && state.recoveryArmed && state.recoveryWeek !== isoWeekKey(today)) {
      count = state.count + 1;
      recoveryWeek = isoWeekKey(today);
    } else count = 1;
  }
  return {
    count,
    lastDay: today,
    best: Math.max(state.best, count),
    recoveryWeek,
    recoveryArmed,
  };
}
