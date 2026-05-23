'use client';

import React from 'react';
import { ComponentSchema } from '@ai-app/shared';
import { translate, LocaleType } from '@/lib/translations';
import FallbackComponent from './FallbackComponent';
import { AlertCircle, HelpCircle, FileText, CheckCircle, Database } from 'lucide-react';

interface ComponentRendererProps {
  component: ComponentSchema;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  locale: LocaleType;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  value,
  onChange,
  error,
  locale,
}) => {
  const tLabel = component.label ? translate(component.label, locale) : '';
  const tText = component.text ? translate(component.text, locale) : '';
  const tPlaceholder = component.placeholder ? translate(component.placeholder, locale) : '';

  switch (component.type) {
    case 'heading': {
      return (
        <div className={`my-4 ${component.className || ''}`}>
          <h2 className="text-2xl font-bold tracking-tight text-white border-b border-zinc-800 pb-2">
            {tText}
          </h2>
        </div>
      );
    }

    case 'input': {
      return (
        <div className={`flex flex-col gap-1.5 w-full ${component.className || ''}`}>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            {tLabel}
            {component.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name={component.name}
            placeholder={tPlaceholder}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`px-4 py-2.5 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-800'
            }`}
          />
          {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
        </div>
      );
    }

    case 'textarea': {
      return (
        <div className={`flex flex-col gap-1.5 w-full ${component.className || ''}`}>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            {tLabel}
            {component.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name={component.name}
            placeholder={tPlaceholder}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            rows={4}
            className={`px-4 py-2.5 bg-zinc-950/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none ${
              error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-800'
            }`}
          />
          {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
        </div>
      );
    }

    case 'select': {
      const optionsList = Array.isArray(component.options) ? component.options : [];
      return (
        <div className={`flex flex-col gap-1.5 w-full ${component.className || ''}`}>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            {tLabel}
            {component.required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              name={component.name}
              value={value ?? ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={`w-full px-4 py-2.5 bg-zinc-950/60 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer ${
                error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-800'
              }`}
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-500">
                {tPlaceholder || '-- Select Option --'}
              </option>
              {optionsList.map((opt: any, i: number) => {
                const optStr = String(opt);
                return (
                  <option key={i} value={optStr} className="bg-zinc-900 text-white">
                    {translate(optStr, locale)}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
        </div>
      );
    }

    case 'checkbox': {
      return (
        <div className={`flex items-center gap-3 py-1 ${component.className || ''}`}>
          <label className="relative flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={component.name}
              checked={!!value}
              onChange={(e) => onChange?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 bg-zinc-950/60 border border-zinc-800 rounded-lg peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-500/20 transition-all flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-black font-bold opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="ml-3 text-sm font-semibold text-zinc-300">{tLabel}</span>
          </label>
        </div>
      );
    }

    case 'button': {
      return (
        <div className={`pt-2 ${component.className || ''}`}>
          <button
            type={component.buttonType || 'submit'}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl text-sm transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            {tText || 'Submit'}
          </button>
        </div>
      );
    }

    case 'table': {
      const cols = Array.isArray(component.columns) ? component.columns : [];
      const rows = Array.isArray(component.rows) ? component.rows : [];
      return (
        <div className={`my-4 overflow-hidden border border-zinc-800 bg-zinc-900/20 rounded-xl ${component.className || ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs font-bold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  {cols.map((col: string, i: number) => (
                    <th key={i} className="px-6 py-4 font-semibold tracking-wider text-white">
                      {translate(col, locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-transparent">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length || 1} className="px-6 py-8 text-center text-zinc-500 italic">
                      No rows available
                    </td>
                  </tr>
                ) : (
                  rows.map((row: any, rIndex: number) => (
                    <tr key={rIndex} className="hover:bg-zinc-800/10 transition-colors">
                      {cols.map((col: string, cIndex: number) => (
                        <td key={cIndex} className="px-6 py-4 font-medium whitespace-nowrap text-zinc-200">
                          {row[col] !== undefined ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case 'card': {
      return (
        <div className={`p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md shadow-xl flex flex-col gap-2 ${component.className || ''}`}>
          {component.title && (
            <h3 className="text-lg font-bold text-white tracking-tight">
              {translate(component.title, locale)}
            </h3>
          )}
          {tText && <p className="text-sm text-zinc-400 leading-relaxed">{tText}</p>}
        </div>
      );
    }

    case 'stats card': {
      // Pick a visual icon accent
      const renderIcon = () => {
        switch (component.icon) {
          case 'user':
          case 'users':
            return <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400"><CheckCircle className="w-5 h-5" /></div>;
          case 'database':
            return <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400"><Database className="w-5 h-5" /></div>;
          case 'document':
            return <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400"><FileText className="w-5 h-5" /></div>;
          default:
            return <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400"><HelpCircle className="w-5 h-5" /></div>;
        }
      };

      return (
        <div className={`p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-lg flex items-center justify-between gap-4 ${component.className || ''}`}>
          <div className="flex-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {tLabel || 'Statistic'}
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {component.value !== undefined ? String(component.value) : '0'}
            </div>
          </div>
          {renderIcon()}
        </div>
      );
    }

    default: {
      return (
        <FallbackComponent
          type={component.type}
          name={component.name}
          warning={`Unknown component type "${component.type}" detected.`}
          rawJson={component}
        />
      );
    }
  }
};

export default ComponentRenderer;
