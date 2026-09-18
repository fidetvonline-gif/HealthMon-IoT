import React, { useState } from 'react';
import {
  HeartPulse,
  Cpu,
  Code2,
  Bell,
  LogOut,
  User,
  Shield,
  Stethoscope,
  GraduationCap,
  Radio,
  ChevronDown,
  Activity,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';

interface HeaderProps {
  onOpenSimulator: () => void;
  onOpenFirmware: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSimulator,
  onOpenFirmware,
  onNavigateTab,
}) => {
  const { user, role, loginAs, logout, availableUsers } = useAuth();
  const { alerts, isAutoStreaming } = useHealthData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => onNavigateTab?.('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">HealthMon</span>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[11px] font-extrabold text-blue-700 uppercase">
                  IoT
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-none">
                Student Health & Abnormal Detection
              </p>
            </div>
          </div>

          {/* IoT Telemetry State Badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isAutoStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isAutoStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            </span>
            <span className="font-medium text-slate-700">
              {isAutoStreaming ? 'ESP32 Telemetry Live' : 'Telemetry Paused'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">Supabase DB</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Open Hardware Simulator Button */}
          <button
            type="button"
            onClick={onOpenSimulator}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            title="Open ESP32-S3 Hardware Simulation & Test Bench"
          >
            <Cpu className="h-4 w-4 text-blue-600" />
            <span>IoT Simulator</span>
          </button>

          {/* Open Firmware Modal */}
          <button
            type="button"
            onClick={onOpenFirmware}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            title="View ESP32-S3 C++ Source Code"
          >
            <Code2 className="h-4 w-4 text-slate-600" />
            <span>Firmware</span>
          </button>

          {/* Alerts Notification Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAlertsMenu(!showAlertsMenu)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="View Health Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Drawer */}
            {showAlertsMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Active Physiological Alerts</span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                      {activeAlerts.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlertsMenu(false);
                      onNavigateTab?.('alerts');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                  {activeAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active abnormal alerts. All monitored students within thresholds.
                    </div>
                  ) : (
                    activeAlerts.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="py-2.5 px-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setShowAlertsMenu(false);
                          onNavigateTab?.('alerts');
                        }}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-800">{a.student_name || 'Student'}</span>
                          <span className="rounded px-1.5 py-0.2 text-[10px] font-bold uppercase bg-rose-100 text-rose-700">
                            {a.severity}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">{a.alert_type}</p>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono text-rose-600 font-semibold">{a.value}</span>
                          <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-all"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[10px]">
                {role === 'STUDENT' ? (
                  <GraduationCap className="h-3.5 w-3.5" />
                ) : role === 'HEALTHCARE' ? (
                  <Stethoscope className="h-3.5 w-3.5" />
                ) : (
                  <Shield className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-none text-slate-900">{user?.full_name}</div>
                <div className="text-[10px] font-medium text-blue-600">{role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500">
                  Switch Active Test User & Role:
                </div>
                <div className="py-1 space-y-1">
                  {availableUsers.map((u) => {
                    const isCurrent = u.id === user?.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          loginAs(u.id);
                          setShowRoleMenu(false);
                          onNavigateTab?.('dashboard');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          isCurrent ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              u.role === 'STUDENT'
                                ? 'bg-emerald-500'
                                : u.role === 'HEALTHCARE'
                                ? 'bg-blue-500'
                                : 'bg-purple-500'
                            }`}
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{u.full_name}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role} {u.student_id ? `• ${u.student_id}` : ''}
                            </div>
                          </div>
                        </div>
                        {isCurrent && <Check className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
