'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { signOut } from '@/services/authService';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamSelector from './TeamSelector';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('🔹 [Sidebar] Logging out user');
      setIsLoggingOut(true);
      const { error } = await signOut();
      if (error) {
        console.error('❌ [Sidebar] Logout error:', error.message);
        return;
      }
      console.log('✅ [Sidebar] Logged out successfully');
      router.push('/auth/login');
    } catch (err) {
      console.error('❌ [Sidebar] Logout exception:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const getDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: '📊', href: '/dashboard/overview' },
    { id: 'tasks', name: 'Tasks', icon: '✓', href: '/dashboard/tasks' },
    { id: 'teams', name: 'Teams', icon: '👥', href: '/dashboard/teams' },
    { id: 'leaderboard', name: 'Leaderboard', icon: '🏆', href: '/dashboard/leaderboard' },
    { id: 'analytics', name: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className="w-64 flex flex-col backdrop-blur-xl border-r transition-colors duration-300 relative"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(11, 11, 15, 0.7)',
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard/overview"
        className="p-6 border-b transition-colors duration-300 cursor-pointer group"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold transition-all duration-300 group-hover:scale-105" style={{
            color: 'var(--foreground)',
          }}>
            SyncWise<span
              className="transition-all duration-300 group-hover:text-cyan-400"
              style={{ color: 'var(--accent-success)' }}
            >.</span>
          </h1>
        </div>
        <p
          className="text-xs ml-8 transition-all duration-300 opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          Go to dashboard
        </p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group"
              style={{
                backgroundColor: active
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(255, 255, 255, 0.04)';
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'transparent';
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--text-secondary)';
                }
              }}
            >
              {active && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--accent-success)',
                  }}
                />
              )}

              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1 text-left">
                {item.name}
              </span>

              {!active && (
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    backgroundColor: 'var(--accent-success)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Team Selector */}
      <div
        className="px-4 py-3 border-b transition-colors duration-300"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        <TeamSelector />
      </div>

      {/* User Profile Section */}
      <div
        className="p-4 border-t transition-colors duration-300"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        {/* User Card with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 backdrop-blur-sm group"
            style={{
              backgroundColor: isDropdownOpen
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isDropdownOpen
                ? '1px solid rgba(59, 130, 246, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:scale-110 flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
              }}
            >
              {getInitials()}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 text-left">
              <p
                className="text-sm font-medium truncate transition-colors duration-300"
                style={{
                  color: 'var(--foreground)',
                }}
              >
                {getDisplayName()}
              </p>
              <p
                className="text-xs truncate transition-colors duration-300"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                {profile?.role || 'Developer'}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <motion.span
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg flex-shrink-0"
            >
              ⌄
            </motion.span>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg z-50"
                style={{
                  backgroundColor: 'rgba(11, 11, 15, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Profile Option */}
                <button
                  onClick={() => {
                    router.push('/dashboard/profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-slate-700/20 transition-colors duration-200 flex items-center gap-2 border-b"
                  style={{
                    color: 'var(--foreground)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span>👤</span> View Profile
                </button>

                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3 text-left text-sm transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: '#ef4444',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoggingOut) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        'rgba(239, 68, 68, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'transparent';
                  }}
                >
                  <span>🚪</span> {isLoggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Email Info */}
        <p
          className="text-xs px-4 py-2 text-center truncate"
          style={{ color: 'var(--text-secondary)' }}
          title={user?.email}
        >
          {user?.email}
        </p>
      </div>
    </aside>
  );
}
