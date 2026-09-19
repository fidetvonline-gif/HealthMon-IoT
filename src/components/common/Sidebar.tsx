import React from 'react';
import {
  LayoutDashboard,
  History,
  AlertTriangle,
  Cpu,
  User,
  Users,
  Radio,
  BarChart3,
  Sliders,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
  GraduationCap,
  Shield,
  Brain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, logout } = useAuth();
  const { alerts } = useHealthData();

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Health History', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'device', label: 'My ESP32 Device', icon: Cpu },
    { id: 'model_training', label: 'Trained Baselines', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const healthcareNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Registered Students', icon: Users },
    { id: 'live_monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'alerts', label: 'Alerts Management', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'model_training', label: 'Dataset & ML Training', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'devices', label: 'Device Management', icon: Cpu },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'thresholds', label: 'Threshold Settings', icon: Sliders },
    { id: 'model_training', label: 'Dataset & ML Training', icon: Brain },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'settings', label: 'Supabase & Config', icon: Settings },
  ];

  const currentNav = role === 'STUDENT' ? studentNav : role === 'HEALTHCARE' ? healthcareNav : adminNav;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div>
        {/* Role identification card */}
        <div className="mb-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              {role === 'STUDENT' ? (
                <GraduationCap className="h-5 w-5" />
              ) : role === 'HEALTHCARE' ? (
                <Stethoscope className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-slate-900">{user?.full_name}</h4>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{role}</p>
            </div>
          </div>
          {user?.student_id && (
            <div className="mt-2 text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200/60 truncate">
              ID: {user.student_id}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          {role === 'STUDENT' ? 'Student Portal' : role === 'HEALTHCARE' ? 'Healthcare Station' : 'System Administration'}
        </div>

        <nav className="space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign out */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        {/* PWA In-App Install */}
        <PWAInstallButton variant="sidebar" />

        <div className="px-3 py-2 rounded-xl bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-medium">
            <span>Supabase Sync</span>
            <span className="text-emerald-600 font-bold">● Active</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">PostgreSQL + Realtime</div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
