'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { getTeamTasks } from '@/services/taskService';
import { computeTeamStats, assessRisk } from '@/services/analyticsService';
import { useTeams } from '@/app/contexts/TeamContext';
import { Task } from '@/app/data/tasks';

interface ChartData {
  name: string;
  count: number;
}

interface DistributionData {
  name: string;
  value: number;
}

interface ProductivityData {
  date: string;
  count: number;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const { selectedTeamId } = useTeams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChartData, setStatusChartData] = useState<ChartData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<{ atRisk: boolean; reason?: string }>({ atRisk: false });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedTeamId) {
        console.log("⚠️  [AnalyticsPage] No team selected");
        setLoading(false);
        setTasks([]);
        return;
      }

      try {
        setLoading(true);
        const teamTasks = await getTeamTasks(selectedTeamId);
        console.log('📊 [AnalyticsPage] Fetched', teamTasks.length, 'tasks');
        setTasks(teamTasks);

        // CHART 1: Task Status Breakdown (Bar)
        const completed = teamTasks.filter((t) => t.status === 'done').length;
        const pending = teamTasks.filter((t) => t.status === 'pending').length;
        const inProgress = teamTasks.filter((t) => t.status === 'in-progress').length;

        setStatusChartData([
          { name: 'Pending', count: pending },
          { name: 'In Progress', count: inProgress },
          { name: 'Completed', count: completed },
        ]);

        // CHART 2: Task Distribution (Pie)
        const total = teamTasks.length;
        const completedPct = total > 0 ? (completed / total) * 100 : 0;
        const pendingPct = total > 0 ? (pending / total) * 100 : 0;
        const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;

        setDistributionData([
          { name: `Completed (${Math.round(completedPct)}%)`, value: completed },
          { name: `In Progress (${Math.round(inProgressPct)}%)`, value: inProgress },
          { name: `Pending (${Math.round(pendingPct)}%)`, value: pending },
        ]);

        // CHART 3: Productivity Over Time (Line) - Group by date
        const productivityMap = new Map<string, number>();
        teamTasks.forEach((task) => {
          if (task.created_at) {
            const date = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            productivityMap.set(date, (productivityMap.get(date) || 0) + 1);
          }
        });
        const sortedProductivity = Array.from(productivityMap.entries())
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .slice(-7) // Last 7 days
          .map(([date, count]) => ({ date, count }));
        setProductivityData(sortedProductivity);

        // AI INSIGHT: Risk Assessment
        const risk = assessRisk(teamTasks);
        setRiskAssessment(risk);

        console.log('✅ [AnalyticsPage] Charts prepared');
      } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedTeamId]);

  // Early return if no team selected
  if (!selectedTeamId && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track team performance and insights
          </p>
        </div>
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            👈 Select a team in the sidebar to see analytics
          </p>
        </div>
      </div>
    );
  }

  // Empty state if no tasks
  if (!loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track team performance and insights
          </p>
        </div>
        <div
          className="rounded-lg p-12 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-xl mb-2" style={{ color: 'var(--foreground)' }}>
            🚀 Start by creating your first task
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Analytics will appear once you have tasks in your team
          </p>
        </div>
      </div>
    );
  }

  const stats = computeTeamStats(tasks);
  const totalTeamPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);


  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          📊 Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Team performance and productivity insights
        </p>
      </div>

      {/* RISK ALERT - AI Insight */}
      {riskAssessment.atRisk && (
        <div
          className="rounded-lg p-4 border backdrop-blur-sm transition-all duration-300"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <p className="font-semibold" style={{ color: 'rgba(239, 68, 68, 1)' }}>
            {riskAssessment.reason}
          </p>
        </div>
      )}

      {/* METRICS CARDS - Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Tasks */}
        <div
          className="rounded-lg p-4 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(59, 130, 246, 0.7)' }}>
            📋 Total Tasks
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            {stats.totalTasks}
          </p>
        </div>

        {/* Completed Tasks */}
        <div
          className="rounded-lg p-4 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34, 197, 94, 0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34, 197, 94, 0.3)';
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(34, 197, 94, 0.7)' }}>
            ✅ Completed
          </p>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {stats.completedTasks}
          </p>
        </div>

        {/* Pending Tasks */}
        <div
          className="rounded-lg p-4 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.3)';
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(245, 158, 11, 0.7)' }}>
            ⏳ Pending
          </p>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {stats.pendingTasks}
          </p>
        </div>

        {/* In Progress */}
        <div
          className="rounded-lg p-4 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(239, 68, 68, 0.7)' }}>
            🚀 In Progress
          </p>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {stats.inProgressTasks}
          </p>
        </div>

        {/* Completion Rate */}
        <div
          className="rounded-lg p-4 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34, 197, 94, 0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34, 197, 94, 0.3)';
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(34, 197, 94, 0.7)' }}>
            📈 Completion
          </p>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {stats.completionRate}%
          </p>
        </div>
      </div>

      {/* CHART 1: Task Status Bar Chart */}
      {!loading && statusChartData.length > 0 && (
        <div
          className="rounded-lg p-6 backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            📊 Task Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
              />
              <Bar dataKey="count" fill="#22c55e" name="Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CHART 2: Task Distribution Pie Chart */}
      {!loading && distributionData.length > 0 && (
        <div
          className="rounded-lg p-6 backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            🥧 Task Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name }) => name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CHART 3: Productivity Over Time Line Chart */}
      {!loading && productivityData.length > 1 && (
        <div
          className="rounded-lg p-6 backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            📈 Productivity Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                activeDot={{ r: 7 }}
                name="Tasks Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ADDITIONAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Points Card */}
        <div
          className="rounded-lg p-6 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            ⭐ Total Team Points
          </p>
          <p className="text-4xl font-bold" style={{ color: '#f59e0b' }}>
            {totalTeamPoints}
          </p>
        </div>

        {/* Info Card */}
        <div
          className="rounded-lg p-6 backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p className="text-lg font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            💡 Quick Stats
          </p>
          <div style={{ color: 'var(--text-secondary)' }} className="space-y-2 text-sm">
            <p>• Avg Points per Task: {totalTeamPoints > 0 ? Math.round(totalTeamPoints / stats.totalTasks) : 0}</p>
            <p>• Overdue Tasks: {stats.overdueTasks}</p>
            <p>• Efficiency Score: {stats.efficiencyScore}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
