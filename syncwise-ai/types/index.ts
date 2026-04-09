// User Profile
export interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  role?: 'Developer' | 'Manager' | 'Student' | 'Designer' | 'Other';
  phone?: string;
  country?: string;
  city?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

// User Stats
export interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
}

// Task
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Auth User
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}
