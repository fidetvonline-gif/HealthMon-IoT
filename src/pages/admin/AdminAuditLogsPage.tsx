import React, { useState } from 'react';
import { Terminal, Download, Search } from 'lucide-react';
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
    link.download = `VitaTrack_AuditLogs_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#474A2C]" />
            <span>Hardware Telemetry & Audit Logs</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Audit trail of ESP32 boot cycles, sensor calibration events, alert triggers, and clinic actions
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="btn-secondary text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card-panel p-4 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <input
            type="text"
            placeholder="Search log messages or Device ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-select text-xs w-auto"
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

      {/* Terminal Viewer */}
      <div className="card-panel bg-[#0B1726] border border-[#12263A] rounded-[8px] overflow-hidden font-mono text-xs text-white">
        <div className="flex items-center justify-between border-b border-[#12263A] bg-[#12263A] px-4 py-2.5 text-[#98A2B3]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C24141]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#B7791F]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#16805C]" />
            <span className="ml-2 font-bold text-white text-[11px]">syslog@vitatrack: /var/log/iot.log</span>
          </div>
          <span className="text-[11px] text-[#98A2B3]">{filteredLogs.length} events</span>
        </div>

        <div className="p-4 space-y-1.5 max-h-[480px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-[#98A2B3] py-6 text-center">No audit log records match filter.</div>
          ) : (
            filteredLogs.map((l: DeviceLog) => {
              const dateStr = new Date(l.created_at).toISOString().replace('T', ' ').substring(0, 19);
              const isAlert = l.event_type === 'ALERT_CREATED';
              const isResolved = l.event_type === 'ALERT_RESOLVED';

              return (
                <div key={l.id} className="flex items-start gap-2 hover:bg-[#12263A]/50 p-1 rounded transition-colors">
                  <span className="text-[#98A2B3] select-none text-[11px]">{dateStr}</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      isAlert
                        ? 'bg-[#C24141]/20 text-[#C24141] border border-[#C24141]/40'
                        : isResolved
                        ? 'bg-[#16805C]/20 text-[#16805C] border border-[#16805C]/40'
                        : 'bg-[#2764A5]/20 text-[#2764A5] border border-[#2764A5]/40'
                    }`}
                  >
                    {l.event_type}
                  </span>
                  <span className="text-[#474A2C] font-semibold text-[11px] shrink-0">[{l.device_id}]</span>
                  <span className={isAlert ? 'text-[#C24141]' : 'text-[#E2E6EB]'}>{l.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
