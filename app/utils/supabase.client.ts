import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase client environment variables (VITE_NEXT_PUBLIC_SUPABASE_URL or VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }
  
  return createBrowserClient(supabaseUrl || "", supabaseKey || "");
}
