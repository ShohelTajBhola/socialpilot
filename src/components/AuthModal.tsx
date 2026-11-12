import React, { useState } from 'react';
import { X, Check, Loader2, AlertCircle, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import type { UserProfile } from '../types';
import { signInWithGoogle, signInWithFacebook, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (userId: string) => Promise<void>;
  onLogin: (email: string) => Promise<void>;
  onRegister: (data: { email: string; fullName: string; role?: string }) => Promise<void>;
  onOpenGuides?: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onRegister,
  onOpenGuides,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'switch' | 'new'>('oauth');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [quickSwitchLoading, setQuickSwitchLoading] = useState<string | null>(null);

  // OAuth states
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const hasSupabaseConfig = isSupabaseConfigured();

  // Handle Google OAuth via Supabase
  const handleGoogleLogin = async () => {
    if (oauthLoading) return; // Prevent duplicate clicks
    setOauthError(null);
    setOauthLoading('google');

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setOauthError(result.error);
        setOauthLoading(null);
      }
      // If popup opened or browser redirected, oauthLoading remains active until callback or timeout
    } catch (err: any) {
      setOauthError(err.message || 'An unexpected error occurred during Google OAuth.');
      setOauthLoading(null);
    }
  };

  // Handle Facebook OAuth via Supabase
  const handleFacebookLogin = async () => {
    if (oauthLoading) return; // Prevent duplicate clicks
    setOauthError(null);
    setOauthLoading('facebook');

    try {
      const result = await signInWithFacebook();
      if (result.error) {
        setOauthError(result.error);
        setOauthLoading(null);
      }
      // If popup opened or browser redirected, oauthLoading remains active until callback or timeout
    } catch (err: any) {
      setOauthError(err.message || 'An unexpected error occurred during Facebook OAuth.');
      setOauthLoading(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    setRegisterLoading(true);
    try {
      await onRegister({ email, fullName, role });
      onClose();
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleQuickSwitch = async (userId: string) => {
    setQuickSwitchLoading(userId);
    try {
      await onSwitchUser(userId);
      onClose();
    } finally {
      setQuickSwitchLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-[calc(100vw-24px)] sm:w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="min-w-0 pr-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              Authentication & Session
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Active: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.fullName}</span> ({currentUser.role.replace('_', ' ')})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            aria-label="Close authentication dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === 'oauth'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Social OAuth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] flex items-center justify-center ${
              activeTab === 'switch'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Preset Team
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] flex items-center justify-center ${
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Manual Account
          </button>
        </div>

        {/* Tab 1: Official Social OAuth (Google & Facebook via Supabase) */}
        {activeTab === 'oauth' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Sign in with official credentials powered by Supabase Auth
              </p>
              <p className="text-[11px] text-slate-400">
                Authorizes access and automatically provisions your publisher workspace.
              </p>
            </div>

            {/* Error Message Alert */}
            {oauthError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold">Authentication Error</p>
                  <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                    {oauthError}
                  </p>
                  {onOpenGuides && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGuides();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-900 dark:text-rose-200 underline mt-1"
                    >
                      <span>View OAuth Configuration Checklist</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Supabase Notice if not configured */}
            {!hasSupabaseConfig && !oauthError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 text-[11px] space-y-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Supabase Auth Setup Required</p>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Set <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable production OAuth.
                  </p>
                  {onOpenGuides && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGuides();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100 underline mt-1"
                    >
                      <span>Open Setup Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OAuth Buttons Stack */}
            <div className="space-y-2.5 pt-1">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={oauthLoading !== null}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-slate-600"
              >
                {oauthLoading === 'google' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>Connecting to Google OAuth...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Logo SVG */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Facebook Login Button */}
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={oauthLoading !== null}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'facebook' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Meta Facebook OAuth...</span>
                  </>
                ) : (
                  <>
                    {/* Official Facebook 'f' Logo SVG */}
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Continue with Facebook</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Redirect URI configured to: <code className="font-mono text-[10px] text-slate-600 dark:text-slate-300">/auth/callback</code>
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Preset Profiles Switcher */}
        {activeTab === 'switch' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select a pre-configured profile to test RBAC roles, isolated post queues, and connected page fleets:
            </p>

            <div className="space-y-2 pt-1">
              {availableUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const isSwitching = quickSwitchLoading === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => !isCurrent && !isSwitching && handleQuickSwitch(u.id)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between min-h-[48px] cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 cursor-default ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        {isSwitching ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        ) : (
                          u.fullName[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {u.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                          u.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Manual Account Registration */}
        {activeTab === 'new' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@agency.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Initial Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="user">User (Social Media Publisher)</option>
                <option value="admin">Admin (Manage Team & Pages)</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={registerLoading || !email || !fullName}
              className="w-full py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {registerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
