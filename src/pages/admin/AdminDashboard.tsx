import React from 'react';
import {
  ShieldCheck,
  Users,
  Cpu,
  Sliders,
  FileText,
  Database,
  Radio,
  Server,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenFirmware: () => void;
  onOpenSimulator: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenFirmware,
  onOpenSimulator,
}) => {
  const { availableUsers } = useAuth();
  const { devices, alerts, readings, logs, isAutoStreaming, setIsAutoStreaming } = useHealthData();

  const studentsCount = availableUsers.filter((u) => u.role === 'STUDENT').length;
  const healthStaffCount = availableUsers.filter((u) => u.role === 'HEALTHCARE').length;
  const onlineDevicesCount = devices.filter((d) => d.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card-panel bg-[#0B1726] text-white p-6 rounded-[8px] border border-[#12263A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#12263A] text-[#087F8C] text-xs font-semibold mb-2 border border-[#334155]/40">
              <ShieldCheck className="h-3.5 w-3.5 text-[#087F8C]" />
              <span>Root System Operations</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">VitaTrack System Administration</h1>
            <p className="mt-1 text-xs text-[#98A2B3]">
              Hardware fleet orchestration, clinical threshold rules, user provisioning, and audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenFirmware}
              className="btn-secondary text-xs"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>ESP32 Firmware</span>
            </button>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="btn-primary text-xs"
            >
              <Radio className="h-3.5 w-3.5" />
              <span>IoT Test Bench</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab('users')}
          className="card-panel p-4 rounded-[8px] cursor-pointer hover:border-[#087F8C] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-[#087F8C]" />
          </div>
          <span className="text-2xl font-bold text-[#17202A] font-mono">{availableUsers.length}</span>
          <div className="mt-2 text-[11px] text-[#667085]">
            {studentsCount} Students • {healthStaffCount} Staff
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('devices')}
          className="card-panel p-4 rounded-[8px] cursor-pointer hover:border-[#16805C] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Hardware Nodes</span>
            <Cpu className="h-4 w-4 text-[#16805C]" />
          </div>
          <span className="text-2xl font-bold text-[#16805C] font-mono">
            {onlineDevicesCount} / {devices.length}
          </span>
          <div className="mt-2 text-[11px] text-[#667085]">
            Online ESP32 Wearables
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('thresholds')}
          className="card-panel p-4 rounded-[8px] cursor-pointer hover:border-[#2764A5] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Threshold Rules</span>
            <Sliders className="h-4 w-4 text-[#2764A5]" />
          </div>
          <span className="text-2xl font-bold text-[#2764A5] font-mono">4 Rules</span>
          <div className="mt-2 text-[11px] text-[#667085]">
            HR, SpO₂, Temp, Motion
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('logs')}
          className="card-panel p-4 rounded-[8px] cursor-pointer hover:border-[#B7791F] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Audit Trail</span>
            <FileText className="h-4 w-4 text-[#B7791F]" />
          </div>
          <span className="text-2xl font-bold text-[#17202A] font-mono">{logs.length}</span>
          <div className="mt-2 text-[11px] text-[#667085]">
            System Log Entries
          </div>
        </div>
      </div>

      {/* System Infrastructure Health & Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-panel p-5 rounded-[8px] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
            <div>
              <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">IoT Infrastructure Status</h3>
              <p className="text-xs text-[#667085]">Database, API routes, and realtime synchronization</p>
            </div>
            <span className="rounded-[4px] bg-[#16805C]/10 text-[#16805C] text-[11px] font-bold px-2 py-0.5 border border-[#16805C]/20">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-[#087F8C]" />
                <div>
                  <div className="font-bold text-[#17202A]">Supabase Database & Realtime Channel</div>
                  <div className="text-[11px] text-[#667085]">PostgreSQL 15 • RLS Policies Enforced</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4 text-[#2764A5]" />
                <div>
                  <div className="font-bold text-[#17202A]">BroadcastChannel Event Bus</div>
                  <div className="text-[11px] text-[#667085]">Low-latency sync between student and healthcare views</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-[#B7791F]" />
                <div>
                  <div className="font-bold text-[#17202A]">ESP32 Ingestion Router (GET /api/data)</div>
                  <div className="text-[11px] text-[#667085]">REST Endpoint for on-device polling</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>
          </div>
        </div>

        {/* Live Simulator Stream Controls */}
        <div className="lg:col-span-5 card-panel p-5 rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">Automated Telemetry Stream</h3>
                <p className="text-xs text-[#667085]">3-second heart-beat sensor simulator</p>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isAutoStreaming ? 'bg-[#16805C]' : 'bg-[#98A2B3]'
                }`}
              />
            </div>

            <p className="text-xs text-[#334155] mb-4 leading-relaxed">
              When active, VitaTrack generates live sensor telemetry across student wrist devices, keeping charts and triage lists updated continuously.
            </p>

            <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB] mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#667085]">Total Telemetry Ingested:</span>
                <span className="font-mono font-bold text-[#17202A]">{readings.length} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Alerts Recorded:</span>
                <span className="font-mono font-bold text-[#C24141]">{alerts.length} alerts</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E6EB]">
            <button
              type="button"
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={isAutoStreaming ? 'btn-danger w-full justify-center text-xs' : 'btn-primary w-full justify-center text-xs'}
            >
              {isAutoStreaming ? 'Pause Telemetry Stream' : 'Start Automated Stream (3s)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
