"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUserTeams, createTeam, deleteTeam, joinTeamByCode, Team } from "@/services/teamService";

interface TeamContextType {
  teams: Team[];
  selectedTeamId: string | null;
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
  selectTeam: (teamId: string) => void;
  refreshTeams: () => Promise<void>;
  addTeam: (teamName: string) => Promise<Team>;
  removeTeam: (teamId: string) => Promise<void>;
  joinTeam: (teamCode: string) => Promise<Team>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's teams on mount
  useEffect(() => {
    const loadTeams = async () => {
      if (!user?.id) {
        console.log("🔹 [TeamProvider] No user, skipping team load");
        setTeams([]);
        setSelectedTeamId(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔹 [TeamProvider] Loading teams for user:", user.id);

        const userTeams = await getUserTeams(user.id);
        console.log("✅ [TeamProvider] Teams loaded:", userTeams.length);
        
        setTeams(userTeams);

        // Check localStorage first
        const saved = localStorage.getItem("selectedTeamId");
        if (saved && userTeams.find(t => t.id === saved)) {
          console.log("🔹 [TeamProvider] Using saved team:", saved);
          setSelectedTeamId(saved);
        } else if (userTeams.length > 0) {
          // Auto-select first team
          const firstTeamId = userTeams[0].id;
          setSelectedTeamId(firstTeamId);
          localStorage.setItem("selectedTeamId", firstTeamId);
          console.log("🔹 [TeamProvider] Auto-selecting first team:", firstTeamId);
        }
      } catch (err: any) {
        console.error("❌ [TeamProvider] Error loading teams:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [user?.id]);

  // Remove the separate localStorage useEffect - handled above now

  const selectTeam = (teamId: string) => {
    console.log("🔹 [TeamProvider] Selecting team:", teamId);
    setSelectedTeamId(teamId);
    localStorage.setItem("selectedTeamId", teamId);
  };

  const refreshTeams = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log("🔹 [TeamProvider] Refreshing teams");
      const userTeams = await getUserTeams(user.id);
      setTeams(userTeams);
      console.log("✅ [TeamProvider] Teams refreshed:", userTeams.length);
    } catch (err: any) {
      console.error("❌ [TeamProvider] Error refreshing teams:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (teamName: string): Promise<Team> => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔹 [TeamProvider] Creating team:", teamName);

      const newTeam = await createTeam(teamName);
      console.log("✅ [TeamProvider] Team created:", newTeam.id);

      // Show team code alert
      alert(`🎉 Team Created!\n\nTeam Code: ${newTeam.team_code}\n\nShare this with teammates to join!`);

      // Add to state
      setTeams((prev) => [newTeam, ...prev]);

      // Auto-select new team
      setSelectedTeamId(newTeam.id);
      localStorage.setItem("selectedTeamId", newTeam.id);

      // Force refresh
      setTimeout(() => window.location.reload(), 500);

      return newTeam;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create team";
      console.error("❌ [TeamProvider] Error creating team:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTeam = async (teamId: string): Promise<void> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔹 [TeamProvider] Deleting team:", teamId);

      await deleteTeam(teamId, user.id);
      console.log("✅ [TeamProvider] Team deleted:", teamId);

      // Remove from state
      setTeams((prev) => prev.filter((t) => t.id !== teamId));

      // If deleted team was selected, reset selection
      if (selectedTeamId === teamId) {
        console.log("🔹 [TeamProvider] Deleted team was selected, resetting");
        const remainingTeams = teams.filter((t) => t.id !== teamId);

        if (remainingTeams.length > 0) {
          // Auto-select first remaining team
          const nextTeamId = remainingTeams[0].id;
          setSelectedTeamId(nextTeamId);
          localStorage.setItem("selectedTeamId", nextTeamId);
          console.log("🔹 [TeamProvider] Auto-selected next team:", nextTeamId);
        } else {
          // No teams left
          setSelectedTeamId(null);
          localStorage.removeItem("selectedTeamId");
          console.log("🔹 [TeamProvider] No teams remaining");
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to delete team";
      console.error("❌ [TeamProvider] Error deleting team:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamCode: string): Promise<Team> => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔹 [TeamProvider] Joining team with code:", teamCode);

      const joinedTeam = await joinTeamByCode(teamCode);
      console.log("✅ [TeamProvider] Joined team:", joinedTeam.id);

      // Add to state if not already there
      setTeams((prev) => {
        const exists = prev.some(t => t.id === joinedTeam.id);
        return exists ? prev : [joinedTeam, ...prev];
      });

      // Set as selected team
      setSelectedTeamId(joinedTeam.id);
      localStorage.setItem("selectedTeamId", joinedTeam.id);

      alert(`✅ Successfully joined team: ${joinedTeam.name}!`);

      // Force refresh
      setTimeout(() => window.location.reload(), 500);

      return joinedTeam;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to join team";
      console.error("❌ [TeamProvider] Error joining team:", errorMsg);
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId) || null
    : null;

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeamId,
        selectedTeam,
        loading,
        error,
        selectTeam,
        refreshTeams,
        addTeam,
        removeTeam,
        joinTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within TeamProvider");
  }
  return context;
};
