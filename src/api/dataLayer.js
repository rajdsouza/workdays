export const getWorkingDaysInMonth = (year, month) => {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getWorkingDaysUpToToday = (year, month) => {
  const today = new Date();
  return getWorkingDaysInMonth(year, month).filter(d => d <= today);
};

export const getRemainingWorkingDays = (year, month) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getWorkingDaysInMonth(year, month).filter(d => d > today);
};

export const calculateAttendancePercentage = (totalWorkingDays, actualOfficeDays) => {
  if (totalWorkingDays === 0) return 0;
  return (actualOfficeDays / totalWorkingDays) * 100;
};

export const getDaysNeededForGoal = (totalWorkingDays, currentOfficeDays, goalPercent = 50) => {
  const needed = Math.ceil((goalPercent / 100) * totalWorkingDays);
  return Math.max(0, needed - currentOfficeDays);
};

export const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Absences (sick, annual_leave, other) reduce the required working days
export const getEffectiveWorkingDays = (totalWorkingDays, absenceCount) => {
  return Math.max(0, totalWorkingDays - absenceCount);
};
