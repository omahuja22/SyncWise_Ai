"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, onAuthStateChange } from "@/services/authService";

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

    // Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((currentUser) => {
      console.log(
        "✅ [AuthProvider] Auth state changed:",
        currentUser?.id || "null"
      );
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log("🔹 [AuthProvider] Cleaning up auth subscription");
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
