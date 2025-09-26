export default function HabitList({ habits, selectedId, onSelect }) {
  return (
    <ul className="w-full sm:w-64 space-y-2">
      {habits.map((habit) => (
        <li
          key={habit.id}
          onClick={() => onSelect(habit.id)}
          className={`
            p-4 rounded-lg shadow-sm cursor-pointer transition-colors
            ${habit.id === selectedId
              ? "bg-blue-600 text-white font-semibold"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            }
          `}
        >
          {habit.name}
        </li>
      ))}
    </ul>
  );
}