'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

export default function TaskList() {
  const {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    updateStatus,
    isCreating,
    isDeleting,
    isUpdating,
  } = useTasks();
  
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Close modal when task is created successfully (isCreating becomes false without error)
  useEffect(() => {
    if (!isCreating && showModal) {
      // Task was created successfully
      setShowModal(false);
      setSuccessMessage('✓ Task created successfully');
    }
  }, [isCreating, showModal]);

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const handleCreateTask = async (
    title: string,
    deadline?: string,
    points?: number
  ) => {
    try {
      await addTask(title, deadline, points);
    } catch (err) {
      // Error is handled by hook and displayed in modal
      console.error('Task creation error:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Tasks
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm animate-pulse">
              Loading tasks...
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {tasks.length} total • {pendingCount} pending • {inProgressCount}{' '}
              in progress • {doneCount} done
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={isCreating}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent-success)',
            color: '#0b0b0f',
            cursor: isCreating ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isCreating) {
              (e.currentTarget as HTMLElement).style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {isCreating ? '⟳ Loading...' : '+ Add Task'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          className="p-4 rounded-lg text-sm animate-pulse"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div
          className="p-8 rounded-lg text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="mb-3">
            No tasks yet. Create your first task to get started! 🚀
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium px-3 py-1 rounded transition-all"
            style={{
              color: 'var(--accent-success)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-success)',
            }}
          >
            Create Task
          </button>
        </div>
      )}

      {/* Task List */}
      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={() => updateStatus(task.id)}
              onDelete={() => removeTask(task.id)}
              isDeleting={isDeleting === task.id}
              isUpdating={isUpdating === task.id}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateTask}
        isCreating={isCreating}
        error={error}
      />
    </div>
  );
}
