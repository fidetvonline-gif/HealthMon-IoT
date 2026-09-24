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

  const studentNavGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'history', label: 'Health History', icon: History },
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
      ],
    },
    {
      group: 'HARDWARE & ML',
      items: [
        { id: 'device', label: 'My ESP32 Device', icon: Cpu },
        { id: 'model_training', label: 'Trained Baselines', icon: Brain },
        { id: 'profile', label: 'Profile', icon: User },
      ],
    },
  ];

  const healthcareNavGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Registered Students', icon: Users },
        { id: 'live_monitoring', label: 'Live Monitoring', icon: Radio },
      ],
    },
    {
      group: 'CLINICAL & ANALYTICS',
      items: [
        { id: 'alerts', label: 'Alerts Management', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'model_training', label: 'Dataset & ML Training', icon: Brain },
        { id: 'profile', label: 'Profile', icon: User },
      ],
    },
  ];

  const adminNavGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'MANAGEMENT',
      items: [
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'devices', label: 'Device Management', icon: Cpu },
        { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
        { id: 'thresholds', label: 'Threshold Settings', icon: Sliders },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'model_training', label: 'Dataset & ML Training', icon: Brain },
        { id: 'logs', label: 'System Logs', icon: FileText },
        { id: 'settings', label: 'Supabase & Config', icon: Settings },
      ],
    },
  ];

  const navGroups = role === 'STUDENT' ? studentNavGroups : role === 'HEALTHCARE' ? healthcareNavGroups : adminNavGroups;

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0B1726] text-white min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3.5 hidden md:flex border-r border-[#12263A]">
      <div className="space-y-5">
        {/* User Identity Card */}
        <div className="rounded-[6px] bg-[#12263A] p-3 border border-[#334155]/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#474A2C] text-white shrink-0">
              {role === 'STUDENT' ? (
                <GraduationCap className="h-4 w-4" />
              ) : role === 'HEALTHCARE' ? (
                <Stethoscope className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-white">{user?.full_name}</h4>
              <p className="text-[10px] font-semibold text-[#474A2C] uppercase tracking-wider">{role}</p>
            </div>
          </div>
          {user?.student_id && (
            <div className="mt-2 text-[10px] text-[#98A2B3] font-mono bg-[#0B1726] px-2 py-0.5 rounded-[4px] border border-[#334155]/30 truncate">
              ID: {user.student_id}
            </div>
          )}
        </div>

        {/* Navigation Grouped Items */}
        <nav className="space-y-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] px-2.5 mb-1">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#474A2C] text-white font-semibold'
                        : 'text-[#98A2B3] hover:bg-[#12263A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#667085]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive ? 'bg-white text-[#474A2C]' : 'bg-[#C24141] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="pt-3 border-t border-[#12263A] space-y-2">
        <PWAInstallButton variant="sidebar" />

        <div className="px-2.5 py-1.5 rounded-[6px] bg-[#12263A] text-[11px] text-[#98A2B3]">
          <div className="flex items-center justify-between font-medium">
            <span>Database Status</span>
            <span className="text-[#16805C] font-semibold text-[10px]">● Online</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[#98A2B3] hover:bg-[#C24141]/20 hover:text-[#C24141] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
