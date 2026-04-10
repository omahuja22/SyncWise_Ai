'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuth } from '@/app/contexts/AuthContext';
import { TeamProvider } from '@/app/contexts/TeamContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('🔹 [DashboardLayout] Auth check - isAuthenticated:', isAuthenticated, 'loading:', loading);
    
    if (!loading && !isAuthenticated) {
      console.log('❌ [DashboardLayout] Not authenticated, redirecting to login');
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <TeamProvider>
      <div className="flex h-screen overflow-hidden" style={{
        backgroundColor: 'var(--background)',
      }}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </TeamProvider>
  );
}
