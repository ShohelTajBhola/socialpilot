import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Retrieve Vite client-side environment variables if present
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClientInstance: SupabaseClient | null = null;

export function isSupabaseValidUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('your-project') || url.trim() === '') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSupabaseValidKey(key?: string): boolean {
  if (!key || typeof key !== 'string') return false;
  if (key.includes('your-anon-publishable-key') || key.trim() === '') return false;
  return key.length > 20;
}

export function initSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl = url || envUrl;
  const targetKey = anonKey || envAnonKey;

  if (isSupabaseValidUrl(targetUrl) && isSupabaseValidKey(targetKey)) {
    try {
      supabaseClientInstance = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      });
      return supabaseClientInstance;
    } catch (err) {
      console.warn('[SocialPilot] Error initializing Supabase client:', err);
      supabaseClientInstance = null;
      return null;
    }
  }

  return null;
}

// Auto-initialize if env vars are baked into Vite
if (isSupabaseValidUrl(envUrl) && isSupabaseValidKey(envAnonKey)) {
  initSupabase(envUrl, envAnonKey);
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClientInstance;
}

export function isSupabaseConfigured(): boolean {
  return supabaseClientInstance !== null;
}

/**
 * Initiates official Google OAuth authentication via Supabase Auth
 */
export async function signInWithGoogle(options?: {
  redirectTo?: string;
  skipBrowserRedirect?: boolean;
}): Promise<{ error?: string; url?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      error: 'Supabase credentials are not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment, and enable Google in Supabase Authentication -> Providers.',
    };
  }

  const appOrigin = window.location.origin;
  const redirectUrl = options?.redirectTo || `${appOrigin}/auth/callback`;
  const isInsideIframe = window !== window.top;
  const shouldSkipRedirect = options?.skipBrowserRedirect ?? isInsideIframe;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: shouldSkipRedirect,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (shouldSkipRedirect && data?.url) {
      // In an iframe preview, open Google's OAuth consent URL in a standard popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      if (!popup) {
        return { error: 'Popup window was blocked by your browser. Please allow popups for this site and try again.' };
      }

      return { url: data.url };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'Failed to initiate Google OAuth with Supabase' };
  }
}

/**
 * Initiates official Facebook OAuth authentication via Supabase Auth
 */
export async function signInWithFacebook(options?: {
  redirectTo?: string;
  skipBrowserRedirect?: boolean;
}): Promise<{ error?: string; url?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      error: 'Supabase credentials are not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment, and enable Facebook in Supabase Authentication -> Providers.',
    };
  }

  const appOrigin = window.location.origin;
  const redirectUrl = options?.redirectTo || `${appOrigin}/auth/callback`;
  const isInsideIframe = window !== window.top;
  const shouldSkipRedirect = options?.skipBrowserRedirect ?? isInsideIframe;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
        scopes: 'email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts',
        skipBrowserRedirect: shouldSkipRedirect,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (shouldSkipRedirect && data?.url) {
      // In an iframe preview, open Facebook's OAuth consent URL in a popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        'facebook_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      if (!popup) {
        return { error: 'Popup window was blocked by your browser. Please allow popups for this site and try again.' };
      }

      return { url: data.url };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'Failed to initiate Facebook OAuth with Supabase' };
  }
}

/**
 * Extracts and sets the Supabase session after receiving OAuth callback tokens or hash
 */
export async function handleSupabaseOAuthCallback(hashOrSearch?: string): Promise<{
  session: Session | null;
  user: User | null;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { session: null, user: null, error: 'Supabase client not initialized' };
  }

  try {
    // If hash contains access_token, let Supabase parse it or get active session
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      return { session: null, user: null, error: sessionErr.message };
    }

    if (sessionData.session) {
      return { session: sessionData.session, user: sessionData.session.user };
    }

    // Try reading user directly
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      return { session: null, user: null, error: userErr.message };
    }

    return { session: null, user: userData.user };
  } catch (err: any) {
    return { session: null, user: null, error: err.message || 'Error processing session' };
  }
}
