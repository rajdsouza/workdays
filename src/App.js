import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initStorage, DAY_TYPES } from './api/storage';
import {
  getWorkingDaysInMonth,
  getRemainingWorkingDays,
  calculateAttendancePercentage,
  getDaysNeededForGoal,
  getEffectiveWorkingDays,
  formatDateKey,
} from './api/dataLayer';
import './App.css';

const DEFAULT_GOAL = 50;
const GOAL_OPTIONS = [30, 40, 50, 60, 70, 80];
const LS_GOAL_KEY = 'workdays_goal';

function loadGoal() {
  try {
    const val = parseInt(localStorage.getItem(LS_GOAL_KEY), 10);
    return GOAL_OPTIONS.includes(val) ? val : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

function saveGoal(val) {
  localStorage.setItem(LS_GOAL_KEY, String(val));
}

const TYPE_LABELS = {
  office: 'Office',
  sick: 'Sick',
  annual_leave: 'Leave',
  other: 'Other',
};

const ABSENCE_TYPES = DAY_TYPES.filter(t => t !== 'office');

function ProgressRing({ percentage, goal, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const color = percentage >= goal ? '#4caf50' : '#ff9800';

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="progress-text"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

function GoalPicker({ goal, onChange }) {
  const [open, setOpen] = useState(false);
  const met = false; // handled by parent

  return (
    <div className="goal-picker-wrap">
      <button
        className="goal-picker-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={`Goal: ${goal}%. Tap to change.`}
      >
        Goal: {goal}%
      </button>
      {open && (
        <div className="goal-picker-options">
          {GOAL_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`goal-option ${opt === goal ? 'goal-option-active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ percentage, goal }) {
  const met = percentage >= goal;
  return (
    <span className={`status-badge ${met ? 'status-met' : 'status-needs'}`}>
      {met ? 'Goal Met' : 'Needs Attention'}
    </span>
  );
}

function DayCell({ dateKey, date, type, isFuture, isCurrentMonth, onTap, onLongPress }) {
  const timerRef = useRef(null);
  const longFired = useRef(false);
  const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
  const dayNum = date.getDate();
  const typeClass = type ? `day-${type}` : 'day-empty';
  const futureClass = isFuture && isCurrentMonth ? 'day-future' : '';

  const startPress = useCallback((e) => {
    e.preventDefault();
    longFired.current = false;
    timerRef.current = setTimeout(() => {
      longFired.current = true;
      onLongPress(dateKey);
    }, 500);
  }, [dateKey, onLongPress]);

  const endPress = useCallback(() => {
    clearTimeout(timerRef.current);
    if (!longFired.current) {
      onTap(dateKey, type);
    }
  }, [dateKey, type, onTap]);

  const cancelPress = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      className={`day-cell day-clickable ${typeClass} ${futureClass}`}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTap(dateKey, type); }}
      aria-label={`${dayName} ${dayNum} — ${type ? TYPE_LABELS[type] : 'unmarked'}`}
    >
      <span className="day-num">{dayNum}</span>
      <span className="day-name">{dayName}</span>
      {type && <span className="day-type-label">{TYPE_LABELS[type]}</span>}
    </div>
  );
}

function MonthCalendar({ workingDays, entries, onTap, onLongPress, isCurrentMonth }) {
  const entryMap = {};
  entries.forEach(e => { entryMap[e.date] = e.type; });
  const today = formatDateKey(new Date());

  return (
    <div className="days-grid">
      {workingDays.map(d => {
        const key = formatDateKey(d);
        return (
          <DayCell
            key={key}
            dateKey={key}
            date={d}
            type={entryMap[key] || null}
            isFuture={key > today}
            isCurrentMonth={isCurrentMonth}
            onTap={onTap}
            onLongPress={onLongPress}
          />
        );
      })}
    </div>
  );
}

function AbsenceModal({ startDate, workingDays, onConfirm, onCancel }) {
  const [selectedType, setSelectedType] = useState('sick');
  const [dayCount, setDayCount] = useState(1);

  const startIdx = workingDays.findIndex(d => formatDateKey(d) === startDate);
  const maxDays = startIdx >= 0 ? workingDays.length - startIdx : 1;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Mark absence from {startDate}</h3>

        <div className="modal-field">
          <label>Type</label>
          <div className="modal-type-options">
            {ABSENCE_TYPES.map(t => (
              <button
                key={t}
                className={`modal-type-btn ${t === selectedType ? 'modal-type-active' : ''} modal-type-${t}`}
                onClick={() => setSelectedType(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label>Working days</label>
          <div className="modal-count-row">
            <button
              className="modal-count-btn"
              onClick={() => setDayCount(c => Math.max(1, c - 1))}
              disabled={dayCount <= 1}
            >&minus;</button>
            <span className="modal-count-value">{dayCount}</span>
            <button
              className="modal-count-btn"
              onClick={() => setDayCount(c => Math.min(maxDays, c + 1))}
              disabled={dayCount >= maxDays}
            >+</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-confirm" onClick={() => onConfirm(selectedType, dayCount)}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      <span className="legend-item"><span className="legend-dot dot-office" />Office</span>
      <span className="legend-item"><span className="legend-dot dot-sick" />Sick</span>
      <span className="legend-item"><span className="legend-dot dot-leave" />Leave</span>
      <span className="legend-item"><span className="legend-dot dot-other" />Other</span>
    </div>
  );
}

function useSwipe(onSwipeLeft, onSwipeRight) {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minDistance = 50;

  const onTouchStart = useCallback((e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) >= minDistance) {
      if (distance > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [goalPercent, setGoalPercent] = useState(loadGoal);

  const handleGoalChange = useCallback((val) => {
    setGoalPercent(val);
    saveGoal(val);
  }, []);

  const now = new Date();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const allWorkingDays = getWorkingDaysInMonth(viewYear, viewMonth);
  const remainingWorkingDays = isCurrentMonth
    ? getRemainingWorkingDays(viewYear, viewMonth)
    : [];

  const officeDayCount = entries.filter(e => e.type === 'office').length;
  const absenceCount = entries.filter(e => e.type !== 'office').length;
  const effectiveTotal = getEffectiveWorkingDays(allWorkingDays.length, absenceCount);

  const percentage = calculateAttendancePercentage(effectiveTotal, officeDayCount);
  const targetOfficeDays = Math.ceil((goalPercent / 100) * effectiveTotal);
  const daysNeeded = getDaysNeededForGoal(effectiveTotal, officeDayCount, goalPercent);

  const loadEntries = useCallback((store) => {
    const data = store.getEntriesForMonth(viewYear, viewMonth);
    setEntries(data);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (storage) {
      loadEntries(storage);
    }
  }, [storage, loadEntries]);

  useEffect(() => {
    initStorage().then(store => {
      setStorage(store);
      setLoading(false);
    });
  }, []);

  const [absenceModal, setAbsenceModal] = useState(null); // { startDate }

  const handleTap = useCallback((dateStr, currentType) => {
    if (!storage) return;
    if (currentType) {
      storage.removeDay(dateStr);
    } else {
      storage.setDay(dateStr, 'office');
    }
    loadEntries(storage);
  }, [storage, loadEntries]);

  const handleLongPress = useCallback((dateStr) => {
    setAbsenceModal({ startDate: dateStr });
  }, []);

  const handleAbsenceConfirm = useCallback((type, count) => {
    if (!storage || !absenceModal) return;
    const startIdx = allWorkingDays.findIndex(d => formatDateKey(d) === absenceModal.startDate);
    if (startIdx < 0) return;
    for (let i = 0; i < count && startIdx + i < allWorkingDays.length; i++) {
      const key = formatDateKey(allWorkingDays[startIdx + i]);
      storage.setDay(key, type);
    }
    setAbsenceModal(null);
    loadEntries(storage);
  }, [storage, absenceModal, allWorkingDays, loadEntries]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) {
        setViewYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) {
        setViewYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }, [now]);

  const swipeHandlers = useSwipe(goToNextMonth, goToPrevMonth);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" {...swipeHandlers}>
      <header className="header">
        <h1>Workdays</h1>
        {!isCurrentMonth && (
          <button className="today-btn" onClick={goToToday}>Today</button>
        )}
      </header>

      <section className="month-nav">
        <button className="nav-btn" onClick={goToPrevMonth} aria-label="Previous month">&larr;</button>
        <h2>{monthLabel}</h2>
        <button className="nav-btn" onClick={goToNextMonth} aria-label="Next month">&rarr;</button>
      </section>

      <section className="summary-section">
        <ProgressRing percentage={percentage} goal={goalPercent} />
        <StatusBadge percentage={percentage} goal={goalPercent} />
        <GoalPicker goal={goalPercent} onChange={handleGoalChange} />
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <span className="stat-value">{officeDayCount}</span>
          <span className="stat-label">Office</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{absenceCount}</span>
          <span className="stat-label">Absences</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{effectiveTotal}</span>
          <span className="stat-label">Required Days</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{targetOfficeDays}</span>
          <span className="stat-label">Days Needed</span>
        </div>
      </section>

      {daysNeeded > 0 && (
        <section className="goal-section">
          <p>
            You need <strong>{daysNeeded}</strong> more office day{daysNeeded !== 1 ? 's' : ''} to reach {goalPercent}%.
            {isCurrentMonth && (
              <>{' '}
              {daysNeeded > remainingWorkingDays.length
                ? 'Not enough working days remaining.'
                : `${remainingWorkingDays.length} working day${remainingWorkingDays.length !== 1 ? 's' : ''} left.`}
              </>
            )}
          </p>
        </section>
      )}

      <section className="log-section">
        <h3>Tap: Office / Clear &bull; Long press: Absences</h3>
        <Legend />
        <MonthCalendar
          workingDays={allWorkingDays}
          entries={entries}
          onTap={handleTap}
          onLongPress={handleLongPress}
          isCurrentMonth={isCurrentMonth}
        />
      </section>

      {absenceModal && (
        <AbsenceModal
          startDate={absenceModal.startDate}
          workingDays={allWorkingDays}
          onConfirm={handleAbsenceConfirm}
          onCancel={() => setAbsenceModal(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <Dashboard />
    </div>
  );
}

export default App;
