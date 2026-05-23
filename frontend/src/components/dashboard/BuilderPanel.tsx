'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { templates } from '@/lib/templates';
import { validateAndCleanConfig } from '@ai-app/shared';
import { apiUrl } from '@/lib/api';
import { translate } from '@/lib/translations';
import { FileCode, AlertTriangle, CheckCircle, Save, Layers, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export const BuilderPanel: React.FC = () => {
  const {
    currentApp,
    editorJson,
    jsonError,
    validationWarnings,
    locale,
    isLoading,
    setCurrentApp,
    setEditorJson,
    setJsonError,
    setValidationWarnings,
    setIsLoading,
    setApps,
    apps,
  } = useAppStore();

  const [appName, setAppName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  // Update local states when current app changes
  useEffect(() => {
    if (currentApp) {
      setAppName(currentApp.name);
      setSubdomain(currentApp.subdomain || '');
    } else {
      setAppName('');
      setSubdomain('');
    }
  }, [currentApp]);

  // Run validation whenever editor JSON changes
  useEffect(() => {
    if (!editorJson) {
      setJsonError(null);
      setValidationWarnings([]);
      return;
    }

    try {
      const parsed = JSON.parse(editorJson);
      setJsonError(null);

      // Validate schema
      const { warnings } = validateAndCleanConfig(parsed);
      setValidationWarnings(warnings);
    } catch (e: any) {
      setJsonError(e.message || 'Malformed JSON syntax');
      setValidationWarnings([]);
    }
  }, [editorJson, setJsonError, setValidationWarnings]);

  const handleTemplateSelect = (templateId: string) => {
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      // Set as currently active editing workspace
      setCurrentApp({
        id: '', // Blank represents new app unsaved
        name: selected.name,
        config: selected.config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setAppName(selected.name);
      toast.success(locale === 'ta' ? 'வார்ப்புரு ஏற்றப்பட்டது!' : 'Template loaded successfully!');
    }
  };

  const handleSave = async () => {
    if (!appName.trim()) {
      toast.error(locale === 'ta' ? 'விண்ணப்பப் பெயர் தேவை!' : 'Application name is required!');
      return;
    }

    if (jsonError) {
      toast.error(locale === 'ta' ? 'பிழையான JSON அமைப்பை சரிசெய்யவும்.' : 'Please fix JSON syntax errors before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const parsedConfig = JSON.parse(editorJson || '{}');
      const { cleanedConfig } = validateAndCleanConfig(parsedConfig);

      const response = await fetch(apiUrl('/api/apps'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentApp?.id || undefined,
          name: appName,
          subdomain: subdomain || undefined,
          config: cleanedConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Save API request failed');
      }

      const result = await response.json();
      setCurrentApp(result.app);
      
      // Refresh apps list
      const listResponse = await fetch(apiUrl('/api/apps'));
      if (listResponse.ok) {
        const listData = await listResponse.json();
        setApps(listData);
      }

      toast.success(translate('saveSuccess', locale));
    } catch (error) {
      console.error(error);
      toast.error(translate('saveError', locale));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (val: string) => {
    setEditorJson(val);
  };

  // Export helper
  const handleExport = () => {
    try {
      const blob = new Blob([editorJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('JSON configuration exported!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  // Import helper
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        JSON.parse(content); // Test JSON syntax
        setEditorJson(content);
        toast.success('JSON configuration imported!');
      } catch (err) {
        toast.error('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-5 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl h-full min-h-[600px]">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <Layers className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-white tracking-tight">
          {translate('jsonEditorTitle', locale)}
        </h2>
      </div>

      {/* Template selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400">
          {translate('templateLabel', locale)}
        </label>
        <select
          onChange={(e) => handleTemplateSelect(e.target.value)}
          defaultValue=""
          className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
        >
          <option value="" disabled>
            -- {translate('templatesTitle', locale)} --
          </option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
      </div>

      {/* Application name input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400">
          {translate('appNameLabel', locale)}
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="e.g. Student Directory App"
          className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Subdomain configuration input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400">
          Subdomain Slug (Hosting Domain Prefix)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g. student-directory"
            className="flex-1 px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
          />
        </div>
        {currentApp?.subdomain && (
          <div className="flex flex-col gap-1 p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl text-[11px] text-zinc-400 mt-1">
            <span className="font-bold text-emerald-400">✓ Form Live Hosted Successfully!</span>
            <span className="flex items-center gap-1.5 mt-1 truncate">
              Hosted link: 
              <a
                href={`http://${currentApp.subdomain}.localhost:3000`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono underline hover:text-emerald-400 font-bold"
              >
                http://{currentApp.subdomain}.localhost:3000
              </a>
            </span>
            <span className="flex items-center gap-1.5 truncate">
              Local fallback: 
              <a
                href={`/?subdomain=${currentApp.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono underline hover:text-emerald-400 font-bold"
              >
                localhost:3000/?subdomain={currentApp.subdomain}
              </a>
            </span>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>JSON Schema Editor</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="hover:text-white px-2 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 cursor-pointer"
            >
              Export
            </button>
            <label className="hover:text-white px-2 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 cursor-pointer">
              Import
              <input type="file" onChange={handleImport} accept=".json" className="hidden" />
            </label>
          </div>
        </div>
        <div className="relative flex-1 flex">
          <textarea
            value={editorJson}
            onChange={(e) => handleConfigChange(e.target.value)}
            className={`w-full h-full p-4 bg-zinc-950/90 border rounded-2xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-colors resize-none overflow-y-auto leading-relaxed border-zinc-800`}
            placeholder={`{\n  "title": "My Dynamic Form",\n  "components": [\n    {\n      "type": "heading",\n      "text": "Header"\n    }\n  ]\n}`}
          />
        </div>
      </div>

      {/* Validation status diagnostics panel */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
          <FileCode className="w-4 h-4 text-emerald-500" />
          <span>{translate('warningsTitle', locale)}</span>
        </div>
        
        {jsonError ? (
          <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <span className="font-mono">{jsonError}</span>
          </div>
        ) : validationWarnings.length > 0 ? (
          <div className="max-h-24 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {validationWarnings.map((warn, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/20 border border-amber-900/20 p-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 p-2.5 rounded-lg">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>{translate('warningsSuccess', locale)}</span>
          </div>
        )}
      </div>

      {/* Builder control actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading || !!jsonError}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold rounded-xl text-sm transition-all hover:scale-[1.01] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isLoading ? translate('saving', locale) : translate('saveBtn', locale)}
        </button>

        {currentApp?.id && (
          <a
            href={`/app/${currentApp.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors border border-zinc-700/50"
            title="Open Standalone Production App Link"
          >
            <Play className="w-4 h-4" />
          </a>
        ) as any}
      </div>
    </div>
  );
};

export default BuilderPanel;
