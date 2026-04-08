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
          className="rounded-lg p-8 text-center backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 16px 32px rgba(34, 197, 94, 0.12)';
            (e.currentTarget as HTMLElement).style.borderColor =
              'rgba(34, 197, 94, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 8px 16px rgba(0, 0, 0, 0.2)';
            (e.currentTarget as HTMLElement).style.borderColor =
              'rgba(255, 255, 255, 0.1)';
          }}
        >
          <p
            className="text-sm mb-2 transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Avg Task Completion
          </p>
          <p
            className="text-4xl font-bold transition-colors duration-300"
            style={{ color: 'var(--accent-success)' }}
          >
            78%
          </p>
        </div>

        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 16px 32px rgba(245, 158, 11, 0.12)';
            (e.currentTarget as HTMLElement).style.borderColor =
              'rgba(245, 158, 11, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 8px 16px rgba(0, 0, 0, 0.2)';
            (e.currentTarget as HTMLElement).style.borderColor =
              'rgba(255, 255, 255, 0.1)';
          }}
        >
          <p
            className="text-sm mb-2 transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Team Efficiency
          </p>
          <p
            className="text-4xl font-bold transition-colors duration-300"
            style={{ color: 'var(--accent-warning)' }}
          >
            85%
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="rounded-lg p-6 backdrop-blur-sm border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p
          className="text-lg font-medium mb-2 transition-colors duration-300"
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
