const LS_DB_KEY = 'workdays_db';
const LS_FALLBACK_KEY = 'workdays_entries';
const SQL_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-wasm.js';
const SQL_WASM_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-wasm.wasm';

// Valid day types
export const DAY_TYPES = ['office', 'sick', 'annual_leave', 'other'];

export function createLocalStorageFallback() {
  // entries stored as [{date, type}]
  function load() {
    try {
      return JSON.parse(localStorage.getItem(LS_FALLBACK_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(entries) {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(entries));
  }

  return {
    setDay(dateStr, type) {
      const entries = load().filter(e => e.date !== dateStr);
      entries.push({ date: dateStr, type });
      save(entries);
    },
    removeDay(dateStr) {
      save(load().filter(e => e.date !== dateStr));
    },
    getEntriesForMonth(year, month) {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      return load()
        .filter(e => e.date.startsWith(prefix))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function persistDb(db) {
  try {
    const data = db.export();
    const encoded = btoa(String.fromCharCode(...data));
    localStorage.setItem(LS_DB_KEY, encoded);
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

function loadSavedDb() {
  try {
    const encoded = localStorage.getItem(LS_DB_KEY);
    if (!encoded) return null;
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

export async function initStorage() {
  try {
    await loadScript(SQL_JS_CDN);
    const initSqlJs = window.initSqlJs;
    if (!initSqlJs) throw new Error('sql.js not loaded');

    const SQL = await initSqlJs({
      locateFile: () => SQL_WASM_CDN,
    });

    const savedData = loadSavedDb();
    const db = savedData ? new SQL.Database(savedData) : new SQL.Database();

    db.run(
      'CREATE TABLE IF NOT EXISTS day_entries (date TEXT PRIMARY KEY, type TEXT NOT NULL)'
    );

    return {
      setDay(dateStr, type) {
        db.run(
          'INSERT INTO day_entries (date, type) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET type = ?',
          [dateStr, type, type]
        );
        persistDb(db);
      },
      removeDay(dateStr) {
        db.run('DELETE FROM day_entries WHERE date = ?', [dateStr]);
        persistDb(db);
      },
      getEntriesForMonth(year, month) {
        const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const end = `${year}-${String(month + 1).padStart(2, '0')}-31`;
        const result = db.exec(
          'SELECT date, type FROM day_entries WHERE date >= ? AND date <= ? ORDER BY date',
          [start, end]
        );
        if (!result.length) return [];
        return result[0].values.map(row => ({ date: row[0], type: row[1] }));
      },
    };
  } catch {
    return createLocalStorageFallback();
  }
}
