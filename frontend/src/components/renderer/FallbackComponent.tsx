import React from 'react';
import { AlertCircle, FileCode } from 'lucide-react';

interface FallbackComponentProps {
  type?: string;
  name?: string;
  warning?: string;
  rawJson?: any;
}

export const FallbackComponent: React.FC<FallbackComponentProps> = ({
  type = 'unknown',
  name,
  warning = 'Unknown component type',
  rawJson,
}) => {
  return (
    <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-300 my-2">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-amber-200">
              Fallback Render: &lt;{type} /&gt;
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              Warning
            </span>
          </div>
          <p className="text-xs text-amber-400/80 mt-1">
            {warning} {name ? `(name: "${name}")` : ''}
          </p>
          {rawJson && (
            <details className="mt-2 group">
              <summary className="text-[11px] font-medium text-amber-400 cursor-pointer hover:underline list-none flex items-center gap-1">
                <FileCode className="w-3 h-3 inline" />
                <span>Show component raw configuration</span>
              </summary>
              <pre className="mt-2 text-[10px] bg-black/40 text-amber-200/70 p-2.5 rounded-lg border border-amber-500/10 font-mono overflow-x-auto max-h-32">
                {JSON.stringify(rawJson, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default FallbackComponent;
