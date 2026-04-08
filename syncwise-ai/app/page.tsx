"use client";

import { useTasks } from "@/hooks/useTasks";

export default function Home() {
  const { tasks, loading, error } = useTasks();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">
        Tasks Overview
      </h1>

      {loading && (
        <p className="text-zinc-400 animate-pulse">Loading tasks...</p>
      )}

      {error && (
        <p className="text-red-500">Error: {error}</p>
      )}

      {!loading && tasks.length === 0 && (
        <p className="text-zinc-500">
          No tasks yet. Create your first task 🚀
        </p>
      )}

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                {task.title}
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  task.status === "Done"
                    ? "bg-green-500/20 text-green-400"
                    : task.status === "In Progress"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-zinc-500/20 text-zinc-400"
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-sm text-zinc-400 mt-2">
              Deadline:{" "}
              {task.deadline
                ? new Date(task.deadline).toLocaleString()
                : "No deadline"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}