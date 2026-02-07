// src/api/dataLayer.js
import { fetchCalendarEvents } from './apiClient';

const OFFICE_KEYWORD = 'Office';

export const getOfficeDays = async (calendarId, timeMin, timeMax) => {
  const events = await fetchCalendarEvents(calendarId, timeMin, timeMax);
  
  // Use a Set to count unique days only
  const uniqueDays = new Set();

  events.forEach(event => {
    if (event.summary && event.summary.includes(OFFICE_KEYWORD)) {
      // Extract date component based on local time to avoid timezone bugs
      const eventDate = new Date(event.start.date || event.start.dateTime).toLocaleDateString();
      uniqueDays.add(eventDate);
    }
  });

  return Array.from(uniqueDays).sort();
};

export const calculateAttendancePercentage = (totalWorkingDays, actualOfficeDays) => {
  if (totalWorkingDays === 0) return 0;
  return (actualOfficeDays / totalWorkingDays) * 100;
};
