import {
  formatDateOnly,
  formatDateTime,
  parseDueInput,
  isNowOrFuture,
  getNotificationBody,
} from './dueDate';

describe('dueDate utils', () => {
  describe('formatDateOnly', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 6, 22); // July 22, 2026
      expect(formatDateOnly(date)).toBe('2026-07-22');
    });

    it('pads month and day with leading zeros', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDateOnly(date)).toBe('2026-01-05');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time as YYYY-MM-DD HH:mm', () => {
      const date = new Date(2026, 6, 22, 14, 30); // July 22, 2026, 2:30 PM
      expect(formatDateTime(date)).toBe('2026-07-22 14:30');
    });

    it('pads hours and minutes', () => {
      const date = new Date(2026, 0, 5, 9, 5);
      expect(formatDateTime(date)).toBe('2026-01-05 09:05');
    });
  });

  describe('parseDueInput', () => {
    it('parses ISO date format YYYY-MM-DD', () => {
      const result = parseDueInput('2026-07-22');
      expect(result).toMatchObject({
        date: expect.any(Date),
        hasTime: false,
        normalizedDisplay: '2026-07-22',
      });
      expect(result.date.getFullYear()).toBe(2026);
      expect(result.date.getMonth()).toBe(6); // 0-indexed
      expect(result.date.getDate()).toBe(22);
    });

    it('parses ISO datetime format YYYY-MM-DD HH:mm', () => {
      const result = parseDueInput('2026-07-22 14:30');
      expect(result).toMatchObject({
        hasTime: true,
        normalizedDisplay: '2026-07-22 14:30',
      });
      expect(result.date.getHours()).toBe(14);
      expect(result.date.getMinutes()).toBe(30);
    });

    it('parses US date format MM/DD/YYYY', () => {
      const result = parseDueInput('7/22/2026');
      expect(result).toMatchObject({
        date: expect.any(Date),
        hasTime: false,
      });
      expect(result.date.getFullYear()).toBe(2026);
      expect(result.date.getMonth()).toBe(6);
      expect(result.date.getDate()).toBe(22);
    });

    it('parses US datetime format MM/DD/YYYY HH:mm', () => {
      const result = parseDueInput('7/22/2026 14:30');
      expect(result).toMatchObject({
        hasTime: true,
      });
      expect(result.date.getHours()).toBe(14);
    });

    it('handles T separator in ISO datetime', () => {
      const result = parseDueInput('2026-07-22T14:30');
      expect(result?.hasTime).toBe(true);
    });

    it('returns null for empty/whitespace input', () => {
      expect(parseDueInput('')).toBeNull();
      expect(parseDueInput('   ')).toBeNull();
    });

    it('returns null for invalid date', () => {
      expect(parseDueInput('2026-13-45')).toBeNull(); // invalid month/day
      expect(parseDueInput('2026-02-30')).toBeNull(); // Feb 30 doesn't exist
      expect(parseDueInput('not-a-date')).toBeNull();
    });

    it('returns null for invalid time', () => {
      expect(parseDueInput('2026-07-22 25:00')).toBeNull(); // invalid hour
      expect(parseDueInput('2026-07-22 12:60')).toBeNull(); // invalid minute
    });
  });

  describe('isNowOrFuture', () => {
    it('returns true for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setSeconds(0, 0);
      expect(isNowOrFuture(futureDate)).toBe(true);
    });

    it('returns true for current time (allowing 1-second buffer)', () => {
      const now = new Date();
      now.setSeconds(0, 0);
      expect(isNowOrFuture(now)).toBe(true);
    });

    it('returns false for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isNowOrFuture(pastDate)).toBe(false);
    });
  });

  describe('getNotificationBody', () => {
    it('returns default message when task has no dueAt', () => {
      const task = { name: 'My Task' };
      expect(getNotificationBody(task)).toBe('A task is due now.');
    });

    it('returns task name and due time when dueAt is present', () => {
      const task = { name: 'Review Report', dueAt: '2026-07-22 14:30' };
      const result = getNotificationBody(task);
      expect(result).toContain('Review Report');
      expect(result).toContain('2026-07-22 14:30');
    });

    it('uses "Task" as fallback when name is missing', () => {
      const task = { dueAt: '2026-07-22 14:30' };
      const result = getNotificationBody(task);
      expect(result).toContain('Task');
      expect(result).toContain('2026-07-22 14:30');
    });
  });
});
