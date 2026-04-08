'use client';

import { useState } from 'react';
import { dummyTasks, Task, TaskStatus } from '@/app/data/tasks';
import TaskCard from './TaskCard';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Cycle status: pending → in-progress → done → pending
  const handleStatusChange = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const statusCycle: Record<TaskStatus, TaskStatus> = {
            pending: 'in-progress',
            'in-progress': 'done',
            done: 'pending',
          };
          return { ...task, status: statusCycle[task.status] };
        }
        return task;
      })
    );
  };

  // Add new task
  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTask: Task = {
      id: String(tasks.length + 1),
      title: newTaskTitle,
      assignedTo: {
        name: 'Unassigned',
        avatar: 'U',
      },
      status: 'pending',
      points: 5,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Tasks
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            {tasks.length} total • {pendingCount} pending • {inProgressCount}{' '}
            in progress • {doneCount} done
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: 'var(--accent-success)',
            color: '#0b0b0f',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {showAddTask ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      {/* Add Task Input */}
      {showAddTask && (
        <div
          className="rounded-lg p-4 space-y-3"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--accent-success)',
          }}
        >
          <label
            style={{ color: 'var(--text-secondary)' }}
            className="text-sm font-medium"
          >
            Task Title
          </label>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
            placeholder="Enter task title..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            autoFocus
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              caretColor: 'var(--accent-success)',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                'var(--accent-success)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                'var(--border)';
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={newTaskTitle.trim() === ''}
              className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'var(--accent-success)',
                color: '#0b0b0f',
                opacity: newTaskTitle.trim() === '' ? 0.5 : 1,
                cursor: newTaskTitle.trim() === '' ? 'not-allowed' : 'pointer',
              }}
            >
              Create Task
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTaskTitle('');
              }}
              className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.04)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
