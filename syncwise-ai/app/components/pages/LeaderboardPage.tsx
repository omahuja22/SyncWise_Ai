'use client';

export default function LeaderboardPage() {
  const leaderboard = [
    { rank: 1, name: 'Alice Johnson', points: 342, avatar: 'AJ' },
    { rank: 2, name: 'Bob Smith', points: 298, avatar: 'BS' },
    { rank: 3, name: 'Carol Davis', points: 287, avatar: 'CD' },
    { rank: 4, name: 'David Wilson', points: 251, avatar: 'DW' },
    { rank: 5, name: 'Eve Martinez', points: 229, avatar: 'EM' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Top performers this month
        </p>
      </div>

      {/* Leaderboard Table */}
      <div
        className="rounded-lg overflow-hidden backdrop-blur-sm border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {leaderboard.map((entry, idx) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-4 transition-all duration-300 hover:-translate-x-1 group"
            style={{
              borderBottom:
                idx < leaderboard.length - 1
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : 'none',
              backgroundColor:
                entry.rank === 1
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                entry.rank === 1
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'transparent';
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor:
                    entry.rank === 1
                      ? 'var(--accent-success)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color:
                    entry.rank === 1
                      ? '#0b0b0f'
                      : 'var(--foreground)',
                }}
              >
                #{entry.rank}
              </div>
              <div>
                <p
                  className="font-medium transition-colors duration-300"
                  style={{ color: 'var(--foreground)' }}
                >
                  {entry.name}
                </p>
              </div>
            </div>
            <p
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--accent-success)' }}
            >
              {entry.points} pts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
