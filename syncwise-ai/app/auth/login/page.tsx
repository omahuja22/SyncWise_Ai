"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn, signInWithGoogle } from "@/services/authService";
import { profileExists } from "@/services/userProfileService";
import { motion } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkProfileAndRedirect = async (userId: string) => {
    try {
      console.log("🔹 [AuthPage] Checking if profile exists for user:", userId);
      const hasProfile = await profileExists(userId);
      
      if (hasProfile) {
        console.log("✅ [AuthPage] Profile exists, redirecting to dashboard");
        router.push("/dashboard/tasks");
      } else {
        console.log("⚠️  [AuthPage] No profile found, redirecting to setup");
        router.push("/auth/setup-profile");
      }
    } catch (err: any) {
      console.error("❌ [AuthPage] Error checking profile:", err);
      router.push("/auth/setup-profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(`🔹 [AuthPage] ${mode === "login" ? "Logging in" : "Signing up"} with:`, email);

      if (mode === "login") {
        const { user, error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        if (user) {
          console.log("✅ [AuthPage] Login successful");
          await checkProfileAndRedirect(user.id);
        }
      } else {
        const { user, error: authError } = await signUp(email, password, fullName);
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        if (user) {
          console.log("✅ [AuthPage] Signup successful");
          await checkProfileAndRedirect(user.id);
        }
      }
    } catch (err: any) {
      console.error("❌ [AuthPage] Auth error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      console.log("🔹 [AuthPage] Signing in with Google");
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("❌ [AuthPage] Google signin error:", err);
      setError(err.message || "Google signin failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div
        className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(10, 200, 200, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
        }}
      >
        <div className="text-center max-w-md">
          {/* Logo/Icon */}
          <div className="text-6xl font-bold mb-6" style={{ color: 'rgb(59, 130, 246)' }}>
            ⚡
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            SyncWise
          </h1>

          {/* Tagline */}
          <p className="text-xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            AI-powered team productivity and performance management
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            {[
              { emoji: '✨', text: 'Smart task intelligence' },
              { emoji: '📊', text: 'Real-time analytics' },
              { emoji: '🤝', text: 'Team collaboration' },
              { emoji: '🚀', text: 'Lightning-fast performance' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <span className="text-2xl">{feature.emoji}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-12 pt-8 border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of teams already managing productivity with SyncWise
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Auth Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-10 lg:hidden">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              SyncWise
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>AI-powered productivity platform</p>
          </div>

          {/* Card Container */}
          <motion.div
            className="rounded-2xl p-8 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Title */}
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Join thousands of productive teams"}
            </p>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                }}
              >
                ❌ {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Signup only) */}
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg text-sm border transition-all outline-none"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground)',
                    }}
                    disabled={loading}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgb(59, 130, 246)';
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm border transition-all outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--foreground)',
                  }}
                  disabled={loading}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgb(59, 130, 246)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm border transition-all outline-none"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--foreground)',
                  }}
                  disabled={loading}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgb(59, 130, 246)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all mt-6 text-white"
                style={{
                  backgroundColor: 'rgb(59, 130, 246)',
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(37, 99, 235)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(59, 130, 246)';
                  }
                }}
              >
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
                <span className="px-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Or</span>
                <div className="flex-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                type="button"
                className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setEmail("");
                    setPassword("");
                    setFullName("");
                  }}
                  className="font-medium transition-colors"
                  style={{ color: 'rgb(59, 130, 246)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

            {/* Demo Info */}
            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
              Test account: any email and password
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
