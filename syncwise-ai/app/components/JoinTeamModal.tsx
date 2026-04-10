'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { joinTeamByCode } from '@/services/teamService';
import { useTeams } from '@/app/contexts/TeamContext';

export default function JoinTeamModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { addTeam } = useTeams();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      console.log('🔹 [JoinTeamModal] Joining team with code:', joinCode);

      const team = await joinTeamByCode(joinCode);
      console.log('✅ [JoinTeamModal] Successfully joined team:', team.name);

      // Refresh team context
      await addTeam(team.name);

      setSuccess(`✅ Successfully joined: ${team.name}`);
      setJoinCode('');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to join team';
      console.error('❌ [JoinTeamModal] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-slate-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Join Team by Code
        </h2>

        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Ask your team leader for a 6-character join code to join their team instantly.
        </p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded bg-red-900/20 border border-red-700/50 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded bg-green-900/20 border border-green-700/50 text-green-400 text-sm"
          >
            {success}
          </motion.div>
        )}

        {/* Input */}
        <input
          type="text"
          placeholder="Enter join code (e.g., ABC123)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 rounded-lg mb-6 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          maxLength={6}
          disabled={loading}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
