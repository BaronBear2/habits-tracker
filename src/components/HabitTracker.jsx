"use client";
import { useState, useEffect, useCallback } from "react";
import HabitList from "./HabitList";
import CalendarGrid from "./CalendarGrid";
import { formatDateLocal } from "./utils";

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error("Failed to fetch habits.");
      const data = await res.json();
      setHabits(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data.id);
      } else if (data.length === 0) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  async function addHabit(name) {
    if (!name.trim()) return;
    try {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setNewName("");
      await loadHabits();
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  }

  // --- DELETE SINGLE HABIT WITH CONFIRMATION ---
  async function deleteHabit(id) {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await fetch(`/api/habits/${id}`, { method: "DELETE" });
        setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
        if (id === selectedId) {
          setSelectedId(null);
        }
      } catch (error) {
        console.error("Failed to delete habit:", error);
        loadHabits();
      }
    }
  }

  // --- DELETE ALL HABITS WITH CONFIRMATION MODAL ---
  async function deleteAllHabits() {
    try {
      const res = await fetch("/api/habits/all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete all habits.");
      setHabits([]);
      setSelectedId(null);
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Failed to delete all habits:", error);
    }
  }

  // --- INSTANT CLIENT-SIDE UPDATE FOR TOGGLE ---
  async function toggleDay(dateStr) {
    if (!selectedId) return;
    setHabits(prevHabits =>
      prevHabits.map(h => {
        if (h.id === selectedId) {
          const isDone = h.records.some(r => r.date === dateStr);
          const updatedRecords = isDone
            ? h.records.filter(r => r.date !== dateStr)
            : [...h.records, { date: dateStr }];
          return { ...h, records: updatedRecords };
        }
        return h;
      })
    );
    try {
      await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: selectedId, date: dateStr }),
      });
    } catch (error) {
      console.error("Failed to toggle day:", error);
      loadHabits();
    }
  }

  // --- CORRECTED STREAK CALCULATION (TIMEZONE INDEPENDENT) ---
  const computeStreak = (habit) => {
    if (!habit || !habit.records || habit.records.length === 0) {
      return 0;
    }

    const records = new Set(habit.records.map(r => r.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Loop backwards from today
    while (true) {
      const dateString = formatDateLocal(currentDate);
      if (records.has(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If today is a "grey" day, the streak is 0 unless a previous day was green
        if (streak === 0) {
          return 0;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const selectedHabit = habits.find((h) => h.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 sm:p-12 lg:p-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Habit Streak Tracker</h1>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              className="flex-grow p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New habit"
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
              onClick={() => addHabit(newName)}
            >
              Add
            </button>
          </div>
        </header>

        {loading && <p className="text-center text-gray-500">Loading habits...</p>}

        {!loading && habits.length === 0 && (
          <p className="text-center text-gray-500">No habits added yet. Start by adding one!</p>
        )}

        {!loading && habits.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <HabitList habits={habits} selectedId={selectedId} onSelect={setSelectedId} />
            <div className="flex-1 space-y-6">
              {selectedHabit && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-2xl font-semibold">
                      <span role="img" aria-label="fire">🔥</span> Streak: {computeStreak(selectedHabit)} days
                    </p>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 active:bg-orange-700 transition-colors duration-200"
                        onClick={() => deleteHabit(selectedHabit.id)}
                      >
                        Delete Habit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 active:bg-red-800 transition-colors duration-200"
                        onClick={() => setShowConfirmModal(true)}
                      >
                        Delete All Habits
                      </button>
                    </div>
                  </div>
                  <CalendarGrid habit={selectedHabit} onToggle={toggleDay} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
            <p className="mb-4">This action will delete all habits and cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={deleteAllHabits}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
