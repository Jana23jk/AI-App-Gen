'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translate } from '@/lib/translations';
import { Database, FileText, Activity, Clock, Terminal } from 'lucide-react';

export const SubmissionsPanel: React.FC = () => {
  const { submissions, locale } = useAppStore();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const selectedSubmission = submissions.find((s) => s.id === selectedSubmissionId);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <Database className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-white tracking-tight">
          {translate('submissionsTitle', locale)}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold ml-2">
          {submissions.length} total
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 text-zinc-500">
          <FileText className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-sm font-medium">{translate('submissionsEmpty', locale)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of submissions */}
          <div className="lg:col-span-1 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/20 max-h-[350px] overflow-y-auto pr-1">
            <div className="divide-y divide-zinc-800/60">
              {submissions.map((sub, i) => {
                const isSelected = sub.id === selectedSubmissionId;
                const dateStr = new Date(sub.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`w-full text-left p-4 flex flex-col gap-1.5 transition-colors cursor-pointer hover:bg-zinc-800/10 ${
                      isSelected ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        ID: {sub.id.substring(0, 8)}...
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {Object.keys(sub.data).length} fields submitted
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Drawer */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {selectedSubmission ? (
              <div className="flex flex-col gap-4 h-full">
                {/* Data payload display */}
                <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/40">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{translate('payload', locale)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-1">
                    {Object.entries(selectedSubmission.data).map(([key, val]) => (
                      <div key={key} className="bg-zinc-900/40 border border-zinc-800/30 rounded-xl p-3 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
                          {key}
                        </span>
                        <span className="text-sm font-bold text-white mt-1">
                          {val === true ? 'Yes' : val === false ? 'No' : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow log display */}
                {selectedSubmission.logs && (
                  <div className="border border-zinc-800/80 rounded-xl p-5 bg-zinc-950/60 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-3 border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                        <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                        <span>{translate('automationLogs', locale)}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        Triggered Successfully
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-zinc-400 gap-2">
                        <span>
                          Event: <strong className="text-white">{(selectedSubmission.logs as any).event}</strong>
                        </span>
                        <span>
                          Time: <strong className="text-white">{new Date((selectedSubmission.logs as any).timestamp).toLocaleTimeString()}</strong>
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                        <Terminal className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-300 font-mono">
                            {(selectedSubmission.logs as any).summary || 'Workflow executed successfully.'}
                          </p>
                          <pre className="mt-3 text-[10px] text-zinc-500 font-mono overflow-x-auto bg-black/35 p-3 rounded border border-zinc-850 max-h-36">
                            {JSON.stringify((selectedSubmission.logs as any).metadata || selectedSubmission.logs, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full border border-dashed border-zinc-800 rounded-xl p-8 text-zinc-600 bg-zinc-950/10">
                <Database className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-xs font-medium">Select a submission from the list to view data & workflow log details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPanel;
