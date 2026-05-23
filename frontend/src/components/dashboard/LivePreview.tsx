'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { validateAndCleanConfig } from '@ai-app/shared';
import { translate } from '@/lib/translations';
import FormRenderer from '@/components/renderer/FormRenderer';
import ErrorBoundary from '@/components/renderer/ErrorBoundary';
import { Globe, Moon, Sun, MonitorPlay } from 'lucide-react';

interface LivePreviewProps {
  onSuccessSubmit?: (data: any, logs: any) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ onSuccessSubmit }) => {
  const {
    editorJson,
    locale,
    theme,
    currentApp,
    setLocale,
    toggleTheme,
  } = useAppStore();

  // Safeguard JSON parsing
  let cleanedConfig = null;
  let parseError = false;

  try {
    const parsed = editorJson ? JSON.parse(editorJson) : {};
    const validation = validateAndCleanConfig(parsed);
    cleanedConfig = validation.cleanedConfig;
  } catch (err) {
    parseError = true;
  }

  return (
    <div className="flex flex-col gap-5 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl h-full flex-1">
      {/* Header with locale and theme switchers */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {translate('previewTitle', locale)}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <button
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                locale === 'en' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ta')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                locale === 'ta' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={translate('themeSelector', locale)}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Render Canvas Area */}
      <div
        className={`flex-1 rounded-2xl p-6 border transition-all duration-300 overflow-y-auto min-h-[400px] ${
          theme === 'light'
            ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
            : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-100'
        }`}
      >
        {parseError ? (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3 py-16">
            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-200">
              Config Syntax Error
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              The renderer cannot evaluate your schema due to invalid JSON syntax. Please check the JSON editor for diagnostic details.
            </p>
          </div>
        ) : cleanedConfig && cleanedConfig.components.length > 0 ? (
          <div className="flex flex-col gap-6">
            {/* Header detail */}
            <div className="border-b border-zinc-800/20 pb-4">
              <span className="text-[10px] tracking-widest font-bold uppercase text-emerald-500">
                {currentApp?.name || 'Local Builder Sandbox'}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                {translate(cleanedConfig.title, locale)}
              </h1>
              {cleanedConfig.description && (
                <p className="text-sm text-zinc-400 mt-1">
                  {translate(cleanedConfig.description, locale)}
                </p>
              )}
            </div>

            {/* Form & Component rendering block inside ErrorBoundary */}
            <ErrorBoundary>
              <FormRenderer
                appId={currentApp?.id}
                config={cleanedConfig}
                locale={locale}
                onSuccessSubmit={onSuccessSubmit}
                isPreview={!currentApp?.id} // If no ID, run simulation mode
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full py-20 text-zinc-500">
            <svg className="w-12 h-12 text-zinc-600 mb-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p className="text-sm font-medium">{translate('previewEmpty', locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
