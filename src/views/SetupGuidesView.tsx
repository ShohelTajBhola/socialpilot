import React, { useState } from 'react';
import {
  Share2,
  Database,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface SetupGuidesViewProps {
  appUrl: string;
  redirectUri: string;
  metaAppId: string;
  supabaseUrl?: string;
}

export const SetupGuidesView: React.FC<SetupGuidesViewProps> = ({
  appUrl,
  redirectUri,
  supabaseUrl,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanSupabaseUrl = supabaseUrl && !supabaseUrl.includes('your-project')
    ? supabaseUrl.replace(/\/$/, '')
    : 'https://<your-supabase-project-ref>.supabase.co';

  const supabaseAuthCallbackUrl = `${cleanSupabaseUrl}/auth/v1/callback`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 w-full overflow-x-hidden">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Integration & OAuth Manual Setup Checklist
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
          Exact manual configuration steps for Google Cloud Console, Meta Developer Portal, and your Supabase project (<code className="font-mono">socialpilot-100</code>).
        </p>
      </div>

      {/* Guide 0: Complete OAuth Manual Configuration Checklist */}
      <div className="p-4 sm:p-6 rounded-2xl border-2 border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Official Google & Facebook OAuth Checklist
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Follow these exact steps to activate live "Continue with Google" & "Continue with Facebook" buttons.
            </p>
          </div>
        </div>

        {/* STEP A: Google Cloud Console */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
              A
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Google Cloud Console: OAuth Client Credentials
            </h4>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
            <li>
              Navigate to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-0.5">Google Cloud Credentials Console <ExternalLink className="w-3 h-3" /></a>.
            </li>
            <li>
              If not already configured, set up your <strong>OAuth consent screen</strong> (User Type: <em>External</em>, App Name: <em>SocialPilot 100+</em>, support email).
            </li>
            <li>
              Click <strong>+ CREATE CREDENTIALS</strong> &rarr; select <strong>OAuth client ID</strong>.
            </li>
            <li>
              Choose Application type: <strong>Web application</strong>. Name: <code className="font-mono text-[11px]">SocialPilot 100+ Web Client</code>.
            </li>
            <li>
              Under <strong>Authorized JavaScript origins</strong>, add:
              <div className="mt-1.5 p-2 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] flex items-center justify-between gap-2">
                <span className="truncate pr-1">{appUrl || window.location.origin}</span>
                <button
                  onClick={() => copyToClipboard(appUrl || window.location.origin, 'origin')}
                  className="p-1.5 hover:text-white text-slate-400 shrink-0"
                  title="Copy Origin"
                >
                  {copiedKey === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </li>
            <li>
              Under <strong>Authorized redirect URIs</strong>, paste your <strong>Supabase Auth Callback URL</strong>:
              <div className="mt-1.5 p-2 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] flex items-center justify-between gap-2">
                <span className="truncate pr-1">{supabaseAuthCallbackUrl}</span>
                <button
                  onClick={() => copyToClipboard(supabaseAuthCallbackUrl, 'sb_google_cb')}
                  className="p-1.5 hover:text-white text-slate-400 shrink-0"
                  title="Copy Supabase Auth Callback"
                >
                  {copiedKey === 'sb_google_cb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </li>
            <li>
              Click <strong>CREATE</strong>. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong>.
            </li>
          </ol>
        </div>

        {/* STEP B: Meta Developer Portal */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
              B
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Meta Developer Portal: Facebook OAuth & Page Permissions
            </h4>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
            <li>
              Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-0.5">Meta Apps <ExternalLink className="w-3 h-3" /></a> and open your app <strong>SocialPilot 100</strong>.
            </li>
            <li>
              Navigate to <strong>Facebook Login for Business &rarr; Settings</strong>.
            </li>
            <li>
              In <strong>Valid OAuth Redirect URIs</strong>, paste BOTH the direct container callback AND the Supabase Auth callback:
              <div className="space-y-1.5 mt-1.5">
                <div className="p-2 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] flex items-center justify-between gap-2">
                  <span className="truncate pr-1">{redirectUri}</span>
                  <button
                    onClick={() => copyToClipboard(redirectUri, 'meta_cb1')}
                    className="p-1.5 hover:text-white text-slate-400 shrink-0"
                    title="Copy Direct Container Callback"
                  >
                    {copiedKey === 'meta_cb1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] flex items-center justify-between gap-2">
                  <span className="truncate pr-1">{supabaseAuthCallbackUrl}</span>
                  <button
                    onClick={() => copyToClipboard(supabaseAuthCallbackUrl, 'meta_cb2')}
                    className="p-1.5 hover:text-white text-slate-400 shrink-0"
                    title="Copy Supabase Callback"
                  >
                    {copiedKey === 'meta_cb2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </li>
            <li>
              Navigate to <strong>App Settings &rarr; Basic</strong> to retrieve your <strong>App ID</strong> and <strong>App Secret</strong>.
            </li>
          </ol>
        </div>

        {/* STEP C: Supabase Authentication Dashboard */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              C
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Supabase Dashboard: Enable Auth Providers & Redirect URLs
            </h4>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
            <li>
              Open your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a> &rarr; go to <strong>Authentication &rarr; Providers</strong>.
            </li>
            <li>
              <strong>Google Provider</strong>: Toggle <strong>Enable Sign in with Google</strong> ON. Paste your Google Cloud <strong>Client ID</strong> and <strong>Client Secret</strong>. Click Save.
            </li>
            <li>
              <strong>Facebook Provider</strong>: Toggle <strong>Enable Sign in with Facebook</strong> ON. Paste your Meta <strong>App ID</strong> and <strong>App Secret</strong>. Click Save.
            </li>
            <li>
              Go to <strong>Authentication &rarr; URL Configuration</strong>:
              <ul className="list-disc list-inside space-y-1.5 mt-1.5 pl-2">
                <li>
                  Set <strong>Site URL</strong> to: <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{appUrl || window.location.origin}</code>
                </li>
                <li>
                  In <strong>Redirect URLs</strong>, add:
                  <div className="mt-1 p-2 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] flex items-center justify-between gap-2">
                    <span className="truncate pr-1">{redirectUri}</span>
                    <button
                      onClick={() => copyToClipboard(redirectUri, 'sb_whitelist')}
                      className="p-1.5 hover:text-white text-slate-400 shrink-0"
                      title="Copy Redirect URI"
                    >
                      {copiedKey === 'sb_whitelist' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ol>
        </div>

        {/* STEP D: Environment Variables */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
              D
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Environment Variables in your AI Studio / Host Environment
            </h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Set these environment keys in <code className="font-mono">.env</code> or your cloud deployment service:
          </p>

          <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] sm:text-xs space-y-1 overflow-x-auto">
            <p>NEXT_PUBLIC_SUPABASE_URL="{cleanSupabaseUrl}"</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publishable-key"</p>
            <p>SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"</p>
            <p>META_APP_ID="your_meta_app_id"</p>
            <p>META_APP_SECRET="your_meta_app_secret"</p>
            <p className="break-all">META_REDIRECT_URI="{redirectUri}"</p>
          </div>
        </div>
      </div>

      {/* Guide 1: Meta Developer App Setup */}
      <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Meta Graph API: Page Publishing Permissions & Live Mode
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Understand permissions for multi-page posting and Meta App Review rules.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Meta Graph API Permission & App Review Notes
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            <li>
              <strong>Development Mode</strong>: Admins, Developers, and Testers added to the Meta App can connect their managed Facebook Pages immediately without App Review.
            </li>
            <li>
              <strong>Live Mode (Advanced Access)</strong>: To allow external users to connect their pages, submit an App Review for <code className="font-mono">pages_manage_posts</code> and <code className="font-mono">pages_read_engagement</code>.
            </li>
            <li>
              <strong>Timeline Policy</strong>: Standard Meta Graph API does not support automated personal profile timeline publishing. Only authorized Facebook Pages can be published to.
            </li>
          </ul>
        </div>
      </div>

      {/* Guide 2: Supabase Setup */}
      <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Supabase PostgreSQL Database Migrations
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Apply database schema and Row Level Security policies.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p>
            1. Open your Supabase project <strong>socialpilot-100</strong> at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a>.
          </p>
          <p>
            2. Go to <strong>SQL Editor</strong> &rarr; click <strong>New Query</strong>.
          </p>
          <p>
            3. Switch to the <strong>Admin Console &rarr; Supabase SQL Schema</strong> tab in this app, copy the generated migration script, paste it into the Supabase SQL editor, and click <strong>Run</strong>.
          </p>
        </div>
      </div>

      {/* Guide 3: Vercel Deployment & GitHub */}
      <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              GitHub & Vercel Production Deployment
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Deploy to Vercel and synchronize with repository ShohelTajBhola/socialpilot.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p>
            1. Repository: <a href="https://github.com/ShohelTajBhola/socialpilot" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-mono break-all">https://github.com/ShohelTajBhola/socialpilot</a>.
          </p>
          <p>
            2. In Vercel Project Settings, add all Environment Variables from <code className="font-mono">.env.example</code>.
          </p>
          <p>
            3. Scheduled Publishing on Vercel: Vercel Cron Jobs can trigger <code className="font-mono">/api/queue/process</code> every minute by adding a <code className="font-mono">vercel.json</code> cron configuration:
          </p>

          <div className="p-3 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] sm:text-xs overflow-x-auto">
            <pre>{`{
  "crons": [
    {
      "path": "/api/queue/process",
      "schedule": "* * * * *"
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
