'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translate } from '@/lib/translations';
import BuilderPanel from '@/components/dashboard/BuilderPanel';
import LivePreview from '@/components/dashboard/LivePreview';
import SubmissionsPanel from '@/components/dashboard/SubmissionsPanel';
import FormRenderer from '@/components/renderer/FormRenderer';
import ErrorBoundary from '@/components/renderer/ErrorBoundary';
import { validateAndCleanConfig } from '@ai-app/shared';
import { apiUrl } from '@/lib/api';
import { Toaster } from 'react-hot-toast';
import { Sparkles, FolderOpen, PlusCircle, Monitor, Globe, Moon, Sun, ArrowLeft, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    apps,
    currentApp,
    locale,
    theme,
    setApps,
    setCurrentApp,
    setSubmissions,
    submissions,
  } = useAppStore();

  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(null);
  const [subdomainApp, setSubdomainApp] = useState<any | null>(null);
  const [subdomainLoading, setSubdomainLoading] = useState(true);
  const [subdomainLocale, setSubdomainLocale] = useState<'en' | 'ta'>('en');
  const [subdomainTheme, setSubdomainTheme] = useState<'light' | 'dark'>('dark');

  // Subdomain detection on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    let sub: string | null = null;

    // Check URL query parameters first (?subdomain=slug) for convenient local dev testing
    const urlParams = new URLSearchParams(window.location.search);
    sub = urlParams.get('subdomain');

    // Check hostname subdomain (e.g. student-directory.localhost)
    if (!sub && parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== '127') {
      sub = parts[0];
    }

    if (sub) {
      setDetectedSubdomain(sub);
      const fetchSubdomainApp = async () => {
        try {
          const res = await fetch(apiUrl(`/api/apps/subdomain/${sub}`));
          if (res.ok) {
            const data = await res.json();
            setSubdomainApp(data.app);
          } else {
            console.error('Subdomain app not found');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSubdomainLoading(false);
        }
      };
      fetchSubdomainApp();
    } else {
      setSubdomainLoading(false);
    }
  }, []);

  // 1. Fetch saved apps on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(apiUrl('/api/apps'));
        if (res.ok) {
          const data = await res.json();
          setApps(data);
        }
      } catch (err) {
        console.error('Failed to load apps:', err);
      }
    };
    fetchApps();
  }, [setApps]);

  // 2. Fetch submissions for the selected app (with 5-second polling interval)
  useEffect(() => {
    if (!currentApp?.id) {
      setSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(apiUrl(`/api/apps/${currentApp.id}`));
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error('Failed to load submissions:', err);
      }
    };

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);

    return () => clearInterval(interval);
  }, [currentApp?.id, setSubmissions]);

  // PWA Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator && (window as any).workbox === undefined) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('PWA Service Worker registration failed:', err));
    }
  }, []);

  const handleCreateNew = () => {
    // Clear workspace for custom builder
    setCurrentApp(null);
  };

  const handleLoadApp = (app: any) => {
    setCurrentApp(app);
  };

  const handleLocalSubmitSuccess = (data: any, logs: any) => {
    // Append simulated or saved submission to store in real time
    const newSubmission = {
      id: Math.random().toString(36).substring(2, 11),
      appId: currentApp?.id || 'preview',
      data,
      logs,
      createdAt: new Date().toISOString(),
    };
    setSubmissions([newSubmission, ...submissions]);
  };

  // If a subdomain is detected, render the standalone hosted form view instead of the editor dashboard
  if (detectedSubdomain) {
    if (subdomainLoading) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">
            Loading Hosted Subdomain App ({detectedSubdomain})...
          </span>
        </div>
      );
    }

    if (!subdomainApp) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4 p-6 text-center">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">404: Hosted Subdomain Not Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            The subdomain link "{detectedSubdomain}" does not correspond to any active dynamic application in the database.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Platform Builder
          </Link>
        </div>
      );
    }

    const { cleanedConfig } = validateAndCleanConfig(subdomainApp.config);

    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        subdomainTheme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-black text-zinc-100'
      }`}>
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Platform Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-emerald-500" />
              <span className="text-xs font-extrabold uppercase text-white tracking-widest font-mono">
                Hosted Application Runtime
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setSubdomainLocale('en')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    subdomainLocale === 'en' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setSubdomainLocale('ta')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    subdomainLocale === 'ta' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              <button
                onClick={() => setSubdomainTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
              >
                {subdomainTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
          <div className={`rounded-3xl p-8 border shadow-2xl transition-colors duration-300 ${
            subdomainTheme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
          }`}>
            <div className="border-b border-zinc-800/10 pb-6 mb-8">
              <span className="text-[10px] tracking-widest font-bold uppercase text-emerald-500 font-mono">
                Subdomain: {detectedSubdomain}.localhost:3000
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                {translate(cleanedConfig.title, subdomainLocale)}
              </h1>
              {cleanedConfig.description && (
                <p className="text-sm text-zinc-400 mt-2">
                  {translate(cleanedConfig.description, subdomainLocale)}
                </p>
              )}
            </div>

            <ErrorBoundary>
              <FormRenderer
                appId={subdomainApp.id}
                config={cleanedConfig}
                locale={subdomainLocale}
              />
            </ErrorBoundary>
          </div>
        </main>
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // Normal Platform Dashboard Workspace
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-black text-zinc-100'
    }`}>
      {/* Premium Gradient Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-black shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wider flex items-center gap-1.5 uppercase">
                {translate('brandName', locale)}
                <span className="text-[10px] lowercase font-normal bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
                  v1.0.0
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium">
                Metadata-Driven Application Runtime Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create App Scratchpad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {translate('builderTitle', locale)}
          </h2>
          <p className="text-sm text-zinc-400">
            {translate('builderSubtitle', locale)}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          {/* Sidebar Area: Saved Configurations */}
          <div className="xl:col-span-2 flex flex-col gap-5 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <FolderOpen className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {translate('loadAppsTitle', locale)}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {translate('loadAppsDesc', locale)}
            </p>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {apps.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 italic">
                  {translate('noAppsSaved', locale)}
                </div>
              ) : (
                apps.map((app) => {
                  const isSelected = app.id === currentApp?.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleLoadApp(app)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/20 text-zinc-300'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{app.name}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">
                          ID: {app.id.substring(0, 8)}...
                        </span>
                      </div>
                      <Monitor className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Builder Panel & Editor */}
          <div className="xl:col-span-5 h-full">
            <BuilderPanel />
          </div>

          {/* Live Preview canvas */}
          <div className="xl:col-span-5 h-full">
            <LivePreview onSuccessSubmit={handleLocalSubmitSuccess} />
          </div>
        </div>

        {/* Submissions Data Viewer */}
        <SubmissionsPanel />
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
