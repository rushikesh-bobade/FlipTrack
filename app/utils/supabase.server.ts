import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createCookieSessionStorage } from "react-router";

export function getSupabaseServerClient(request: Request) {
  const headers = new Headers();

  const supabaseUrl =
    import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    // fallback to non-vite env keys currently present in your .env
    process.env.SUPABASE_URL!;

  const supabaseKey =
    import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    // fallback to non-vite env keys currently present in your .env
    process.env.SUPABASE_PUBLISHABLE_KEY!;



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

const sessionSecret = process.env.ENCRYPTION_SECRET || "fallback-dev-secret-keep-it-32-chars-long!!!";

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__ft_auth_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// In-memory cache for user sessions to avoid slow Supabase Auth network requests on every navigation.
interface CachedUser {
  user: any;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedUser>();

// Sweep expired cache entries periodically to avoid memory leaks/OOM.
if (typeof globalThis !== "undefined") {
  const globalAny = globalThis as any;
  if (!globalAny.__tokenCacheSweepInterval) {
    globalAny.__tokenCacheSweepInterval = setInterval(() => {
      const now = Date.now();
      for (const [token, data] of tokenCache.entries()) {
        if (data.expiresAt <= now) {
          tokenCache.delete(token);
        }
      }
    }, 5 * 60 * 1000); // Run sweep every 5 minutes
    
    // Unref the interval if running in Node.js environment so it does not block process exit (useful for scripts/testing).
    if (globalAny.__tokenCacheSweepInterval.unref) {
      globalAny.__tokenCacheSweepInterval.unref();
    }
  }
}

const userPromiseCache = new WeakMap<Request, Promise<any>>();

export function getUserFromRequest(request: Request, supabase: any): Promise<any> {
  let promise = userPromiseCache.get(request);
  if (promise) {
    return promise;
  }

  const resolveUser = async () => {
    try {
      // 1. First check the signed session cookie (cryptographically verified locally, 0ms network cost)
      const session = await authSessionStorage.getSession(request.headers.get("Cookie"));
      const userId = session.get("userId");
      const email = session.get("email");

      if (userId && email) {
        return { data: { user: { id: userId, email } }, error: null };
      }

      // 2. Second check the access token in-memory cache
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const accessToken = supabaseSession?.access_token;

      if (accessToken) {
        const cached = tokenCache.get(accessToken);
        if (cached) {
          if (cached.expiresAt > Date.now()) {
            return { data: { user: cached.user }, error: null };
          } else {
            tokenCache.delete(accessToken);
          }
        }
      }

      // 3. Fallback: fetch from Supabase Auth Server (network request)
      const result = await supabase.auth.getUser();

      if (result.data?.user && accessToken) {
        tokenCache.set(accessToken, {
          user: result.data.user,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes TTL
        });
      }
      return result;
    } catch (err) {
      // Fallback directly to supabase call on any error
      return supabase.auth.getUser();
    }
  };

  promise = resolveUser();
  userPromiseCache.set(request, promise);
  return promise;
}

