import {
  calculateAttendancePercentage,
  getWorkingDaysInMonth,
  getDaysNeededForGoal,
  getEffectiveWorkingDays,
  formatDateKey,
} from './dataLayer';

describe('calculateAttendancePercentage', () => {
  it('returns 0 if total working days is 0', () => {
    expect(calculateAttendancePercentage(0, 5)).toBe(0);
  });

  it('calculates percentage correctly', () => {
    expect(calculateAttendancePercentage(10, 5)).toBe(50);
  });
});

describe('getWorkingDaysInMonth', () => {
  it('returns only weekdays for a given month', () => {
    const days = getWorkingDaysInMonth(2023, 3); // April 2023 — 20 working days
    expect(days).toHaveLength(20);
    days.forEach(d => {
      const day = d.getDay();
      expect(day).not.toBe(0);
      expect(day).not.toBe(6);
    });
  });
});

describe('getDaysNeededForGoal', () => {
  it('returns 0 when goal is already met', () => {
    expect(getDaysNeededForGoal(20, 10, 50)).toBe(0);
  });

  it('returns correct number of days needed', () => {
    expect(getDaysNeededForGoal(20, 5, 50)).toBe(5);
  });

  it('returns 0 when more than enough days', () => {
    expect(getDaysNeededForGoal(20, 15, 50)).toBe(0);
  });
});

describe('getEffectiveWorkingDays', () => {
  it('subtracts absences from total', () => {
    expect(getEffectiveWorkingDays(20, 3)).toBe(17);
  });

  it('does not go below 0', () => {
    expect(getEffectiveWorkingDays(5, 10)).toBe(0);
  });

  it('returns full total when no absences', () => {
    expect(getEffectiveWorkingDays(20, 0)).toBe(20);
  });
});

describe('formatDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date(2023, 3, 5))).toBe('2023-04-05');
  });

  it('pads single-digit months and days', () => {
    expect(formatDateKey(new Date(2023, 0, 1))).toBe('2023-01-01');
  });
});
