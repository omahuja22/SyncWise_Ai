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
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-4 border-b border-[var(--border)]"
            style={{
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                }}
              >
                #{entry.rank}
              </div>
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  {entry.name}
                </p>
              </div>
            </div>
            <p
              className="text-lg font-bold"
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
