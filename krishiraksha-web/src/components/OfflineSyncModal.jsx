import React from 'react';
import { useOffline } from '../context/OfflineContext';
import { Wifi, RefreshCw, Trash2, X, CheckCircle, Clock } from 'lucide-react';

export function OfflineSyncModal() {
  const { isOffline, queue, syncQueue, clearQueue, isSyncing, showSyncModal, setShowSyncModal } = useOffline();

  if (!showSyncModal) return null;

  const handleSync = async () => {
    await syncQueue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md glass-panel-glow rounded-2xl p-5 border border-emerald-500/30 text-slate-100 shadow-2xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Offline Sync Manager</h3>
              <p className="text-xs text-slate-400">
                {isOffline ? 'Device is simulated offline' : 'Online — ready to sync with backend'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSyncModal(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-200">Offline Queue Empty</p>
            <p className="text-[11px] text-slate-400 mt-1">
              All crop observations are fully synchronized with the central server.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            <p className="text-xs text-slate-400 font-medium">
              {queue.length} observation(s) captured offline awaiting sync:
            </p>
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">
                    Field #{item.data.field_id} — {item.data.symptom_keywords?.join(', ') || 'Visual scan'}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Captured: {new Date(item.queuedAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  queued
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={clearQueue}
            disabled={queue.length === 0}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyncModal(false)}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Close
            </button>
            <button
              onClick={handleSync}
              disabled={queue.length === 0 || isSyncing || isOffline}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 disabled:opacity-40 shadow-md shadow-emerald-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
