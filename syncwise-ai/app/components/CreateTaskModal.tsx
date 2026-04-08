'use client';

import { useState, useEffect } from 'react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, deadline?: string, points?: number) => Promise<void>;
  isCreating?: boolean;
  error?: string | null;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
  error = null,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [points, setPoints] = useState('10');
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDeadline('');
      setPoints('10');
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setLocalError('Task title is required');
      return;
    }

    try {
      setLocalError(null);
      await onCreate(title, deadline || undefined, parseInt(points) || 10);
      // Reset form only after successful creation
      setTitle('');
      setDeadline('');
      setPoints('10');
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create task');
    }
  };

  if (!isOpen) return null;

  const displayError = localError || error;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => {
        // Only close if clicking the backdrop itself, not the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative rounded-xl p-6 space-y-4 max-w-md w-full mx-4 animation-scale-in"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Create New Task
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isCreating}
            className="text-2xl leading-none transition-opacity hover:opacity-60 disabled:opacity-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setLocalError(null); // Clear error when user types
              }}
              placeholder="e.g., Design new landing page"
              disabled={isCreating}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                caretColor: 'var(--accent-success)',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--accent-success)';
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--border)';
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.04)';
              }}
              autoFocus
            />
          </div>

          {/* Deadline */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isCreating}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* Points */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Points (1-100)
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              max="100"
              disabled={isCreating}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* Error */}
          {displayError && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {displayError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent-success)',
                color: '#0b0b0f',
                cursor: isCreating || !title.trim() ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isCreating && title.trim()) {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              disabled={isCreating}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                cursor: isCreating ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isCreating) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.04)';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
