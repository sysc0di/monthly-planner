"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: string;
}

interface TasksData {
  [date: string]: Task[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatTime24(time?: string): string {
  if (!time) return "--:--";
  return time.substring(0, 5);
}

function getTimeOfDay(time?: string): "morning" | "afternoon" | "evening" {
  if (!time) return "morning";
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TimeInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [hours, minutes] = value ? value.split(":") : ["09", "00"];
  
  return (
    <div className="time-input-group">
      <label className="form-label">{label}</label>
      <div className="time-input-wrapper">
        <input
          type="number"
          min="0"
          max="23"
          className="time-input"
          value={parseInt(hours)}
          onChange={(e) => {
            const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
            onChange(`${h.toString().padStart(2, "0")}:${minutes}`);
          }}
        />
        <span className="time-separator">:</span>
        <input
          type="number"
          min="0"
          max="59"
          className="time-input"
          value={parseInt(minutes)}
          onChange={(e) => {
            const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
            onChange(`${hours}:${m.toString().padStart(2, "0")}`);
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TasksData>({});
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStartTime, setNewTaskStartTime] = useState("09:00");
  const [newTaskEndTime, setNewTaskEndTime] = useState("10:00");

  useEffect(() => {
    const now = new Date();
    setMounted(true);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    
    const stored = localStorage.getItem("monthlyPlannerTasks");
    if (stored) {
      const parsed = JSON.parse(stored);
      const migrated = migrateTasks(parsed);
      setTasks(migrated);
    }
  }, []);

  function migrateTasks(data: TasksData): TasksData {
    const migrated: TasksData = {};
    for (const [date, dateTasks] of Object.entries(data)) {
      migrated[date] = dateTasks.map((task) => {
        const t = task as any;
        if (t.timeSlot && !t.startTime) {
          return {
            id: t.id,
            title: t.title,
            startTime: t.timeSlot,
            endTime: t.timeSlot,
            completed: t.completed,
            createdAt: t.createdAt,
          };
        }
        return task;
      });
    }
    return migrated;
  }

  useEffect(() => {
    if (mounted && Object.keys(tasks).length > 0) {
      localStorage.setItem("monthlyPlannerTasks", JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const calendarDays = useMemo(() => {
    const year = currentYear ?? 2026;
    const month = currentMonth ?? 2;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: Date[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentYear, currentMonth]);

  const todayKey = useMemo(() => mounted ? formatDateKey(new Date()) : null, [mounted]);

  const navigateMonth = useCallback((delta: number) => {
    if (currentYear === null || currentMonth === null) return;
    const newDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());
  }, [currentYear, currentMonth]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDateKey(date));
    setIsModalOpen(true);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      startTime: newTaskStartTime,
      endTime: newTaskEndTime,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updated = [...dayTasks, newTask].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      return { ...prev, [selectedDate]: updated };
    });

    setNewTaskTitle("");
  };

  const toggleTaskComplete = (taskId: string) => {
    if (!selectedDate) return;

    setTasks((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    if (!selectedDate) return;

    setTasks((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((task) => task.id !== taskId),
    }));
  };

  const selectedDateTasks = selectedDate ? (tasks[selectedDate] || []) : [];

  const groupedTasks = useMemo(() => {
    const groups: { morning: Task[]; afternoon: Task[]; evening: Task[] } = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    selectedDateTasks.forEach((task) => {
      const tod = getTimeOfDay(task.startTime);
      groups[tod].push(task);
    });

    return groups;
  }, [selectedDateTasks]);

  const getTaskPreviews = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    const dayTasks = tasks[dateKey] || [];
    return dayTasks.slice(0, 2).map((t) => ({
      time: t.startTime,
      title: t.title,
      tod: getTimeOfDay(t.startTime),
    }));
  }, [tasks]);

  const getTaskCount = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    return tasks[dateKey]?.length || 0;
  }, [tasks]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }, [selectedDate]);

  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === (currentMonth ?? 2);
  }, [currentMonth]);

  if (!mounted) {
    return (
      <div className="app">
        <div className="calendar">
          <div className="weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="days-grid">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="day-cell" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const year = currentYear ?? 2026;
  const month = currentMonth ?? 2;
  const monthName = MONTHS[month];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              &#8249;
            </button>
            <button className="nav-btn today-btn" onClick={goToToday}>
              Today
            </button>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              &#8250;
            </button>
          </div>
          <h1 className="month-title">
            {monthName} {year}
          </h1>
        </div>
        <button
          className="add-btn"
          onClick={() => {
            const now = new Date();
            setSelectedDate(formatDateKey(now));
            setIsModalOpen(true);
          }}
        >
          <span>+</span> Add Task
        </button>
      </header>

      <div className="calendar">
        <div className="weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="days-grid">
          {calendarDays.map((date, index) => {
            const isThisCurrentMonth = isCurrentMonth(date);
            const dateKey = formatDateKey(date);
            const previews = getTaskPreviews(date);
            const taskCount = getTaskCount(date);
            const isToday = dateKey === todayKey;

            return (
              <div
                key={index}
                className={`day-cell ${!isThisCurrentMonth ? "other-month" : ""} ${
                  isToday ? "today" : ""
                }`}
                onClick={() => handleDayClick(date)}
              >
                <span className="day-number">{date.getDate()}</span>
                <div className="task-preview">
                  {previews.map((preview, i) => (
                    <div key={i} className={`task-preview-item ${preview.tod}`}>
                      {preview.title}
                    </div>
                  ))}
                </div>
                {taskCount > 2 && (
                  <span className="task-badge">+{taskCount - 2}</span>
                )}
                {taskCount === 0 && isThisCurrentMonth && (
                  <span className="empty-day">No tasks</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedDateLabel}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form className="add-task-form" onSubmit={handleAddTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter task name..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="time-range-group">
                  <TimeInput
                    label="Start"
                    value={newTaskStartTime}
                    onChange={setNewTaskStartTime}
                  />
                  <span className="time-range-sep">to</span>
                  <TimeInput
                    label="End"
                    value={newTaskEndTime}
                    onChange={setNewTaskEndTime}
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Add Task
                </button>
              </form>

              {selectedDateTasks.length === 0 ? (
                <div className="no-tasks">
                  <div className="no-tasks-icon">&#9745;</div>
                  <p className="no-tasks-text">No tasks for this day</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {(["morning", "afternoon", "evening"] as const).map((period) => {
                    const periodTasks = groupedTasks[period];
                    if (periodTasks.length === 0) return null;

                    return (
                      <div key={period} className="tasks-section">
                        <h3 className={`tasks-section-title ${period}`}>
                          <span className={`section-dot ${period}`}></span>
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </h3>
                        {periodTasks.map((task) => (
                          <div key={task.id} className="task-item">
                            <button
                              className={`task-checkbox ${
                                task.completed ? "checked" : ""
                              }`}
                              onClick={() => toggleTaskComplete(task.id)}
                            >
                              {task.completed && (
                                <span className="checkmark">&#10003;</span>
                              )}
                            </button>
                            <div className="task-content">
                              <div
                                className={`task-title ${
                                  task.completed ? "completed" : ""
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="task-time">
                                {formatTime24(task.startTime)} - {formatTime24(task.endTime)}
                              </div>
                            </div>
                            <div className="task-actions">
                              <button
                                className="task-action-btn delete"
                                onClick={() => deleteTask(task.id)}
                              >
                                &#128465;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
