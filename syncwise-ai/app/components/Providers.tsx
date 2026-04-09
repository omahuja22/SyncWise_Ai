'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        storageKey="syncwise-theme"
      >
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
