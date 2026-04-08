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
          Dashboard
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
            className="rounded-lg p-6 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px] group"
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
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold transition-colors duration-300"
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
