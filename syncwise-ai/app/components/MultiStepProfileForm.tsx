'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types';

interface MultiStepProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (data: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
}

type Step = 1 | 2 | 3 | 4;

const ROLES = ['Developer', 'Manager', 'Student', 'Designer', 'Other'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function MultiStepProfileForm({
  initialData = {},
  onSubmit,
  loading = false,
}: MultiStepProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: initialData.full_name || '',
    username: initialData.username || '',
    role: initialData.role || 'Developer',
    bio: initialData.bio || '',
    country: initialData.country || '',
    city: initialData.city || '',
    phone: initialData.phone || '',
    dob: initialData.dob || '',
    gender: initialData.gender || undefined,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof UserProfile,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.full_name?.trim()) {
          newErrors.full_name = 'Full name is required';
        }
        if (!formData.username?.trim()) {
          newErrors.username = 'Username is required';
        }
        break;
      case 2:
        // Role and bio are optional
        break;
      case 3:
        // Country, city, phone are optional
        break;
      case 4:
        // DOB and gender are optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error('Form submission error:', err);
      }
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Basic Info',
      description: 'What should we call you?',
    },
    {
      number: 2,
      title: 'Role & Bio',
      description: 'Tell us about yourself',
    },
    {
      number: 3,
      title: 'Location',
      description: 'Where are you from?',
    },
    {
      number: 4,
      title: 'Personal Details',
      description: 'Optional personal information',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 cursor-pointer transition`}
                animate={{
                  backgroundColor:
                    currentStep >= step.number
                      ? 'rgb(59, 130, 246)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: currentStep >= step.number ? 'white' : 'rgba(255, 255, 255, 0.5)',
                }}
                onClick={() => {
                  if (step.number < currentStep) {
                    setCurrentStep(step.number as Step);
                  }
                }}
              >
                {step.number}
              </motion.div>
              <p className="text-xs text-center text-slate-400 hidden sm:block">
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            animate={{
              width: `${(currentStep / 4) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Full Name & Username */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {steps[0].description}
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition ${
                    errors.full_name ? 'border-red-500' : 'border-slate-600'
                  }`}
                  disabled={loading}
                />
                {errors.full_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Choose a unique username"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition ${
                    errors.username ? 'border-red-500' : 'border-slate-600'
                  }`}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Role & Bio */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {steps[1].description}
              </h3>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role (Optional)
                </label>
                <select
                  value={formData.role || 'Developer'}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {(formData.bio || '').length}/300 characters
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {steps[2].description}
              </h3>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="e.g., United States"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g., San Francisco"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g., +1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Personal Details */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {steps[3].description}
              </h3>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dob || ''}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender (Optional)
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex justify-between gap-4 pt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
            className="px-6 py-3 border border-slate-600 rounded-lg text-white hover:border-slate-500 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep === 4 ? (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
