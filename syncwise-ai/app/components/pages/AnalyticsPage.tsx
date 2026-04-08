'use client';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track performance and insights
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-lg p-8 text-center"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            className="text-sm mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Avg Task Completion
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-success)' }}
          >
            78%
          </p>
        </div>

        <div
          className="rounded-lg p-8 text-center"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            className="text-sm mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Team Efficiency
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: 'var(--accent-warning)' }}
          >
            85%
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <p
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Performance Insights
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed analytics and performance metrics will be available here.
        </p>
      </div>
    </div>
  );
}
