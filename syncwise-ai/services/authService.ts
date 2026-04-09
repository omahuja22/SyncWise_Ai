import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
  try {
    console.log("🔹 [authService] Signing up user:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    });

    if (error) {
      console.error("❌ [authService] Signup error:", error.message);
      return { user: null, error: { message: error.message, code: error.code } };
    }

    if (!data.user) {
      return {
        user: null,
        error: { message: "User creation failed" },
      };
    }

    console.log("✅ [authService] User signed up:", data.user.id);
    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
      },
      error: null,
    };
  } catch (err: any) {
    console.error("❌ [authService] Signup exception:", err);
    return {
      user: null,
      error: { message: err.message || "Signup failed" },
    };
  }
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
  try {
    console.log("🔹 [authService] Signing in user:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ [authService] Login error:", error.message);
      return { user: null, error: { message: error.message, code: error.code } };
    }

    if (!data.user) {
      return {
        user: null,
        error: { message: "Authentication failed" },
      };
    }

    console.log("✅ [authService] User signed in:", data.user.id);
    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
      },
      error: null,
    };
  } catch (err: any) {
    console.error("❌ [authService] Login exception:", err);
    return {
      user: null,
      error: { message: err.message || "Login failed" },
    };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    console.log("🔹 [authService] Signing out user");
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ [authService] Logout error:", error.message);
      return { error: { message: error.message } };
    }

    console.log("✅ [authService] User signed out");
    return { error: null };
  } catch (err: any) {
    console.error("❌ [authService] Logout exception:", err);
    return {
      error: { message: err.message || "Logout failed" },
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log("🔹 [authService] Fetching current user");
    
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.log("ℹ️  [authService] No authenticated user");
      return null;
    }

    console.log("✅ [authService] Current user:", data.user.id);
    return {
      id: data.user.id,
      email: data.user.email || "",
      user_metadata: data.user.user_metadata,
    };
  } catch (err: any) {
    console.error("❌ [authService] GetCurrentUser exception:", err);
    return null;
  }
};

// Get auth session
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err: any) {
    console.error("❌ [authService] GetSession error:", err);
    return null;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
  try {
    console.log("🔹 [authService] Signing in with Google");
    
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/setup-profile` : '/auth/setup-profile';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("❌ [authService] Google signin error:", error.message);
      return { error: { message: error.message, code: error.code } };
    }

    console.log("✅ [authService] Google signin initiated");
    return { error: null };
  } catch (err: any) {
    console.error("❌ [authService] Google signin exception:", err);
    return {
      error: { message: err.message || "Google signin failed" },
    };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    // Handle invalid refresh token
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      console.log('ℹ️  [authService] Auth session invalid or expired');
      callback(null);
      return;
    }

    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
        user_metadata: session.user.user_metadata,
      });
    } else {
      callback(null);
    }
  });
};
