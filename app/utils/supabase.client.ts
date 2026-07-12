import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;

  try {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  } catch (e) {}

  if (!supabaseUrl || !supabaseAnonKey) {
    try {
      // @ts-ignore
      supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
      // @ts-ignore
      supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    } catch (e) {}
  }
    import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL!;

  const supabaseKey =
    import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY!;

  return createBrowserClient(supabaseUrl, supabaseKey);
}

