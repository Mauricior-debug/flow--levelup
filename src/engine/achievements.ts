import type { CategoryId } from './types';

export type AchievementDef = {
  key: string;
  group: string;
  title: string;
  detail: string;
  major: boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_mission', group: 'First Steps', title: 'First Mission Completed', detail: 'You showed up and finished a mission.', major: false },
  { key: 'streak_3', group: 'Consistency', title: 'Three-Day Streak', detail: 'Three days in a row with a finished mission.', major: false },
  { key: 'streak_7', group: 'Consistency', title: 'Seven-Day Streak', detail: 'A full week of showing up.', major: true },
  { key: 'fitness_5', group: 'Fitness', title: 'Moved Five Times', detail: 'Five fitness missions completed.', major: false },
  { key: 'learning_5', group: 'Learning', title: 'Five Lessons In', detail: 'Five learning missions completed.', major: false },
  { key: 'money_5', group: 'Financial Growth', title: 'Five Money Check-ins', detail: 'Five money missions completed.', major: false },
  { key: 'mindset_5', group: 'Personal Development', title: 'Five Mindset Reps', detail: 'Five mindset missions completed.', major: false },
  { key: 'lifestyle_5', group: 'Personal Development', title: 'Five Lifestyle Wins', detail: 'Five lifestyle missions completed.', major: false },
  { key: 'business_5', group: 'Personal Development', title: 'Five Career Moves', detail: 'Five business missions completed.', major: false },
  { key: 'missions_10', group: 'Personal Development', title: 'Ten Missions', detail: 'Ten missions completed.', major: false },
  { key: 'missions_100', group: 'Special Milestones', title: '100 Missions Completed', detail: 'One hundred finished missions.', major: true },
  { key: 'weekly_first', group: 'Special Milestones', title: 'First Weekly Challenge', detail: 'You finished a weekly challenge.', major: false },
  { key: 'level_5', group: 'Special Milestones', title: 'Level 5', detail: 'You reached level 5.', major: false },
  { key: 'level_10', group: 'Special Milestones', title: 'Level 10', detail: 'You reached level 10.', major: true },
];

export function achievementByKey(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((item) => item.key === key);
}

export type AchievementStats = {
  missionCount: number;
  streak: number;
  weeklyCompletions: number;
  byCategory: Record<CategoryId, number>;
  level: number;
};

const CATEGORY_KEYS: Record<CategoryId, string> = {
  fitness: 'fitness_5',
  learning: 'learning_5',
  money: 'money_5',
  mindset: 'mindset_5',
  lifestyle: 'lifestyle_5',
  business: 'business_5',
};

export function earnedAchievementKeys(stats: AchievementStats): string[] {
  const keys: string[] = [];
  if (stats.missionCount >= 1) keys.push('first_mission');
  if (stats.streak >= 3) keys.push('streak_3');
  if (stats.streak >= 7) keys.push('streak_7');
  if (stats.missionCount >= 10) keys.push('missions_10');
  if (stats.missionCount >= 100) keys.push('missions_100');
  if (stats.weeklyCompletions >= 1) keys.push('weekly_first');
  if (stats.level >= 5) keys.push('level_5');
  if (stats.level >= 10) keys.push('level_10');
  (Object.keys(CATEGORY_KEYS) as CategoryId[]).forEach((category) => {
    if ((stats.byCategory[category] ?? 0) >= 5) keys.push(CATEGORY_KEYS[category]);
  });
  return keys;
}
