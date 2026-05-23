'use client';

import React, { use, useEffect, useState } from 'react';
import { AppConfig, AppInstance, validateAndCleanConfig } from '@ai-app/shared';
import { LocaleType, translate } from '@/lib/translations';
import FormRenderer from '@/components/renderer/FormRenderer';
import ErrorBoundary from '@/components/renderer/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { Globe, Moon, Sun, ArrowLeft, Cpu, CheckCircle2, Terminal } from 'lucide-react';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';

interface StandaloneAppPageProps {
  params: Promise<{ id: string }>;
}

export default function StandaloneAppPage({ params }: StandaloneAppPageProps) {
  const { id } = use(params);

  const [app, setApp] = useState<AppInstance | null>(null);
  const [locale, setLocale] = useState<LocaleType>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Track successful submissions locally to display history logs
  const [localLogs, setLocalLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await fetch(apiUrl(`/api/apps/${id}`));
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error('Failed to fetch application');
        }
        const data = await response.json();
        setApp(data.app);
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred loading the application');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const handleLocalSubmitSuccess = (data: any, logs: any) => {
    setLocalLogs((prev) => [logs, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider">
          Loading Dynamic Application Runtime...
        </span>
      </div>
    );
  }

  if (errorMsg || !app) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4 p-6 text-center">
        <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Application Loading Error</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          {errorMsg || 'The app configuration could not be retrieved from the server database.'}
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Parse and clean config to ensure zero-crash guarantee
  const { cleanedConfig } = validateAndCleanConfig(app.config);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-black text-zinc-100'
    }`}>
      {/* Header bar */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-emerald-500" />
            <span className="text-xs font-extrabold uppercase text-white tracking-widest font-mono">
              Live Runtime Client
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Locale Selector */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 rounded-xl p-1 text-xs">
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  locale === 'en' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('ta')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  locale === 'ta' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Execution Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div
          className={`rounded-3xl p-8 border shadow-2xl transition-colors duration-300 ${
            theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
          }`}
        >
          {/* Header block */}
          <div className="border-b border-zinc-800/10 pb-6 mb-8">
            <span className="text-[10px] tracking-widest font-bold uppercase text-emerald-500 font-mono">
              Dynamic App: {app.name}
            </span>
            <h1 className={`text-3xl font-extrabold tracking-tight mt-1 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              {translate(cleanedConfig.title, locale)}
            </h1>
            {cleanedConfig.description && (
              <p className="text-sm text-zinc-400 mt-2">
                {translate(cleanedConfig.description, locale)}
              </p>
            )}
          </div>

          {/* Form renderer with zero-crash boundary wrapper */}
          <ErrorBoundary>
            <FormRenderer
              appId={app.id}
              config={cleanedConfig}
              locale={locale}
              onSuccessSubmit={handleLocalSubmitSuccess}
            />
          </ErrorBoundary>
        </div>

        {/* Local Workflow Logs history visualizer (useful for viewing what flows just executed) */}
        {localLogs.length > 0 && (
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Active Workflow logs (Successful submissions)</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                Live Automation Monitor
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
              {localLogs.map((log, index) => (
                <div key={index} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span>Event: <strong className="text-white">{log.event}</strong></span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 font-mono">
                        {log.summary || 'Transaction completed successfully.'}
                      </p>
                      <pre className="mt-2 text-[9px] text-zinc-500 font-mono bg-black/40 p-2.5 rounded border border-zinc-900 overflow-x-auto">
                        {JSON.stringify(log.metadata || log, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
