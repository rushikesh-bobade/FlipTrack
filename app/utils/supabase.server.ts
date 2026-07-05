import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

export function getSupabaseServerClient(request: Request) {
  const headers = new Headers();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "") as any;
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
        );
      },
    },
  });

  return { supabase, headers };
}
