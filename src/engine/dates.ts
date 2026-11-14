export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, days: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function daysBetween(from: string, to: string): number {
  const a = parseKey(from).getTime();
  const b = parseKey(to).getTime();
  return Math.round((b - a) / 86400000);
}

export function weekdayLetter(key: string): string {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][parseKey(key).getDay()] ?? '';
}

export function weekdayName(key: string): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseKey(key).getDay()] ?? '';
}

export function isoWeekKey(key: string): string {
  const date = parseKey(key);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return todayKey(date);
}

export function dayKeyFromIso(iso: string): string {
  return todayKey(new Date(iso));
}

export function lastDays(end: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(end, index - (count - 1)));
}

export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: days }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      const m = String(month).padStart(2, '0');
      return `${year}-${m}-${day}`;
    }),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}
