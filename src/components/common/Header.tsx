import React, { useState } from 'react';
import {
  HeartPulse,
  Cpu,
  Code2,
  Bell,
  LogOut,
  Shield,
  Stethoscope,
  GraduationCap,
  ChevronDown,
  Check,
  Brain,
  Menu,
  X,
  ArrowLeft,
  Wifi,
  LayoutDashboard,
  History,
  AlertTriangle,
  Users,
  BarChart3,
  Sliders,
  FileText,
  User,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface HeaderProps {
  onOpenSimulator: () => void;
  onOpenFirmware: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSimulator,
  onOpenFirmware,
  onNavigateTab,
  activeTab = 'dashboard',
}) => {
  const { user, role, loginAs, logout, availableUsers } = useAuth();
  const { alerts, isAutoStreaming } = useHealthData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Health History', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlerts.length > 0 ? activeAlerts.length : undefined },
    { id: 'device', label: 'My ESP32 Device', icon: Cpu },
    { id: 'model_training', label: 'Calibrated Baselines', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const healthcareNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Registered Students', icon: Users },
    { id: 'live_monitoring', label: 'Live Telemetry', icon: Radio },
    { id: 'alerts', label: 'Alerts Management', icon: AlertTriangle, badge: activeAlerts.length > 0 ? activeAlerts.length : undefined },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'model_training', label: 'Dataset Calibration', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'devices', label: 'Device Management', icon: Cpu },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: activeAlerts.length > 0 ? activeAlerts.length : undefined },
    { id: 'thresholds', label: 'Threshold Settings', icon: Sliders },
    { id: 'model_training', label: 'Dataset & Algorithms', icon: Brain },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
  ];

  const navItems = role === 'STUDENT' ? studentNav : role === 'HEALTHCARE' ? healthcareNav : adminNav;

  const handleNavClick = (tabId: string) => {
    onNavigateTab?.(tabId);
    setShowMobileDrawer(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E6EB] bg-[#FFFFFF]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-[6px] border border-[#E2E6EB] text-[#17202A] hover:bg-[#F1F3F5] transition-colors"
            title="Open Menu"
            aria-label="Toggle navigation menu"
          >
            {showMobileDrawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#087F8C] text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-[#0B1726]">VitaTrack</span>
                <span className="rounded-[4px] bg-[#F1F3F5] px-1.5 py-0.5 text-[10px] font-bold text-[#087F8C] uppercase border border-[#E2E6EB]">
                  IoT
                </span>
              </div>
            </div>
          </div>

          {/* IoT Telemetry State Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5] px-2.5 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isAutoStreaming ? 'bg-[#16805C]' : 'bg-[#98A2B3]'}`} />
            </span>
            <span className="font-medium text-[#334155]">
              {isAutoStreaming ? 'ESP32 Telemetry Live' : 'Telemetry Paused'}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Hardware Test Bench Button */}
          <button
            type="button"
            onClick={onOpenSimulator}
            className="hidden sm:inline-flex items-center gap-1.5 btn-secondary text-xs"
            title="Open ESP32 Hardware Test Bench"
          >
            <Cpu className="h-3.5 w-3.5 text-[#087F8C]" />
            <span>IoT Test Bench</span>
          </button>

          {/* Firmware Button */}
          <button
            type="button"
            onClick={onOpenFirmware}
            className="hidden md:inline-flex items-center gap-1.5 btn-secondary text-xs"
            title="View ESP32 C++ Code"
          >
            <Code2 className="h-3.5 w-3.5 text-[#667085]" />
            <span>Firmware</span>
          </button>

          <PWAInstallButton variant="header" />

          {/* Alerts Notification Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAlertsMenu(!showAlertsMenu)}
              className="relative rounded-[6px] border border-[#E2E6EB] bg-white p-2 text-[#334155] hover:bg-[#F1F3F5] transition-colors"
              title="View Health Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C24141] text-[10px] font-bold text-white">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {showAlertsMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[8px] border border-[#E2E6EB] bg-white p-3 shadow-lg z-50">
                <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-2">
                  <span className="font-bold text-xs text-[#17202A]">Active Health Alerts ({activeAlerts.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlertsMenu(false);
                      handleNavClick('alerts');
                    }}
                    className="text-xs font-semibold text-[#087F8C] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-[#E2E6EB] py-1">
                  {activeAlerts.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#667085]">
                      No active alerts. All parameters normal.
                    </div>
                  ) : (
                    activeAlerts.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        className="py-2 hover:bg-[#F1F3F5] rounded-[4px] px-1 cursor-pointer"
                        onClick={() => {
                          setShowAlertsMenu(false);
                          handleNavClick('alerts');
                        }}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#17202A]">
                          <span>{a.student_name}</span>
                          <span className="text-[10px] text-[#C24141] bg-[#C24141]/10 px-1.5 py-0.5 rounded font-mono">
                            {a.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085]">{a.alert_type} ({a.value})</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 rounded-[6px] border border-[#E2E6EB] bg-white px-2 py-1.5 text-xs font-semibold text-[#17202A] hover:bg-[#F1F3F5]"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#0B1726] text-white text-[10px] font-bold">
                {role === 'STUDENT' ? (
                  <GraduationCap className="h-3.5 w-3.5" />
                ) : role === 'HEALTHCARE' ? (
                  <Stethoscope className="h-3.5 w-3.5" />
                ) : (
                  <Shield className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="hidden sm:inline font-bold text-xs">{role}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#667085]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-[8px] border border-[#E2E6EB] bg-white p-2 shadow-lg z-50">
                <div className="px-2 py-1 text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                  Switch User Role
                </div>
                <div className="py-1 space-y-0.5">
                  {availableUsers.map((u) => {
                    const isCurrent = u.id === user?.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          loginAs(u.id);
                          setShowRoleMenu(false);
                          handleNavClick('dashboard');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-left text-xs ${
                          isCurrent ? 'bg-[#087F8C]/10 text-[#087F8C] font-bold' : 'hover:bg-[#F1F3F5] text-[#17202A]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[#17202A]">{u.full_name}</div>
                          <div className="text-[10px] text-[#667085]">{u.role}</div>
                        </div>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-[#087F8C]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#E2E6EB] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-[#C24141] hover:bg-[#C24141]/10 rounded-[4px]"
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

      {/* MOBILE DRAWER OVERLAY */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 bg-[#0B1726]/80 backdrop-blur-xs flex flex-col md:hidden">
          {/* Top Header inside Drawer with Safe Padding */}
          <div className="bg-[#0B1726] border-b border-[#12263A] p-4 pt-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#087F8C] text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">VitaTrack Navigation</div>
                <div className="text-[10px] text-[#087F8C] uppercase font-bold">{role} Role</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileDrawer(false)}
              className="btn-secondary text-xs bg-[#12263A] text-white border-[#334155]/50 flex items-center gap-1.5"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 bg-[#0B1726] p-4 overflow-y-auto space-y-6 text-white">
            {/* Quick Back to Dashboard Button */}
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className="w-full btn-primary text-xs justify-center py-2.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Main Dashboard</span>
            </button>

            {/* Navigation Tabs List */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider px-2 mb-2">
                Main Menu
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-[6px] text-xs font-semibold transition-colors ${
                      isActive ? 'bg-[#087F8C] text-white' : 'text-[#98A2B3] hover:bg-[#12263A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-[#C24141] text-white rounded-full px-2 py-0.5 text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tools Section */}
            <div className="pt-4 border-t border-[#12263A] space-y-2">
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider px-2 mb-1">
                Hardware Tools
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenSimulator();
                }}
                className="w-full btn-secondary text-xs bg-[#12263A] text-white border-[#334155]/40 justify-start"
              >
                <Cpu className="h-4 w-4 text-[#087F8C]" />
                <span>IoT Test Bench Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenFirmware();
                }}
                className="w-full btn-secondary text-xs bg-[#12263A] text-white border-[#334155]/40 justify-start"
              >
                <Code2 className="h-4 w-4 text-[#98A2B3]" />
                <span>ESP32 Firmware Source</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
