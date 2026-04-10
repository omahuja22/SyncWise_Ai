'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeams } from '@/app/contexts/TeamContext';
import Link from 'next/link';

export default function TeamSelector() {
  const { teams, selectedTeam, selectedTeamId, selectTeam, loading } = useTeams();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div
        className="px-4 py-3 rounded-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Loading teams...
        </p>
      </div>
    );
  }

  // If no teams, show create team prompt
  if (teams.length === 0) {
    return (
      <div className="space-y-3">
        <p
          className="text-xs px-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          No teams yet
        </p>
        <Link
          href="/dashboard/teams/create"
          className="block w-full px-4 py-3 rounded-lg text-center text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: 'var(--accent-success)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          + Create Team
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Team Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300"
        style={{
          backgroundColor: isOpen
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isOpen
            ? '1px solid rgba(34, 197, 94, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span className="text-lg">👥</span>
        <div className="flex-1 min-w-0 text-left">
          <p
            className="text-xs truncate transition-colors duration-300"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Team
          </p>
          <p
            className="text-sm font-medium truncate transition-colors duration-300"
            style={{
              color: 'var(--foreground)',
            }}
          >
            {selectedTeam?.name || 'Select a team'}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg flex-shrink-0"
        >
          ⌄
        </motion.span>
      </button>

      {/* Team Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg shadow-lg z-40 space-y-1 p-2"
            style={{
              backgroundColor: 'rgba(11, 11, 15, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  selectTeam(team.id);
                  setIsOpen(false);
                  console.log('✅ [TeamSelector] Team selected:', team.name);
                }}
                className="w-full px-4 py-2 text-left text-sm rounded-md transition-all duration-200"
                style={{
                  backgroundColor:
                    selectedTeamId === team.id
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'transparent',
                  color:
                    selectedTeamId === team.id
                      ? 'var(--accent-success)'
                      : 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  if (selectedTeamId !== team.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTeamId !== team.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{team.name}</p>
                    <p className="text-xs opacity-75">
                      ID: {team.id.slice(0, 8)}...
                    </p>
                  </div>
                  {selectedTeamId === team.id && (
                    <span className="text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}

            {/* Add Create Team Option */}
            <Link
              href="/dashboard/teams/create"
              className="block w-full px-4 py-2 text-left text-sm rounded-md transition-all duration-200 border-t mt-2 pt-2"
              style={{
                color: 'var(--accent-success)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(34, 197, 94, 0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'transparent';
              }}
            >
              + Create New Team
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
