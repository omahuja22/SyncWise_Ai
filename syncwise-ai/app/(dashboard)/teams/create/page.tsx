'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/hooks/useCreateTeam';
import { motion } from 'framer-motion';

export default function CreateTeamPage() {
  const router = useRouter();
  const { loading, error, team, createTeamHandler, resetError } = useCreateTeam();
  const [teamName, setTeamName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    resetError();

    if (!teamName.trim()) {
      setFormError('Team name is required');
      return;
    }

    try {
      const newTeam = await createTeamHandler(teamName);
      
      // Redirect to dashboard with team ID
      router.push(`/dashboard?team=${newTeam.id}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create team';
      setFormError(errorMessage);
      console.error('❌ [CreateTeamPage] Submit error:', errorMessage);
    }
  };

  const displayError = formError || error;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Create Team
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Start collaborating with your team
        </p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg p-6 max-w-md"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name Input */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Team Name *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g., Engineering, Product, Design"
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-success)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
              autoFocus
            />
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              This can be changed later
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              ❌ {displayError}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--foreground)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? 'rgba(34, 197, 94, 0.6)' : 'var(--accent-success)',
                color: loading ? 'rgba(255, 255, 255, 0.7)' : '#0b0b0f',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                '✓ Create Team'
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Info Box */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <p className="font-medium mb-1">ℹ️ What happens next?</p>
        <ul className="space-y-1 text-xs" style={{ color: 'rgba(96, 165, 250, 0.9)' }}>
          <li>• You'll become the team leader</li>
          <li>• You can invite members later</li>
          <li>• Team data is private and secure</li>
        </ul>
      </div>
    </div>
  );
}
