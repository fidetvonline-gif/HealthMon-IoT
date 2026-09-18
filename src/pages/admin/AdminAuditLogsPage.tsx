import React, { useState } from 'react';
import { Terminal, Download, Search, Filter } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { DeviceLog } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const { logs } = useHealthData();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredLogs = logs.filter((log: DeviceLog) => {
    if (typeFilter !== 'ALL' && log.event_type !== typeFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.device_id.toLowerCase().includes(q) ||
        (log.actor && log.actor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportLogs = () => {
    const text = filteredLogs
      .map((l: DeviceLog) => `[${l.created_at}] [${l.event_type}] [${l.device_id}] ${l.message}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthMon_AuditLogs_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-slate-800" />
            <span>Hardware Telemetry & Audit Logs (Feature 18 & 19)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log trail of ESP32 boot cycles, sensor calibration events, alert triggers and clinic interventions
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search log messages or Device ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
        >
          <option value="ALL">All Event Types ({logs.length})</option>
          <option value="READING_RECEIVED">READING_RECEIVED</option>
          <option value="ALERT_CREATED">ALERT_CREATED</option>
          <option value="ALERT_REVIEWED">ALERT_REVIEWED</option>
          <option value="ALERT_RESOLVED">ALERT_RESOLVED</option>
          <option value="DEVICE_ONLINE">DEVICE_ONLINE</option>
          <option value="THRESHOLD_CHANGED">THRESHOLD_CHANGED</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
        </select>
      </div>

      {/* Terminal Style Log Viewer */}
      <div className="rounded-2xl border border-slate-900 bg-slate-950 shadow-xl overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-bold text-slate-300 text-[11px]">syslog@healthmon-core: /var/log/iot.log</span>
          </div>
          <span className="text-[11px] text-slate-500">{filteredLogs.length} events buffered</span>
        </div>

        <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-6 text-center">No audit log records match filter.</div>
          ) : (
            filteredLogs.map((l: DeviceLog) => {
              const dateStr = new Date(l.created_at).toISOString().replace('T', ' ').substring(0, 19);
              const isAlert = l.event_type === 'ALERT_CREATED';
              const isResolved = l.event_type === 'ALERT_RESOLVED';

              return (
                <div key={l.id} className="flex items-start gap-2 hover:bg-slate-900/50 p-1 rounded transition-colors">
                  <span className="text-slate-500 select-none text-[11px]">{dateStr}</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      isAlert
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : isResolved
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}
                  >
                    {l.event_type}
                  </span>
                  <span className="text-purple-400 font-semibold text-[11px] shrink-0">[{l.device_id}]</span>
                  <span className={isAlert ? 'text-rose-300' : 'text-slate-300'}>{l.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
