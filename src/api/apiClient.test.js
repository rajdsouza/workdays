import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { setAuthToken, clearAuthToken, fetchCalendarEvents } from './apiClient';

describe('apiClient', () => {
  it('sets and clears auth token correctly', () => {
    setAuthToken('token123');
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer token123');

    clearAuthToken();
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
  });
});

describe('fetchCalendarEvents', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('fetches and returns events data', async () => {
    const fakeEvents = { events: [{ id: 1, summary: 'Test Event' }] };
    mock.onGet(/\/calendars\/primary\/events/).reply(200, fakeEvents);

    const events = await fetchCalendarEvents();
    expect(events).toEqual(fakeEvents.events);
  });

  it('throws error when fetch fails', async () => {
    mock.onGet(/\/calendars\/primary\/events/).reply(500);
    await expect(fetchCalendarEvents()).rejects.toThrow();
  });
});
