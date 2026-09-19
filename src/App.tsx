import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ESP32HardwareSimulatorModal } from './components/iot/ESP32HardwareSimulatorModal';
import { ESP32FirmwareModal } from './components/iot/ESP32FirmwareModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentHistory } from './pages/student/StudentHistory';
import { StudentAlerts } from './pages/student/StudentAlerts';
import { StudentDevice } from './pages/student/StudentDevice';
import { StudentProfile } from './pages/student/StudentProfile';

import { HealthcareDashboard } from './pages/healthcare/HealthcareDashboard';
import { StudentDetailPage } from './pages/healthcare/StudentDetailPage';
import { AlertsManagementPage } from './pages/healthcare/AlertsManagementPage';
import { AnalyticsReportsPage } from './pages/healthcare/AnalyticsReportsPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDevicesPage } from './pages/admin/AdminDevicesPage';
import { AdminThresholdsPage } from './pages/admin/AdminThresholdsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { DatasetTrainingModule } from './components/training/DatasetTrainingModule';

import { UserProfile } from './types';
import { AlertOctagon, Volume2, VolumeX } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { alerts } = useHealthData();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<UserProfile | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isFirmwareOpen, setIsFirmwareOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [latestAbnormalBanner, setLatestAbnormalBanner] = useState<string | null>(null);

  const prevAlertsCount = useRef(alerts.length);

  // When role switches, reset student detail view and reset tab to dashboard
  useEffect(() => {
    setActiveTab('dashboard');
    setSelectedStudentForDetail(null);
  }, [user?.role]);

  // Audio alert tone generator for abnormal condition detection (Section 19: "Audible alert plays")
  const playAlertBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
      osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // drop to 440 Hz

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Watch for new abnormal alerts
  useEffect(() => {
    if (alerts.length > prevAlertsCount.current) {
      const newest = alerts[0];
      if (newest && (newest.severity === 'CRITICAL' || newest.severity === 'HIGH' || newest.status === 'ACTIVE')) {
        setLatestAbnormalBanner(`${newest.student_name || 'Student'}: ${newest.alert_type} (${newest.value})`);
        if (audioEnabled) {
          playAlertBuzzer();
        }
      }
    }
    prevAlertsCount.current = alerts.length;
  }, [alerts, audioEnabled]);

  const handleSelectStudent = (student: UserProfile) => {
    setSelectedStudentForDetail(student);
  };

  const handleBackFromStudentDetail = () => {
    setSelectedStudentForDetail(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenFirmware={() => setIsFirmwareOpen(true)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedStudentForDetail(null);
        }}
      />

      {/* Abnormal Condition Notification Ticker (Feature 10) */}
      {latestAbnormalBanner && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-200 shrink-0" />
            <span>CRITICAL CLINICAL ALERT: {latestAbnormalBanner}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) playAlertBuzzer();
              }}
              className="inline-flex items-center gap-1 bg-rose-700 hover:bg-rose-800 px-2 py-0.5 rounded text-[11px]"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioEnabled ? 'Alarm Sound: ON' : 'Alarm Sound: OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLatestAbnormalBanner(null)}
              className="text-white hover:text-rose-200 text-xs px-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={selectedStudentForDetail ? 'dashboard' : activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedStudentForDetail(null);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'model_training' && <DatasetTrainingModule />}

          {/* STUDENT ROLE PAGES */}
          {user?.role === 'STUDENT' && activeTab !== 'model_training' && (
            <>
              {activeTab === 'dashboard' && (
                <StudentDashboard
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  onNavigateTab={setActiveTab}
                />
              )}
              {activeTab === 'history' && <StudentHistory />}
              {activeTab === 'alerts' && <StudentAlerts />}
              {activeTab === 'device' && <StudentDevice onOpenSimulator={() => setIsSimulatorOpen(true)} />}
              {activeTab === 'profile' && <StudentProfile />}
            </>
          )}

          {/* HEALTHCARE PERSONNEL ROLE PAGES */}
          {user?.role === 'HEALTHCARE' && activeTab !== 'model_training' && (
            <>
              {(activeTab === 'dashboard' || activeTab === 'students' || activeTab === 'live_monitoring') && (
                <>
                  {selectedStudentForDetail ? (
                    <StudentDetailPage
                      student={selectedStudentForDetail}
                      onBack={handleBackFromStudentDetail}
                      onNavigateTab={setActiveTab}
                    />
                  ) : (
                    <HealthcareDashboard
                      onSelectStudent={handleSelectStudent}
                      onNavigateTab={setActiveTab}
                      onOpenSimulator={() => setIsSimulatorOpen(true)}
                    />
                  )}
                </>
              )}
              {activeTab === 'alerts' && <AlertsManagementPage />}
              {(activeTab === 'reports' || activeTab === 'analytics') && <AnalyticsReportsPage />}
              {activeTab === 'profile' && <StudentProfile />}
            </>
          )}

          {/* ADMINISTRATOR ROLE PAGES */}
          {user?.role === 'ADMIN' && activeTab !== 'model_training' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  onNavigateTab={setActiveTab}
                  onOpenFirmware={() => setIsFirmwareOpen(true)}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                />
              )}
              {activeTab === 'users' && <AdminUsersPage />}
              {activeTab === 'devices' && (
                <AdminDevicesPage onOpenSimulator={() => setIsSimulatorOpen(true)} />
              )}
              {activeTab === 'alerts' && <AlertsManagementPage />}
              {activeTab === 'thresholds' && <AdminThresholdsPage onNavigateTab={setActiveTab} />}
              {activeTab === 'logs' && <AdminAuditLogsPage />}
              {activeTab === 'settings' && (
                <AdminThresholdsPage onNavigateTab={setActiveTab} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            VitaTrack IoT • Student Health Monitoring & Abnormal Condition Detection System • ESP32-S3
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            MAX30102 (PPG/SpO₂) • MLX90614 (IR Temp) • MPU6050 (IMU) • SSD1306 (OLED)
          </span>
        </div>
      </footer>

      {/* Interactive Hardware Test Bench Modal */}
      <ESP32HardwareSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* Complete ESP32 C++ Firmware Source Code Modal */}
      <ESP32FirmwareModal
        isOpen={isFirmwareOpen}
        onClose={() => setIsFirmwareOpen(false)}
      />

      {/* PWA Offline Mode Network Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <MainApp />
      </HealthDataProvider>
    </AuthProvider>
  );
}
