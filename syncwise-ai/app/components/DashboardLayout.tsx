'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import OverviewPage from './pages/OverviewPage';
import TeamsPage from './pages/TeamsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState('overview');

  // Render appropriate page content
  const renderPageContent = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'tasks':
        return <TaskList />;
      case 'teams':
        return <TeamsPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="px-8 py-6" style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold" style={{
                color: 'var(--foreground)',
              }}>
                Welcome back, User
              </h2>
              <p className="text-sm mt-1" style={{
                color: 'var(--text-secondary)',
              }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Quick Stats - Top Right */}
            <div className="flex gap-4">
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                transition: 'background-color 0.3s, border-color 0.3s',
              }}>
                <p className="text-xs mb-1" style={{
                  color: 'var(--text-secondary)',
                }}>Tasks Today</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--foreground)',
                }}>0</p>
              </div>
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                transition: 'background-color 0.3s, border-color 0.3s',
              }}>
                <p className="text-xs mb-1" style={{
                  color: 'var(--text-secondary)',
                }}>Points</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--accent-success)',
                }}>0</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8" style={{
          backgroundColor: 'var(--background)',
        }}>
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
}
