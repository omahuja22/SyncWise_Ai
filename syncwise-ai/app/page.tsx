"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const { data, error } = await supabase.from("tasks").select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (data) setTasks(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length === 0 && (
        <p>No tasks found (but connection is working ✅)</p>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border border-white/10 rounded-lg bg-white/5"
            >
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-zinc-400">{task.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}