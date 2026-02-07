// src/api/apiClient.js
import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

export const fetchCalendarEvents = async (calendarId = 'primary', timeMin, timeMax) => {
  try {
    const response = await apiClient.get(`/calendars/${encodeURIComponent(calendarId)}/events`, {
      params: {
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      },
    });
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch calendar events', error);
    throw error;
  }
};

export default apiClient;
