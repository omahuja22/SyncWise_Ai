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
        className="rounded-lg p-12 text-center"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <p
          className="text-lg font-medium mb-2"
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
