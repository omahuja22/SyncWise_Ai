"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, onAuthStateChange, getCurrentUser } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔹 [AuthProvider] Initializing auth state");

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // STEP 1: Attempt to recover session from Supabase
        console.log("🔹 [AuthProvider] Attempting session recovery...");
        const currentUser = await getCurrentUser();
        
        if (mounted) {
          if (currentUser) {
            console.log("✅ [AuthProvider] Session recovered:", currentUser.id);
            setUser(currentUser);
          } else {
            console.log("ℹ️  [AuthProvider] No active session found");
            setUser(null);
          }
        }
      } catch (err: any) {
        console.error("❌ [AuthProvider] Session recovery error:", err.message);
        if (mounted) {
          setUser(null);
          // Clear potentially corrupted localStorage
          try {
            localStorage.removeItem("sb-lwyxqoqxerhlcxrmxkzf-auth-token");
          } catch (e) {
            console.log("ℹ️  [AuthProvider] Could not clear auth token");
          }
        }
      }
    };

    // Initialize session
    initializeAuth();

    // STEP 2: Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((currentUser) => {
      console.log(
        "✅ [AuthProvider] Auth state changed:",
        currentUser?.id || "null"
      );
      if (mounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => {
      console.log("🔹 [AuthProvider] Cleaning up auth subscription");
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
