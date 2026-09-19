import React from 'react';
import {
  ShieldCheck,
  Users,
  Cpu,
  Sliders,
  FileText,
  Activity,
  Server,
  Database,
  Radio,
  Clock,
  ArrowUpRight,
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
  const adminCount = availableUsers.filter((u) => u.role === 'ADMIN').length;
  const onlineDevicesCount = devices.filter((d) => d.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-xs mb-3 border border-purple-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Root System Operations • Full Privilege</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">VitaTrack IoT Administration</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Hardware fleet orchestration, clinical threshold calibration, role-based access & system telemetry logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenFirmware}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <Code2 className="h-4 w-4" />
            <span>ESP32 C++ Firmware</span>
          </button>
          <button
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-md"
          >
            <Radio className="h-4 w-4" />
            <span>Hardware Test Bench</span>
          </button>
        </div>
      </div>

      {/* High-Level Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('users')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono">{availableUsers.length}</span>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{studentsCount} Students • {healthStaffCount} Staff</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('devices')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Hardware Nodes</span>
            <Cpu className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-emerald-700 font-mono">
            {onlineDevicesCount} / {devices.length}
          </span>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Online ESP32-S3 Wearables</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('thresholds')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Threshold Engine</span>
            <Sliders className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-3xl font-black text-purple-900 font-mono">4 Rules</span>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>HR, SpO₂, Temp, MPU Motion</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('logs')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Telemetry & Audit Logs</span>
            <FileText className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono">{logs.length}</span>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hardware & System Events</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* System Infrastructure Health & Ingestion Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">VitaTrack IoT Subsystem Status</h3>
              <p className="text-xs text-slate-500">Real-time status of microcontrollers, database and message channels</p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5">
              100% OPERATIONAL
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-bold text-slate-900">Supabase PostgreSQL 15 & Realtime WebSocket</div>
                  <div className="text-[11px] text-slate-500">Connected • Row Level Security (RLS) Enforced</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-bold text-slate-900">BroadcastChannel & Cross-Tab Synchronization</div>
                  <div className="text-[11px] text-slate-500">Low-latency event bus between student and clinic views</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-bold text-slate-900">ESP32 REST Telemetry Ingestion Endpoint</div>
                  <div className="text-[11px] text-slate-500">HTTP POST /api/v1/telemetry • JSON Payload Validator</div>
                </div>
              </div>
              <StatusBadge status="ONLINE" />
            </div>
          </div>
        </div>

        {/* Live Simulator & Ingestion Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Hardware Telemetry Stream</h3>
                <p className="text-xs text-slate-500">Automated 3-second heartbeat generator</p>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isAutoStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                }`}
              />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              When enabled, the application simulates live continuous incoming sensor packets from physical ESP32 wrist
              units across enrolled students, keeping dashboards and charts updated in real time.
            </p>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Telemetry Ingested:</span>
                <span className="font-mono font-bold text-slate-900">{readings.length} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alerts In Memory:</span>
                <span className="font-mono font-bold text-rose-600">{alerts.length} alerts</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isAutoStreaming
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isAutoStreaming ? 'Pause Automated Telemetry Stream' : 'Start Automated Telemetry Stream (3s)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
