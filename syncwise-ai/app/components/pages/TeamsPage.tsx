'use client';

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Teams
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage and view your teams
        </p>
      </div>

      {/* Placeholder Content */}
      <div
        className="rounded-lg p-12 text-center backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px]"
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
          className="text-lg font-medium mb-2 transition-colors duration-300"
          style={{ color: 'var(--foreground)' }}
        >
          Team Management
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Create teams, add members, and manage team settings. Coming soon!
        </p>
      </div>
    </div>
  );
}
