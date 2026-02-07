import { getOfficeDays, calculateAttendancePercentage } from './dataLayer';

const mockEvents = [
  { start: { date: '2023-04-03' }, summary: 'Office Work' },
  { start: { dateTime: '2023-04-04T09:00:00Z' }, summary: 'Office Meeting' },
  { start: { date: '2023-04-05' }, summary: 'Home Office' },
  { start: { date: '2023-04-06' }, summary: 'Remote Work' },
];

describe('getOfficeDays', () => {
  it('returns sorted unique office days', async () => {
    const fetchCalendarEvents = jest.fn().mockResolvedValue(mockEvents);
    // Temporarily replace the real import with a mock
    jest.mock('./apiClient', () => ({ fetchCalendarEvents }));
    const officeDays = await getOfficeDays('calId', 'start', 'end');
    expect(officeDays).toEqual(['4/3/2023', '4/4/2023', '4/5/2023']);
  });
});

describe('calculateAttendancePercentage', () => {
  it('returns 0 if total working days is 0', () => {
    expect(calculateAttendancePercentage(0, 5)).toBe(0);
  });

  it('calculates percentage correctly', () => {
    expect(calculateAttendancePercentage(10, 5)).toBe(50);
  });
});
