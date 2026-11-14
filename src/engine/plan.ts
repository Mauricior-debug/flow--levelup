import { isGentle } from './catalog';
import { addDays } from './dates';
import type { CategoryId, Difficulty, MissionDraft, Onboarding } from './types';

type Template = { title: string; description: string; minutes: number };

const SMALL: Record<CategoryId, Template[]> = {
  fitness: [
    { title: 'Take a 5-minute walk', description: 'Step outside or pace a room. Stop while it still feels easy.', minutes: 5 },
    { title: 'Stretch for 5 minutes', description: 'Neck, hips, and legs. No full workout required.', minutes: 5 },
  ],
  mindset: [
    { title: 'Write one kind sentence', description: 'A sentence you would say to a friend, aimed at yourself.', minutes: 5 },
    { title: 'Name the next tiny step', description: 'Write the next action in one line. Do not plan the month.', minutes: 5 },
  ],
  money: [
    { title: 'Log your spending', description: 'Write down what left your account today. No judgment, just the list.', minutes: 5 },
    { title: 'Pause before one purchase', description: 'Wait ten breaths before you buy something you did not plan.', minutes: 5 },
  ],
  business: [
    { title: 'Name today’s one priority', description: 'Pick the task that would make the day feel finished.', minutes: 5 },
    { title: 'Start a task for 5 minutes', description: 'Open the work and begin. You can stop when the timer ends.', minutes: 5 },
  ],
  learning: [
    { title: 'Read for 10 minutes', description: 'One chapter, article, or page. Stop while you still want more.', minutes: 10 },
    { title: 'Write down one thing you learned', description: 'A single sentence is enough to keep it.', minutes: 5 },
  ],
  lifestyle: [
    { title: 'Set a lights-out time', description: 'Choose the time and put the phone to charge away from the bed.', minutes: 5 },
    { title: 'Take a 5-minute reset', description: 'Water, a window, or a quiet room. Then come back.', minutes: 5 },
  ],
};

const STANDARD: Record<CategoryId, Template[]> = {
  fitness: [
    { title: 'Move for 10 minutes', description: 'A brisk walk, a short ride, or a bodyweight circuit.', minutes: 10 },
    { title: 'Do a mobility session', description: 'Hips, shoulders, and back. Slow and complete.', minutes: 10 },
  ],
  mindset: [
    { title: 'Sit with one distraction', description: 'Notice the pull, then return to the thing you chose.', minutes: 10 },
    { title: 'Review one promise you kept', description: 'Write what you did and what made it possible.', minutes: 10 },
  ],
  money: [
    { title: 'Review yesterday’s spending', description: 'Sort each amount into need, want, or not sure.', minutes: 10 },
    { title: 'Set a small amount aside', description: 'Move a modest sum, or write the amount you will move.', minutes: 10 },
  ],
  business: [
    { title: 'Work the priority for 15 minutes', description: 'Only that task. Close the other tabs.', minutes: 15 },
    { title: 'Write the next step for a project', description: 'One concrete action, with a time attached.', minutes: 10 },
  ],
  learning: [
    { title: 'Complete a learning activity', description: 'A lesson, a problem set, or ten pages. Finish the sitting.', minutes: 10 },
    { title: 'Explain a topic out loud', description: 'Teach it in a few sentences, as if to a friend.', minutes: 10 },
  ],
  lifestyle: [
    { title: 'Prepare tomorrow’s first hour', description: 'Clothes, bag, or breakfast. Make the morning smaller.', minutes: 10 },
    { title: 'Spend 10 minutes offline', description: 'A walk, a page, or a conversation without a screen.', minutes: 10 },
  ],
};

const CHALLENGING: Record<CategoryId, Template[]> = {
  fitness: [
    { title: 'Complete a 15-minute workout', description: 'A short session. Stop while you still feel good.', minutes: 15 },
  ],
  mindset: [
    { title: 'Hold a 15-minute focus block', description: 'One task, no switching. When you drift, come back.', minutes: 15 },
  ],
  money: [
    { title: 'Sort a week of spending', description: 'Look at seven days and mark the pattern you want to change.', minutes: 15 },
  ],
  business: [
    { title: 'Finish a hard 20-minute block', description: 'The task you have been delaying. Start, then stop on time.', minutes: 20 },
  ],
  learning: [
    { title: 'Study for 20 minutes', description: 'One topic only. Write three lines at the end.', minutes: 20 },
  ],
  lifestyle: [
    { title: 'Build a 20-minute evening wind-down', description: 'Dim the lights, set the phone aside, and keep the same order.', minutes: 20 },
  ],
};

const WEEKLY: Record<CategoryId, Template> = {
  fitness: { title: 'Bring the week of movement together', description: 'Look back at the sessions you finished and choose next week’s easiest slot.', minutes: 15 },
  mindset: { title: 'Review the week with kindness', description: 'What you kept, what you dropped, and one smaller promise for next week.', minutes: 15 },
  money: { title: 'Close the week’s money note', description: 'Total what you logged and pick one change for next week.', minutes: 15 },
  business: { title: 'Choose next week’s single priority', description: 'Write the one outcome that would make the week feel successful.', minutes: 15 },
  learning: { title: 'Teach back what you learned', description: 'Summarise the week in a few lines you could read later.', minutes: 15 },
  lifestyle: { title: 'Design next week’s wind-down', description: 'Pick the bedtime and the first step that starts it.', minutes: 15 },
};

function pace(onboarding: Onboarding): 'light' | 'steady' | 'bold' {
  const minutes = onboarding.dailyMinutes ?? 5;
  if (isGentle(onboarding.consistency) && minutes < 20) return 'light';
  if (minutes <= 5) return 'light';
  if (minutes <= 10) return 'steady';
  return 'bold';
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length] as T;
}

function categoriesOf(onboarding: Onboarding): CategoryId[] {
  return onboarding.categories.length ? onboarding.categories : ['lifestyle'];
}

function budget(onboarding: Onboarding): number {
  return onboarding.dailyMinutes === 30 ? 30 : onboarding.dailyMinutes ?? 5;
}

export function generatePlan(onboarding: Onboarding): MissionDraft[] {
  const categories = categoriesOf(onboarding);
  const primary = categories[0] ?? 'lifestyle';
  const mode = pace(onboarding);
  const cap = budget(onboarding);
  const drafts: MissionDraft[] = [];

  for (let day = 0; day < 7; day += 1) {
    const category = categories[day % categories.length] ?? primary;
    if (day === 6) {
      const weekly = WEEKLY[category];
      drafts.push({
        title: weekly.title,
        description: weekly.description,
        category,
        durationMinutes: Math.min(weekly.minutes, Math.max(cap, 10)),
        difficulty: 'weekly',
        dayOffset: day,
        challengeDay: day + 1,
        slot: 'weekly',
      });
      continue;
    }

    const slots: { template: Template; difficulty: Difficulty }[] = [];
    if (day === 0) {
      slots.push({
        template: {
          title: 'Show up for day one',
          description: onboarding.changeWish
            ? `You wanted this change: ${onboarding.changeWish}. Today, just show up.`
            : 'Take one breath and mark the day. That is the whole mission.',
          minutes: 2,
        },
        difficulty: 'small',
      });
    }

    if (mode === 'light') {
      if (day !== 0) slots.push({ template: pick(SMALL[category], day), difficulty: 'small' });
    } else if (mode === 'steady') {
      slots.push({ template: pick(SMALL[category], day), difficulty: 'small' });
      if (cap >= 10) slots.push({ template: pick(STANDARD[category], day), difficulty: 'standard' });
    } else {
      slots.push({ template: pick(STANDARD[category], day + 1), difficulty: 'standard' });
      if (cap >= 20 && day % 2 === 1) slots.push({ template: CHALLENGING[category][0], difficulty: 'challenging' });
      else if (cap >= 30) slots.push({ template: pick(SMALL[category], day), difficulty: 'small' });
    }

    let used = 0;
    slots.forEach((slot, index) => {
      const minutes = slot.template.minutes;
      if (day === 0 && index > 0 && used + minutes > cap) return;
      if (day !== 0 && used + minutes > cap + 5) return;
      used += minutes;
      drafts.push({
        title: slot.template.title,
        description: slot.template.description,
        category,
        durationMinutes: minutes,
        difficulty: slot.difficulty,
        dayOffset: day,
        challengeDay: day + 1,
        slot: day === 0 && index === 0 ? 'show-up' : 'daily',
      });
    });
  }

  return drafts;
}

export function planDates(startDay: string, drafts: MissionDraft[]): (MissionDraft & { day: string })[] {
  return drafts.map((draft) => ({ ...draft, day: addDays(startDay, draft.dayOffset) }));
}

export type PlanHighlight = { title: string; icon: string };

export function planHighlights(drafts: MissionDraft[], minutes: number | null): PlanHighlight[] {
  const workouts = drafts.filter((item) => item.category === 'fitness' && item.slot !== 'show-up').length;
  const notable = drafts.filter((item) => item.slot !== 'show-up');
  const weekly = drafts.find((item) => item.slot === 'weekly');
  const rows: PlanHighlight[] = [
    { title: 'Build a daily habit', icon: 'checkmark-circle' },
  ];
  if (workouts >= 2) rows.push({ title: `Complete ${workouts} movement sessions`, icon: 'barbell-outline' });
  const read = notable.find((item) => item.title.toLowerCase().includes('read'));
  if (read) rows.push({ title: read.title, icon: 'book-outline' });
  const money = notable.find((item) => item.category === 'money');
  if (money && rows.length < 4) rows.push({ title: money.title, icon: 'wallet-outline' });
  for (const item of notable) {
    if (rows.length >= 3) break;
    if (rows.some((row) => row.title === item.title)) continue;
    rows.push({ title: item.title, icon: 'sparkles-outline' });
  }
  if (weekly && rows.length < 4) rows.push({ title: weekly.title, icon: 'flag-outline' });
  if (rows.length < 2) rows.push({ title: `About ${minutes ?? 5} minutes a day`, icon: 'time-outline' });
  return rows.slice(0, 4);
}

export function rollingMissions(onboarding: Onboarding, dayOffset = 0): MissionDraft[] {
  const categories = categoriesOf(onboarding);
  const category = categories[dayOffset % categories.length] ?? 'lifestyle';
  const mode = pace(onboarding);
  const cap = budget(onboarding);
  const chosen: { template: Template; difficulty: Difficulty }[] =
    mode === 'bold'
      ? [
          { template: pick(STANDARD[category], dayOffset), difficulty: 'standard' },
          { template: pick(SMALL[category], dayOffset), difficulty: 'small' },
        ]
      : [{ template: pick(SMALL[category], dayOffset), difficulty: 'small' }];
  if (mode !== 'light' && cap >= 15 && dayOffset % 3 === 0) {
    chosen.unshift({ template: CHALLENGING[category][0], difficulty: 'challenging' });
  }
  let used = 0;
  const drafts: MissionDraft[] = [];
  chosen.forEach((slot) => {
    if (used + slot.template.minutes > cap + 5) return;
    used += slot.template.minutes;
    drafts.push({
      title: slot.template.title,
      description: slot.template.description,
      category,
      durationMinutes: slot.template.minutes,
      difficulty: slot.difficulty,
      dayOffset: 0,
      challengeDay: 0,
      slot: 'daily',
    });
  });
  return drafts;
}
