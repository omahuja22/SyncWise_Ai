'use client';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: '📊' },
    { id: 'tasks', name: 'Tasks', icon: '✓' },
    { id: 'teams', name: 'Teams', icon: '👥' },
    { id: 'leaderboard', name: 'Leaderboard', icon: '🏆' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
  ];

  return (
    <aside
      className="w-64 flex flex-col backdrop-blur-xl border-r transition-colors duration-300"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(11, 11, 15, 0.7)',
      }}
    >
      {/* Logo */}
      <div
        className="p-6 border-b transition-colors duration-300 cursor-pointer group"
        style={{
          borderColor: 'var(--border)',
        }}
        onClick={() => onPageChange('overview')}
      >
        <h1 className="text-xl font-bold transition-all duration-300 group-hover:scale-105" style={{
          color: 'var(--foreground)',
        }}>
          SyncWise<span
            className="transition-all duration-300 group-hover:text-cyan-400"
            style={{ color: 'var(--accent-success)' }}
          >.</span>
        </h1>
        <p
          className="text-xs mt-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          Go to dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group"
              style={{
                backgroundColor: isActive
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(255, 255, 255, 0.04)';
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'transparent';
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--text-secondary)';
                }
              }}
            >
              {/* Left Indicator Bar */}
              {isActive && (
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

              {/* Glow effect on hover */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    backgroundColor: 'var(--accent-success)',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div
        className="p-4 border-t transition-colors duration-300"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: 'var(--accent-success)',
            }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate transition-colors duration-300"
              style={{
                color: 'var(--foreground)',
              }}
            >
              You
            </p>
            <p
              className="text-xs truncate transition-colors duration-300"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              user@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
