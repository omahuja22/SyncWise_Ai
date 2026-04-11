'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeams } from '@/app/contexts/TeamContext';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

export default function TaskList() {
  // ✅ ALL HOOKS AT TOP - Fixed order
  const { selectedTeamId } = useTeams();
  const {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    updateStatus,
    completeTask,
    isCreating,
    isDeleting,
    isUpdating,
  } = useTasks();
  
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const previousTaskCountRef = useRef(0);

  // useEffect 1: Logging
  useEffect(() => {
    console.log('📋 [TaskList] Rendered - selectedTeamId:', selectedTeamId, 'tasks:', tasks.length);
  }, [selectedTeamId, tasks.length]);

  // useEffect 2: Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // useEffect 3: Show success on task creation
  useEffect(() => {
    if (!isCreating && showModal && tasks.length > previousTaskCountRef.current) {
      setSuccessMessage(`✓ Task created (${tasks.length} total)`);
      setShowModal(false);
      previousTaskCountRef.current = tasks.length;
    }
  }, [isCreating, showModal, tasks.length]);

  // useCallback: Task creation handler
  const handleCreateTask = useCallback(async (
    title: string,
    deadline?: string,
    points?: number
  ) => {
    await addTask(title, deadline, points);
  }, [addTask]);

  // ✅ EARLY RETURN AFTER ALL HOOKS
  if (!selectedTeamId) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Tasks
          </h2>
        </div>
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            👈 Select a team in the sidebar to view and manage tasks
          </p>
        </div>
      </div>
    );
  }

  // Calculate counts
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

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
          type="button"
          onClick={(e) => {
            console.log('[TaskList] Add Task button clicked');
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
            console.log('[TaskList] Modal state set to true');
          }}
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
            type="button"
            onClick={(e) => {
              console.log('[TaskList] Create Task button (empty state) clicked');
              e.preventDefault();
              e.stopPropagation();
              setShowModal(true);
              console.log('[TaskList] Modal state set to true');
            }}
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
              onComplete={() => completeTask(task.id)}
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
