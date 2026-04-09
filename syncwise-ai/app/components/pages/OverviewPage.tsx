'use client';

import { useTasks } from '@/hooks/useTasks';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserStatsDisplay from '../UserStatsDisplay';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function OverviewPage() {
  const { tasks, loading } = useTasks();
  const { profile } = useUserProfile();
  const [timeGreeting, setTimeGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning');
    else if (hour < 18) setTimeGreeting('Good afternoon');
    else setTimeGreeting('Good evening');
  }, []);

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '?';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: 'rgb(59, 130, 246)' }}
              >
                {getInitials()}
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                {timeGreeting}, {profile?.full_name?.split(' ')[0] || 'Welcome'} 👋
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              Let's build something productive today 🚀
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6 border overflow-hidden relative"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.2)',
          }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {/* Decorative gradient background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(10, 200, 200) 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(59, 130, 246)' }}>
                  ✨ Welcome to Your Dashboard
                </h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                  Track your tasks, monitor progress, and stay productive with AI-powered insights.
                </p>
              </div>
              <span className="text-3xl">📊</span>
            </div>

            {/* Quick Stats in Welcome Card */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Active Tasks', value: inProgressTasks, color: 'rgb(248, 113, 113)' },
                { label: 'This Week', value: completedTasks, color: 'rgb(34, 197, 94)' },
                { label: 'Total', value: totalTasks, color: 'rgb(59, 130, 246)' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>
                    {loading ? '-' : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* User Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserStatsDisplay />
        </div>
      </motion.div>

      {/* Task Stats Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Task Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: totalTasks, color: '#3b82f6', icon: '📋' },
            { label: 'In Progress', value: inProgressTasks, color: '#f59e0b', icon: '⚙️' },
            { label: 'Completed', value: completedTasks, color: '#22c55e', icon: '✅' },
            { label: 'Pending', value: pendingTasks, color: '#6b7280', icon: '⏳' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-lg p-6 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px] group cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              }}
              whileHover={{
                backgroundColor: `${stat.color}15`,
                borderColor: `${stat.color}50`,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-3xl font-bold transition-all duration-200 group-hover:scale-110"
                    style={{ color: stat.color }}
                  >
                    {loading ? '-' : stat.value}
                  </p>
                </div>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110">
                  {stat.icon}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      stat.label === 'Total Tasks'
                        ? `${((totalTasks / Math.max(totalTasks, 10)) * 100) || 0}%`
                        : stat.label === 'In Progress'
                        ? `${((inProgressTasks / Math.max(totalTasks, 1)) * 100) || 0}%`
                        : stat.label === 'Completed'
                        ? `${((completedTasks / Math.max(totalTasks, 1)) * 100) || 0}%`
                        : `${((pendingTasks / Math.max(totalTasks, 1)) * 100) || 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '➕', label: 'Create Task', desc: 'Start a new task', href: '/dashboard/tasks' },
            { icon: '📊', label: 'Analytics', desc: 'View detailed metrics', href: '/dashboard/analytics' },
            { icon: '👥', label: 'Team', desc: 'Manage your team', href: '/dashboard/teams' },
          ].map((action, i) => (
            <motion.button
              key={i}
              className="p-4 rounded-lg border text-left transition-all duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <span className="text-2xl mb-2 block">{action.icon}</span>
              <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {action.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {action.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
