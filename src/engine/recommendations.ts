import { categoryById } from './catalog';
import { suggestMission } from './chat';
import type { Goal, Mission, Onboarding, SkillId } from './types';

export function homeLine(input: {
  completedEver: number;
  pendingGap: number;
  openToday: number;
  doneToday: number;
}): string {
  if (input.pendingGap > 0) return 'Great to see you back! No catching up. Ready when you are.';
  if (input.completedEver === 0) return 'Your first day is ready. One mission is enough.';
  if (input.openToday === 0 && input.doneToday > 0) return "Today is complete. I'm proud of you.";
  if (input.openToday > 0 && input.doneToday > 0) return "That's a real win. The rest can wait if you want.";
  if (input.openToday > 0) return 'Ready for today’s missions?';
  return "I'm here when you want a small win.";
}

export function goalRecommendation(onboarding: Onboarding, goals: Goal[]): string {
  const primary = onboarding.categories[0];
  const active = goals.find((goal) => goal.status === 'active' && goal.origin === 'user');
  if (!active) {
    const name = primary ? categoryById(primary).title : 'one area';
    return `A first goal in ${name} gives the daily missions a place to land.`;
  }
  const left = Math.max(0, active.targetValue - active.currentValue);
  if (left <= 0) return `${active.title} has reached its target. You can mark it complete when you want the XP.`;
  return `${active.title} has ${left} ${active.unit} to go. A habit tied to it makes the next step obvious.`;
}

export function suggestedTitle(missions: Mission[], skill: SkillId): string | null {
  const open = missions.filter((mission) => mission.status === 'open' && mission.origin === 'user');
  return suggestMission(open, skill)?.title ?? null;
}
