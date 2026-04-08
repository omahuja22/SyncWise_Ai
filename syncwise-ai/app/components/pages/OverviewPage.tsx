'use client';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dashboard overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: '24', color: '#22c55e' },
          { label: 'In Progress', value: '8', color: '#f59e0b' },
          { label: 'Completed', value: '16', color: '#22c55e' },
          { label: 'Team Members', value: '5', color: '#3b82f6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
