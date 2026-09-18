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
  Clock,
  Sparkles,
  TrendingUp,
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
      {/* Header Banner - Section 9 */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IoT Telemetry Pipeline Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, {user?.full_name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              Health monitoring is active. Your ESP32-S3 wearable is streaming physiological parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-blue-50 transition-all"
            >
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Simulate IoT Device</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20 transition-all border border-white/20"
            >
              <span>View History</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Alert Banner if student has unresolved abnormal condition */}
      {activeAlert && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 sm:p-5 shadow-sm animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shrink-0 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                    🚨 Abnormal Condition Detected ({activeAlert.severity})
                  </h4>
                  <span className="text-xs text-rose-700 font-semibold">{activeAlert.parameter}</span>
                </div>
                <p className="mt-1 text-xs text-rose-800 font-medium">{activeAlert.message}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-rose-700">
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
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 shrink-0"
            >
              Review Alert
            </button>
          </div>
        </div>
      )}

      {/* Section 9: 4 Primary Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Heart Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Heart className={`h-4 w-4 text-rose-500 ${hr > 100 ? 'animate-bounce' : 'animate-pulse'}`} />
              HEART RATE
            </span>
            <StatusBadge status={hr > 100 || hr < 60 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">{hr}</span>
            <span className="text-xs font-semibold text-slate-500">BPM</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Limit: {hrThresh ? `${hrThresh.minimum_value} - ${hrThresh.maximum_value} BPM` : '60 - 100 BPM'}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> MAX30102
            </span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-blue-500" />
              SpO₂ SATURATION
            </span>
            <StatusBadge status={spo2 < 95 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">{spo2}</span>
            <span className="text-xs font-semibold text-slate-500">%</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Limit: {spo2Thresh ? `>= ${spo2Thresh.minimum_value}%` : '>= 95%'}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Pulse Ox
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-amber-500" />
              TEMPERATURE
            </span>
            <StatusBadge status={temp > 37.5 || temp < 36.5 ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
              {temp.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Normal: {tempThresh ? `${tempThresh.minimum_value} - ${tempThresh.maximum_value}°C` : '36.5 - 37.5°C'}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> MLX90614
            </span>
          </div>
        </div>

        {/* Activity & Motion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-purple-500" />
              PHYSICAL ACTIVITY
            </span>
            <StatusBadge status={activity === 'Possible Fall' ? 'Abnormal' : 'Normal'} />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{activity}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Motion Sensor</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> MPU6050
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Connected Device + Physical OLED + Live Telemetry Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Telemetry & Physical OLED Display (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">ESP32-S3 Wearable Monitor</h3>
              <p className="text-xs text-slate-500">Feature 15 — On-Device OLED Telemetry Simulation</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Last update: {lastRecorded}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Embedded OLED Component */}
            <div className="flex justify-center">
              <ESP32OledDisplay reading={reading} device={device} />
            </div>

            {/* Device Hardware Specs */}
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <div className="flex justify-between items-center text-slate-600 mb-1">
                  <span className="font-semibold">Device UID:</span>
                  <span className="font-mono font-bold text-slate-900">{device?.device_uid || 'HM-ESP32-001'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 mb-1">
                  <span className="font-semibold">Status:</span>
                  <StatusBadge status={device?.status || 'ONLINE'} size="sm" pulse />
                </div>
                <div className="flex justify-between items-center text-slate-600 mb-1">
                  <span className="font-semibold">Battery Gauge:</span>
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-blue-600" /> {battery}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 mb-1">
                  <span className="font-semibold">Wi-Fi RSSI:</span>
                  <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> -58 dBm (Strong)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Firmware:</span>
                  <span className="font-mono text-slate-500">v1.2.4-esp32s3</span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-blue-900">
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Cloud Data Pipeline</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Data packets are authenticated and streamed directly to Supabase via Wi-Fi and evaluated in real time
                  against university health thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Physiological Health Summary & Recommendations (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Student Profile & Vitals Status</h3>
              <StatusBadge status={status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{user?.full_name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Matric / Student ID:</span>
                <span className="font-mono font-bold text-slate-900">{user?.student_id || 'UY/CS/2026/001'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Faculty / Department:</span>
                <span className="font-semibold text-slate-800">{user?.department || 'Computer Science'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Assigned IoT Device:</span>
                <span className="font-mono text-blue-600 font-bold">{device?.device_uid || 'HM-ESP32-001'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Campus Clinic Access:</span>
                <span className="text-emerald-700 font-semibold">Enabled (Dr. Evelyn Adams, RN)</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <span className="font-bold text-xs text-slate-800 block mb-1">
                Clinical Health Guidance Note:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Normal physiological ranges are monitored continuously. If heart rate exceeds 100 BPM or body temperature
                surpasses 37.5°C while resting, an alert will be automatically routed to campus medical personnel.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Alerts: {studentAlerts.length}</span>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Explore Full Records →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
