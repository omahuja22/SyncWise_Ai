'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import OverviewPage from './pages/OverviewPage';
import TeamsPage from './pages/TeamsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage from './pages/AnalyticsPage';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

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
        <header
          className="px-8 py-6 border-b transition-colors duration-300 backdrop-blur-sm"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'rgba(11, 11, 15, 0.5)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-2xl font-semibold"
                style={{
                  color: 'var(--foreground)',
                }}
              >
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
              <div
                className="rounded-lg px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[2px]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow:
                    activePage === 'overview'
                      ? '0 8px 32px rgba(34, 197, 94, 0.08)'
                      : 'none',
                }}
              >
                <p
                  className="text-xs mb-1 transition-colors duration-300"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                >
                  Tasks Today
                </p>
                <p
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{
                    color: 'var(--foreground)',
                  }}
                >
                  0
                </p>
              </div>
              <div
                className="rounded-lg px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[2px]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow:
                    activePage === 'overview'
                      ? '0 8px 32px rgba(34, 197, 94, 0.08)'
                      : 'none',
                }}
              >
                <p
                  className="text-xs mb-1 transition-colors duration-300"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                >
                  Points
                </p>
                <p
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{
                    color: 'var(--accent-success)',
                  }}
                >
                  0
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Animations */}
        <main
          className="flex-1 overflow-auto p-8 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--background)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
