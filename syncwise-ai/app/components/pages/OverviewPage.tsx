'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTeams } from '@/app/contexts/TeamContext';
import { getTeamTasks } from '@/services/taskService';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  totalTeamPoints: number;
}

export default function OverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTeamId } = useTeams();
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    totalTeamPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning');
    else if (hour < 18) setTimeGreeting('Good afternoon');
    else setTimeGreeting('Good evening');
  }, []);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, [user?.id]);

  useEffect(() => {
    const loadStats = async () => {
      console.log('📊 [OverviewPage] Loading stats - selectedTeamId:', selectedTeamId, 'user:', user?.id);

      if (!selectedTeamId || !user?.id) {
        console.log('⚠️  [OverviewPage] Missing selectedTeamId or user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch team tasks using team_id filter
        const tasks = await getTeamTasks(selectedTeamId);
        console.log('✅ [OverviewPage] Got tasks:', tasks.length);

        // Compute stats
        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => t.status !== 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const total = tasks.length;
        const totalTeamPoints = tasks
          .filter(t => t.status === 'done')
          .reduce((sum, t) => sum + (t.points || 0), 0);

        setStats({
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalTeamPoints: totalTeamPoints,
        });
      } catch (error) {
        console.error('❌ [OverviewPage] Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedTeamId, user?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getInitials = () => {
    return (userName || 'User').substring(0, 2).toUpperCase();
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="space-y-4">
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
            {timeGreeting}, {userName} 👋
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
          Let's build something productive today 🚀
        </p>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Tasks', value: stats.inProgressTasks, color: 'rgb(248, 113, 113)' },
          { label: 'This Week', value: stats.completedTasks, color: 'rgb(34, 197, 94)' },
          { label: 'Total', value: stats.totalTasks, color: 'rgb(59, 130, 246)' },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-lg p-4 text-center backdrop-blur-sm border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Total Points Section */}
      <motion.div variants={itemVariants}>
        <div
          className="rounded-lg p-8 backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            Total Team Points
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-success)' }}
          >
            {loading ? '-' : stats.totalTeamPoints}
          </p>
        </div>
      </motion.div>

      {/* Task Overview - ORIGINAL CARDS */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Task Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: stats.totalTasks, color: '#3b82f6', icon: '📋' },
            { label: 'In Progress', value: stats.inProgressTasks, color: '#f59e0b', icon: '⚙️' },
            { label: 'Completed', value: stats.completedTasks, color: '#22c55e', icon: '✅' },
            { label: 'Pending', value: stats.pendingTasks, color: '#6b7280', icon: '⏳' },
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
                        ? `${((stats.totalTasks / Math.max(stats.totalTasks, 10)) * 100) || 0}%`
                        : stat.label === 'In Progress'
                        ? `${((stats.inProgressTasks / Math.max(stats.totalTasks, 1)) * 100) || 0}%`
                        : stat.label === 'Completed'
                        ? `${((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100) || 0}%`
                        : `${((stats.pendingTasks / Math.max(stats.totalTasks, 1)) * 100) || 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '➕', label: 'Create Task', desc: 'Start a new task', href: '/dashboard/tasks' },
            { icon: '📊', label: 'Analytics', desc: 'View detailed metrics', href: '/dashboard/analytics' },
            { icon: '👥', label: 'Team', desc: 'Manage your team', href: '/dashboard/teams' },
          ].map((action, i) => (
            <motion.button
              key={i}
              onClick={() => router.push(action.href)}
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
