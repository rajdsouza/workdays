import { createLocalStorageFallback } from './storage';

describe('storage (localStorage fallback)', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    store = createLocalStorageFallback();
  });

  it('sets and retrieves day entries', () => {
    store.setDay('2023-04-03', 'office');
    store.setDay('2023-04-05', 'sick');

    const entries = store.getEntriesForMonth(2023, 3);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ date: '2023-04-03', type: 'office' });
    expect(entries[1]).toEqual({ date: '2023-04-05', type: 'sick' });
  });

  it('overwrites type when setting same date again', () => {
    store.setDay('2023-04-03', 'office');
    store.setDay('2023-04-03', 'sick');

    const entries = store.getEntriesForMonth(2023, 3);
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('sick');
  });

  it('removes day entries', () => {
    store.setDay('2023-04-03', 'office');
    store.removeDay('2023-04-03');

    const entries = store.getEntriesForMonth(2023, 3);
    expect(entries).toHaveLength(0);
  });

  it('returns empty array for months with no data', () => {
    const entries = store.getEntriesForMonth(2023, 5);
    expect(entries).toEqual([]);
  });

  it('only returns entries for the requested month', () => {
    store.setDay('2023-04-03', 'office');
    store.setDay('2023-05-01', 'annual_leave');

    const april = store.getEntriesForMonth(2023, 3);
    expect(april).toEqual([{ date: '2023-04-03', type: 'office' }]);

    const may = store.getEntriesForMonth(2023, 4);
    expect(may).toEqual([{ date: '2023-05-01', type: 'annual_leave' }]);
  });

  it('persists data across instances', () => {
    store.setDay('2023-04-03', 'other');

    const store2 = createLocalStorageFallback();
    const entries = store2.getEntriesForMonth(2023, 3);
    expect(entries).toEqual([{ date: '2023-04-03', type: 'other' }]);
  });

  it('supports all day types', () => {
    store.setDay('2023-04-03', 'office');
    store.setDay('2023-04-04', 'sick');
    store.setDay('2023-04-05', 'annual_leave');
    store.setDay('2023-04-06', 'other');

    const entries = store.getEntriesForMonth(2023, 3);
    expect(entries).toHaveLength(4);
    expect(entries.map(e => e.type)).toEqual(['office', 'sick', 'annual_leave', 'other']);
  });
});
