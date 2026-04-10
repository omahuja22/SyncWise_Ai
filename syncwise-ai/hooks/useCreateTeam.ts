'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { createTeam, Team } from '@/services/team.service';

interface UseCreateTeamReturn {
  loading: boolean;
  error: string | null;
  team: Team | null;
  createTeamHandler: (teamName: string) => Promise<Team>;
  resetError: () => void;
}

/**
 * Hook to manage team creation
 * Handles auth check, loading state, and error handling
 */
export const useCreateTeam = (): UseCreateTeamReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const createTeamHandler = useCallback(
    async (teamName: string): Promise<Team> => {
      // Validate
      if (!teamName?.trim()) {
        const validationError = "Team name is required";
        setError(validationError);
        throw new Error(validationError);
      }

      if (!user?.id) {
        const authError = "User not authenticated";
        setError(authError);
        throw new Error(authError);
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔹 [useCreateTeam] Creating team:", teamName);

        const newTeam = await createTeam(teamName);

        console.log("✅ [useCreateTeam] Team created successfully:", newTeam.id);
        setTeam(newTeam);
        return newTeam;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create team";
        console.error("❌ [useCreateTeam] Error:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    team,
    createTeamHandler,
    resetError,
  };
};
