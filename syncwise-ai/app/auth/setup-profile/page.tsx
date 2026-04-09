'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { profileExists, createUserProfile, completeOnboarding } from '@/services/userProfileService';
import { MultiStepProfileForm } from '@/app/components/MultiStepProfileForm';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types';

export default function SetupProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      console.log('🔹 [SetupProfilePage] Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Check if profile already exists
    const checkProfile = async () => {
      try {
        console.log('🔹 [SetupProfilePage] Checking if profile exists');
        const exists = await profileExists(user.id);
        if (exists) {
          console.log('✅ [SetupProfilePage] Profile already exists, redirecting to dashboard');
          router.push('/dashboard/tasks');
        } else {
          console.log('⚠️  [SetupProfilePage] No profile found, showing form');
        }
      } catch (err) {
        console.error('❌ [SetupProfilePage] Error checking profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user, authLoading, router]);

  const handleSubmit = async (profileData: Partial<UserProfile>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log('🔹 [SetupProfilePage] Creating profile for user:', user.id);

      await createUserProfile(user.id, profileData.full_name || 'User', profileData);
      
      // Mark onboarding as completed
      await completeOnboarding(user.id);

      console.log('✅ [SetupProfilePage] Profile created, redirecting to dashboard');
      router.push('/dashboard/tasks');
    } catch (err: any) {
      const message = err.message || 'Failed to create profile';
      console.error('❌ [SetupProfilePage] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left side - Branding */}
      <div
        className="hidden lg:flex w-1/2 flex-col items-center justify-center p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 200, 200, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Welcome to SyncWise
          </h1>
          <p
            className="text-lg max-w-md"
            style={{ color: 'var(--text-secondary)' }}
          >
            Complete your profile to unlock the full power of AI-powered productivity and team management.
          </p>
        </motion.div>

        {/* Brand Icon */}
        <motion.div
          className="mt-12 text-6xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🚀
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-xl py-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h2
              className="text-4xl font-bold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Complete Your Profile
            </h2>
            <p
              style={{ color: 'var(--text-secondary)' }}
            >
              Take a moment to personalize your account
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              className="p-4 rounded-lg text-sm mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              ❌ {error}
            </motion.div>
          )}

          {/* Multi-Step Form */}
          <MultiStepProfileForm
            initialData={{ email: user.email || '' }}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {/* Footer Info */}
          <p
            className="text-xs text-center mt-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            We take your privacy seriously. Your data is encrypted and secure.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
