import { formatDateLocal } from "./utils";
import { useState } from "react";

export default function CalendarGrid({ habit, onToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!habit) return <div className="p-4 text-center text-gray-500">Select a habit to see the calendar.</div>;

  const records = new Set(habit.records.map((r) => r.date));
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const prevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  return (
    <div className="calendar">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold">{monthName} {year}</h2>
        <button onClick={nextMonth} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {/* Fill in leading empty days */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 w-10"></div>
        ))}
        {/* Render days of the month */}
        {days.map((d) => {
          const key = formatDateLocal(d);
          const done = records.has(key);
          return (
            <div
              key={key}
              className={`
                flex items-center justify-center h-10 w-10
                rounded-md text-sm font-medium transition-colors cursor-pointer
                ${done ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"}
                hover:opacity-75
              `}
              onClick={() => onToggle(key)}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
