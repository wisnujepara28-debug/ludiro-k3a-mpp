import React from 'react';
import { Activity, Clock, ShieldCheck, Database, RefreshCw, CheckCircle2, User } from 'lucide-react';
import { ActivityLog } from '../types';

interface AuditLogsViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onRefresh }) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Audit Trail & Log Transaksi Database
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak setiap aksi Create, Read, Update, Delete yang tersimpan secara persisten pada server database.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Segarkan Log
        </button>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 text-xs text-slate-500 font-medium">
          <span>Menampilkan {logs.length} riwayat aktivitas terakhir</span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <Database className="w-3.5 h-3.5" /> Database Single Source of Truth
          </span>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Belum ada riwayat aktivitas tercatat</p>
            </div>
          ) : (
            logs.map((log) => {
              const isCreate = log.action === 'CREATE';
              const isUpdate = log.action === 'UPDATE';
              const isDelete = log.action === 'DELETE';
              const isLogin = log.action === 'LOGIN';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition flex items-start justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase shrink-0 mt-0.5 ${
                        isCreate
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUpdate
                          ? 'bg-blue-100 text-blue-800'
                          : isDelete
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {log.action}
                    </span>

                    <div>
                      <div className="font-semibold text-slate-900 leading-tight">
                        {log.details}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.userName}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">Entitas: {log.entity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    WIB
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
