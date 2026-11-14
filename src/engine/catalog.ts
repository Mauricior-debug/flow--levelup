import type { AccessoryId, CategoryId, EnvironmentId, LookId, SkillId } from './types';

export type CategoryDef = {
  id: CategoryId;
  title: string;
  detail: string;
  icon: string;
};

export const CATEGORIES: CategoryDef[] = [
  { id: 'fitness', title: 'Fitness and Health', detail: 'Get healthier and stronger', icon: 'barbell-outline' },
  { id: 'mindset', title: 'Mindset and Discipline', detail: 'Build discipline and confidence', icon: 'sparkles-outline' },
  { id: 'money', title: 'Money and Finance', detail: 'Improve your finances', icon: 'wallet-outline' },
  { id: 'business', title: 'Business and Career', detail: 'Grow your career or business', icon: 'briefcase-outline' },
  { id: 'learning', title: 'Learning and Education', detail: 'Gain new skills and knowledge', icon: 'book-outline' },
  { id: 'lifestyle', title: 'Lifestyle and Wellbeing', detail: 'Create balance and better habits', icon: 'leaf-outline' },
];

export function categoryById(id: CategoryId): CategoryDef {
  return CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[0];
}

export const TIME_OPTIONS: { minutes: 5 | 10 | 20 | 30; title: string; detail: string }[] = [
  { minutes: 5, title: '5 minutes', detail: 'A quick daily boost' },
  { minutes: 10, title: '10 minutes', detail: 'A solid start' },
  { minutes: 20, title: '20 minutes', detail: 'Real progress' },
  { minutes: 30, title: '30+ minutes', detail: 'Maximum growth' },
];

export const MOTIVATIONS = [
  'Seeing measurable progress',
  'Achieving personal goals',
  'Becoming more disciplined',
  'Building a better future',
  'Competing with others',
];

export const ROUTINES = [
  'It is all over the place',
  'I have a few habits, nothing steady',
  'Fairly steady',
  'Strict, and it is wearing me out',
];

export const CONSISTENCY = [
  'I rarely follow through',
  'I start strong, then fade',
  'A few days a week',
  'I am consistent and want more',
];

const CHALLENGES: Record<CategoryId, string[]> = {
  fitness: ['Finding time to move', 'Low energy', 'I start too hard'],
  mindset: ['Negative self-talk', 'Getting distracted', 'All-or-nothing thinking'],
  money: ['Not knowing where it goes', 'Impulse spending', 'No savings habit'],
  business: ['Unclear priorities', 'Putting work off', 'Work spilling into everything'],
  learning: ['I cannot stay with one topic', 'No study routine', 'I forget what I learn'],
  lifestyle: ['Sleep is uneven', 'Too much screen time', 'No wind-down'],
};

const CHANGES: Record<CategoryId, string[]> = {
  fitness: ['Move on most days', 'Build some strength', 'Pair sleep with training'],
  mindset: ['Speak to myself more kindly', 'Protect one focus block', 'Keep the promises I make'],
  money: ['See where money goes', 'Pause before spending', 'Set a small amount aside'],
  business: ['Name the one priority', 'Start tasks sooner', 'Stop work at a set time'],
  learning: ['Study a little every day', 'Finish one short lesson', 'Write down what I learned'],
  lifestyle: ['A steadier bedtime', 'A daily reset', 'More time offline'],
};

function mix(categories: CategoryId[], bank: Record<CategoryId, string[]>): string[] {
  const picked = categories.length ? categories : (['lifestyle'] as CategoryId[]);
  const per = picked.length === 1 ? 3 : 2;
  const seen = new Set<string>();
  const options: string[] = [];
  for (const category of picked) {
    for (const option of bank[category].slice(0, per)) {
      if (!seen.has(option)) {
        seen.add(option);
        options.push(option);
      }
    }
  }
  return options.slice(0, 6);
}

export function challengeOptions(categories: CategoryId[]): string[] {
  return mix(categories, CHALLENGES);
}

export function changeOptions(categories: CategoryId[]): string[] {
  return mix(categories, CHANGES);
}

export type LookDef = {
  id: LookId;
  name: string;
  detail: string;
  bond: number;
  level: number;
};

export const LOOK_DEFS: LookDef[] = [
  { id: 'classic', name: 'Classic', detail: 'The Loop you met on day one.', bond: 1, level: 1 },
  { id: 'explorer', name: 'Explorer', detail: 'A hood for days you go outside.', bond: 2, level: 1 },
  { id: 'cyber', name: 'Cyber', detail: 'Cool light, same warm face.', bond: 3, level: 1 },
  { id: 'galaxy', name: 'Galaxy', detail: 'A night-sky suit for later levels.', bond: 1, level: 6 },
];

export type AccessoryDef = {
  id: AccessoryId;
  name: string;
  detail: string;
  bond: number;
  level: number;
  needsWeekly: boolean;
};

export const ACCESSORY_DEFS: AccessoryDef[] = [
  { id: 'none', name: 'No extra', detail: 'Just Loop.', bond: 1, level: 1, needsWeekly: false },
  { id: 'scarf', name: 'Sunrise scarf', detail: 'A warm edge around Loop.', bond: 2, level: 1, needsWeekly: false },
  { id: 'star', name: 'Star pin', detail: 'A small mark for showing up.', bond: 1, level: 4, needsWeekly: false },
  { id: 'glow', name: 'Celebration glow', detail: 'Soft light after a weekly challenge.', bond: 1, level: 1, needsWeekly: true },
];

export type EnvironmentDef = {
  id: EnvironmentId;
  name: string;
  detail: string;
  bond: number;
  level: number;
};

export const ENVIRONMENT_DEFS: EnvironmentDef[] = [
  { id: 'island', name: 'Falls', detail: 'The island at sunset.', bond: 1, level: 1 },
  { id: 'bedroom', name: 'Rest', detail: 'A quiet room when the day is done.', bond: 2, level: 1 },
  { id: 'summit', name: 'Summit', detail: 'Higher ground, same companion.', bond: 1, level: 5 },
];

export type SkillDef = {
  id: SkillId;
  name: string;
  detail: string;
};

export const SKILL_DEFS: SkillDef[] = [
  { id: 'steady', name: 'Steady', detail: 'Loop points you to the smallest open mission.' },
  { id: 'focus', name: 'Focus', detail: 'One next action, and less noise around it.' },
  { id: 'comeback', name: 'Comeback', detail: 'A gentler tone after time away.' },
  { id: 'deep', name: 'Deep work', detail: 'Loop highlights the harder mission when you have time.' },
];

export const PET_EYE_COLORS = ['#FFE45C', '#FFFFFF', '#7DD3FC', '#F9A8D4', '#86EFAC', '#FDBA74'] as const;
export const PET_GLOW_COLORS = ['#A78BFA', '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#FB7185'] as const;

export function isPetColor(value: string, kind: 'eye' | 'glow'): boolean {
  const list = kind === 'eye' ? PET_EYE_COLORS : PET_GLOW_COLORS;
  return (list as readonly string[]).includes(value);
}

export function isGentle(consistency: string | null): boolean {
  if (!consistency) return false;
  return consistency.includes('rarely') || consistency.includes('fade') || consistency.includes('wearing me out');
}
