import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ [Supabase] NEXT_PUBLIC_SUPABASE_URL is missing");
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required");
}

if (!supabaseAnonKey) {
  console.error("❌ [Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required");
}

console.log("✅ [Supabase] Initializing client with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});