import assert from 'node:assert/strict';
import { test } from 'node:test';
import { earnedAchievementKeys } from './achievements';
import { replyTo } from './chat';
import { addDays, daysBetween, todayKey } from './dates';
import { generatePlan, planHighlights } from './plan';
import { levelFromTotal, sumXp, xpFor, XP } from './progression';
import { streakAfterCompletion, streakView } from './streak';
import { SAMPLE_HOME } from '../data/samples';
import type { Onboarding } from './types';

const baseOnboarding = (patch: Partial<Onboarding> = {}): Onboarding => ({
  step: 'plan',
  categories: ['fitness', 'learning'],
  routine: 'It is all over the place',
  consistency: 'I start strong, then fade',
  challenge: 'Finding time to move',
  changeWish: 'Move on most days',
  dailyMinutes: 10,
  motivation: 'Seeing measurable progress',
  intention: null,
  completed: false,
  ...patch,
});

test('xp table is the only source of mission rewards', () => {
  assert.equal(xpFor('small'), 25);
  assert.equal(xpFor('standard'), 50);
  assert.equal(xpFor('challenging'), 100);
  assert.equal(xpFor('weekly'), 250);
  assert.equal(xpFor('major'), 500);
  assert.deepEqual(XP.small + XP.standard + XP.challenging, 175);
});

test('sample rows never enter the XP total', () => {
  const total = sumXp([
    { amount: SAMPLE_HOME.xpInto, origin: 'sample' },
    { amount: 25, origin: 'user' },
  ]);
  assert.equal(total, 25);
  assert.equal(SAMPLE_HOME.origin, 'sample');
});

test('levels advance only from summed user XP', () => {
  assert.deepEqual(levelFromTotal(0), { level: 1, into: 0, need: 80 });
  assert.equal(levelFromTotal(25).level, 1);
  assert.equal(levelFromTotal(80).level, 2);
  assert.equal(levelFromTotal(80).into, 0);
  assert.equal(levelFromTotal(199).level, 2);
  assert.equal(levelFromTotal(200).level, 3);
});

test('a 7-day plan respects a short daily commitment', () => {
  const plan = generatePlan(baseOnboarding({ dailyMinutes: 5, categories: ['money'], consistency: 'I rarely follow through' }));
  const dayOne = plan.filter((item) => item.dayOffset === 0);
  assert.equal(dayOne[0]?.slot, 'show-up');
  assert.equal(dayOne[0]?.difficulty, 'small');
  assert.ok(dayOne.reduce((sum, item) => sum + item.durationMinutes, 0) <= 7);
  assert.equal(plan.filter((item) => item.slot === 'weekly').length, 1);
  assert.equal(plan.find((item) => item.slot === 'weekly')?.difficulty, 'weekly');
  const highlights = planHighlights(plan, 5);
  assert.equal(highlights[0]?.title, 'Build a daily habit');
  assert.ok(highlights.length >= 2 && highlights.length <= 4);
});

test('streak recovery is optional and a longer gap starts fresh', () => {
  const today = todayKey(new Date(2026, 10, 14));
  const paused = streakView({ count: 4, lastDay: addDays(today, -2), best: 4, recoveryWeek: null, recoveryArmed: false }, today);
  assert.equal(paused.canRecover, true);
  assert.equal(paused.count, 4);
  const reconnected = streakAfterCompletion(
    { count: 4, lastDay: addDays(today, -2), best: 4, recoveryWeek: null, recoveryArmed: true },
    today,
  );
  assert.equal(reconnected.count, 5);
  const fresh = streakAfterCompletion(
    { count: 4, lastDay: addDays(today, -2), best: 4, recoveryWeek: null, recoveryArmed: false },
    today,
  );
  assert.equal(fresh.count, 1);
  const longGap = daysBetween(addDays(today, -5), today);
  assert.equal(longGap, 5);
});

test('achievements follow real counts', () => {
  const keys = earnedAchievementKeys({
    missionCount: 1,
    streak: 3,
    weeklyCompletions: 0,
    byCategory: { fitness: 0, mindset: 0, money: 0, business: 0, learning: 0, lifestyle: 0 },
    level: 1,
  });
  assert.deepEqual(keys.sort(), ['first_mission', 'streak_3']);
});

test('Loop answers the three briefed moments in character', () => {
  const context = {
    name: 'Ada',
    text: '',
    level: 2,
    streak: 0,
    openMissions: [{ title: 'Log your spending', difficulty: 'small' as const, category: 'money' as const }],
    goals: [],
    onboarding: {
      challenge: 'Impulse spending',
      changeWish: 'Pause before spending',
      consistency: 'I start strong, then fade',
      motivation: 'Seeing measurable progress',
      intention: null,
      categories: ['money' as const],
    },
    skill: 'steady' as const,
  };
  assert.equal(
    replyTo({ ...context, text: "I don't feel motivated today." }).text,
    "That's okay! We don't need to do everything today. Let's start with one small win. I've got your back!",
  );
  assert.equal(
    replyTo({ ...context, text: 'I completed all my missions!' }).text,
    "WAIT... YOU DID IT! I'm so proud of you. We are getting stronger together!",
  );
  assert.equal(
    replyTo({ ...context, text: 'I missed three days.' }).text,
    "Hey, welcome back! I've missed our adventures. No guilt, no pressure. Shall we start fresh?",
  );
  const next = replyTo({ ...context, text: 'What should I do?' });
  assert.match(next.text, /Log your spending/);
  assert.match(next.text, /25 XP/);
});
