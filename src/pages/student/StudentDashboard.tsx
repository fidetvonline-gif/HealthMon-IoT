import React from 'react';
import {
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Battery,
  Wifi,
  Cpu,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ESP32OledDisplay } from '../../components/iot/ESP32OledDisplay';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenSimulator: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab, onOpenSimulator }) => {
  const { user } = useAuth();
  const { latestReadingForStudent, deviceForStudent, alerts, thresholds } = useHealthData();

  const studentId = user?.id || 'usr-student-001';
  const reading = latestReadingForStudent(studentId);
  const device = deviceForStudent(studentId);
  const studentAlerts = alerts.filter((a) => a.student_id === studentId);
  const activeAlert = studentAlerts.find((a) => a.status === 'ACTIVE');

  // Fallbacks if no reading yet
  const hr = reading?.heart_rate ?? 78;
  const spo2 = reading?.spo2 ?? 98;
  const temp = reading?.temperature ?? 36.7;
  const activity = reading?.activity ?? 'Sitting';
  const status = reading?.status ?? 'Normal';
  const battery = device?.battery_level ?? reading?.battery_level ?? 82;
  const lastRecorded = reading ? new Date(reading.recorded_at).toLocaleTimeString() : 'Just now';

  // Configured thresholds
  const hrThresh = thresholds.find((t) => t.parameter === 'heart_rate');
  const spo2Thresh = thresholds.find((t) => t.parameter === 'spo2');
  const tempThresh = thresholds.find((t) => t.parameter === 'temperature');

  return (
    <div className="space-y-6">
      {/* Header Banner - Restrained Professional Style */}
      <div className="card-panel bg-[#0B1726] text-white p-6 rounded-[8px] border border-[#12263A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#12263A] text-[#087F8C] text-xs font-semibold mb-2 border border-[#334155]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" />
              <span>IoT Telemetry Pipeline Active</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="mt-1 text-xs text-[#98A2B3]">
              Continuous physiological monitoring is active via your assigned ESP32 wearable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSimulator}
              className="btn-primary text-xs"
            >
              <Cpu className="h-4 w-4" />
              <span>IoT Test Bench</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="btn-secondary text-xs"
            >
              <span>View History</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Alert Banner if student has unresolved abnormal condition */}
      {activeAlert && (
        <div className="rounded-[8px] border border-[#C24141] bg-[#C24141]/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#C24141] text-white font-bold shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#C24141] uppercase tracking-wide">
                    Abnormal Condition Alert ({activeAlert.severity})
                  </h4>
                  <span className="text-xs text-[#17202A] font-semibold">{activeAlert.parameter}</span>
                </div>
                <p className="mt-1 text-xs text-[#334155] font-medium">{activeAlert.message}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[#667085]">
                  <span>
                    Current: <strong>{activeAlert.value}</strong>
                  </span>
                  <span>•</span>
                  <span>Threshold: {activeAlert.threshold}</span>
                  <span>•</span>
                  <span>{new Date(activeAlert.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="btn-danger text-xs"
            >
              Review Alert
            </button>
          </div>
        </div>
      )}

      {/* 4 Primary Vitals Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-[#C24141]" />
              HEART RATE
            </span>
            <StatusBadge status={hr > 100 || hr < 60 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#17202A] tracking-tight font-mono">{hr}</span>
            <span className="text-xs font-semibold text-[#667085]">BPM</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E2E6EB] flex items-center justify-between text-[11px] text-[#667085]">
            <span>Threshold: {hrThresh ? `${hrThresh.minimum_value}-${hrThresh.maximum_value} BPM` : '60-100 BPM'}</span>
            <span className="text-[#16805C] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" /> MAX30102
            </span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-[#2764A5]" />
              SpO₂ SATURATION
            </span>
            <StatusBadge status={spo2 < 95 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#17202A] tracking-tight font-mono">{spo2}</span>
            <span className="text-xs font-semibold text-[#667085]">%</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E2E6EB] flex items-center justify-between text-[11px] text-[#667085]">
            <span>Threshold: {spo2Thresh ? `>= ${spo2Thresh.minimum_value}%` : '>= 95%'}</span>
            <span className="text-[#16805C] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" /> Pulse Ox
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-[#B7791F]" />
              TEMPERATURE
            </span>
            <StatusBadge status={temp > 37.5 || temp < 36.5 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-[#17202A] tracking-tight font-mono">
              {temp.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-[#667085]">°C</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E2E6EB] flex items-center justify-between text-[11px] text-[#667085]">
            <span>Normal: {tempThresh ? `${tempThresh.minimum_value}-${tempThresh.maximum_value}°C` : '36.5-37.5°C'}</span>
            <span className="text-[#16805C] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" /> MLX90614
            </span>
          </div>
        </div>

        {/* Activity & Motion */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#087F8C]" />
              ACTIVITY STATE
            </span>
            <StatusBadge status={activity === 'Possible Fall' ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-[#17202A] tracking-tight">{activity}</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E2E6EB] flex items-center justify-between text-[11px] text-[#667085]">
            <span>Motion Classifier</span>
            <span className="text-[#16805C] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" /> MPU6050
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Connected Device + Physical OLED + Live Telemetry Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Telemetry & Physical OLED Display (7 cols) */}
        <div className="lg:col-span-7 card-panel p-5 rounded-[8px]">
          <div className="flex items-center justify-between mb-4 border-b border-[#E2E6EB] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17202A]">ESP32 Wearable Device Monitor</h3>
              <p className="text-xs text-[#667085]">On-Device OLED Telemetry Simulation</p>
            </div>
            <span className="text-xs text-[#667085] font-mono">Updated: {lastRecorded}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Embedded OLED Component */}
            <div className="flex justify-center">
              <ESP32OledDisplay reading={reading} device={device} />
            </div>

            {/* Device Hardware Specs */}
            <div className="space-y-2.5 text-xs">
              <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                <div className="flex justify-between items-center text-[#334155] mb-1.5">
                  <span className="font-semibold">Device UID:</span>
                  <span className="font-mono font-bold text-[#17202A]">{device?.device_uid || 'HM-ESP32-001'}</span>
                </div>
                <div className="flex justify-between items-center text-[#334155] mb-1.5">
                  <span className="font-semibold">Status:</span>
                  <StatusBadge status={device?.status || 'ONLINE'} size="sm" pulse />
                </div>
                <div className="flex justify-between items-center text-[#334155] mb-1.5">
                  <span className="font-semibold">Battery Level:</span>
                  <span className="font-mono font-bold text-[#17202A] flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-[#087F8C]" /> {battery}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#334155] mb-1.5">
                  <span className="font-semibold">Wi-Fi Signal:</span>
                  <span className="font-mono text-[#16805C] font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> -58 dBm
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#334155]">
                  <span className="font-semibold">Firmware:</span>
                  <span className="font-mono text-[#667085]">v1.2.4-esp32s3</span>
                </div>
              </div>

              <div className="rounded-[6px] border border-[#E2E6EB] bg-[#FFFFFF] p-3 text-[#17202A]">
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#087F8C]" />
                  <span>Data Ingestion Pipeline</span>
                </div>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Telemetry packets are streamed directly via Wi-Fi and evaluated against threshold rules in real time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Physiological Health Summary & Profile (5 cols) */}
        <div className="lg:col-span-5 card-panel p-5 rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E6EB] pb-3">
              <h3 className="text-sm font-bold text-[#17202A]">Student Profile & Vitals</h3>
              <StatusBadge status={status} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Student Name:</span>
                <span className="font-bold text-[#17202A]">{user?.full_name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Student ID:</span>
                <span className="font-mono font-bold text-[#17202A]">{user?.student_id || 'UY/CS/2026/001'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Department:</span>
                <span className="font-semibold text-[#334155]">{user?.department || 'Computer Science'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Assigned Device:</span>
                <span className="font-mono text-[#087F8C] font-bold">{device?.device_uid || 'HM-ESP32-001'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#667085]">Clinic Care Access:</span>
                <span className="text-[#16805C] font-semibold">Dr. Evelyn Adams, RN</span>
              </div>
            </div>

            <div className="mt-4 rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
              <span className="font-bold text-xs text-[#17202A] block mb-1">
                Clinical Health Note:
              </span>
              <p className="text-[11px] text-[#667085] leading-relaxed">
                Vital sign thresholds are checked automatically. If readings breach normal ranges, an alert is dispatched to campus medical staff.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E6EB] flex items-center justify-between">
            <span className="text-xs text-[#667085]">Total Alerts: {studentAlerts.length}</span>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-[#087F8C] hover:underline"
            >
              Explore Full Records →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
