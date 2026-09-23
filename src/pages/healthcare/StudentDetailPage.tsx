import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Cpu,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Battery,
  Wifi,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { UserProfile } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ESP32OledDisplay } from '../../components/iot/ESP32OledDisplay';

interface StudentDetailPageProps {
  student: UserProfile;
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ student, onBack }) => {
  const { readings, deviceForStudent, alerts, reviewAlert, resolveAlert } = useHealthData();

  const device = deviceForStudent(student.id);
  const studentReadings = readings.filter((r) => r.student_id === student.id);
  const currentReading = studentReadings[0];
  const studentAlerts = alerts.filter((a) => a.student_id === student.id);

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedAlertForNotes, setSelectedAlertForNotes] = useState<string | null>(null);

  const hr = currentReading?.heart_rate ?? 78;
  const spo2 = currentReading?.spo2 ?? 98;
  const temp = currentReading?.temperature ?? 36.7;
  const activity = currentReading?.activity ?? 'Sitting';
  const status = currentReading?.status ?? 'Normal';
  const battery = device?.battery_level ?? currentReading?.battery_level ?? 82;

  // Chart data
  const chartData = [...studentReadings]
    .reverse()
    .slice(-25)
    .map((r) => ({
      time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      heart_rate: r.heart_rate,
      spo2: r.spo2,
      temperature: r.temperature,
    }));

  const handleResolveAlert = (alertId: string) => {
    resolveAlert(alertId, 'Dr. Evelyn Adams, RN', clinicalNotes || 'Physiological readings stabilized; normal vitals observed.');
    setSelectedAlertForNotes(null);
    setClinicalNotes('');
  };

  const handleReviewAlert = (alertId: string) => {
    reviewAlert(alertId, 'Dr. Evelyn Adams, RN', 'Clinical assessment initiated.');
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Live Dashboard</span>
        </button>

        <StatusBadge status={status} size="md" />
      </div>

      {/* Student Profile & Device Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Student Profile Info */}
        <div className="md:col-span-6 card-panel p-5 rounded-[8px]">
          <div className="flex items-center gap-3 border-b border-[#E2E6EB] pb-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#087F8C]/10 text-[#087F8C] font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17202A]">{student.full_name}</h3>
              <p className="text-xs text-[#667085] font-mono">Student ID: {student.student_id || 'UY/CS/2026/001'}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
              <span className="text-[#667085]">Department:</span>
              <span className="font-semibold text-[#17202A]">{student.department || 'Computer Science'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
              <span className="text-[#667085]">Faculty:</span>
              <span className="font-semibold text-[#17202A]">{student.faculty || 'Computing Science'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
              <span className="text-[#667085]">Contact Phone:</span>
              <span className="font-mono text-[#334155]">{student.phone || '+234 803 123 4567'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
              <span className="text-[#667085]">Emergency Next of Kin:</span>
              <span className="font-semibold text-[#C24141]">{student.emergency_contact_name || 'Sarah Doe (Mother)'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#667085]">Kin Phone:</span>
              <span className="font-mono text-[#334155]">{student.emergency_contact_phone || '+234 803 987 6543'}</span>
            </div>
          </div>
        </div>

        {/* Assigned Device Info */}
        <div className="md:col-span-6 card-panel p-5 rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#0B1726] text-white font-bold">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17202A]">
                    {device?.device_uid || 'HM-ESP32-001'}
                  </h3>
                  <p className="text-xs text-[#667085]">ESP32 Wearable Unit</p>
                </div>
              </div>
              <StatusBadge status={device?.status || 'ONLINE'} pulse />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                <span className="text-[#667085] text-[11px] block">Battery Capacity</span>
                <span className="font-mono font-bold text-xs text-[#17202A] flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-[#087F8C]" /> {battery}%
                </span>
              </div>
              <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                <span className="text-[#667085] text-[11px] block">Wi-Fi Connection</span>
                <span className="font-mono font-bold text-xs text-[#16805C] flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" /> -58 dBm
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E6EB] text-xs text-[#667085]">
            Firmware: <span className="font-mono font-semibold text-[#17202A]">{device?.firmware_version || 'v1.2.4-esp32s3'}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Vital Signs Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HR */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-[#C24141]" />
              HEART RATE
            </span>
            <StatusBadge status={hr > 100 || hr < 60 ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="text-2xl font-bold font-mono text-[#17202A]">{hr} <span className="text-xs font-normal text-[#667085]">BPM</span></div>
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
          <div className="text-2xl font-bold font-mono text-[#17202A]">{spo2} <span className="text-xs font-normal text-[#667085]">%</span></div>
        </div>

        {/* Temp */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-[#B7791F]" />
              TEMPERATURE
            </span>
            <StatusBadge status={temp > 37.5 ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="text-2xl font-bold font-mono text-[#17202A]">{temp.toFixed(1)} <span className="text-xs font-normal text-[#667085]">°C</span></div>
        </div>

        {/* Activity */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#087F8C]" />
              ACTIVITY STATE
            </span>
            <StatusBadge status={activity === 'Possible Fall' ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="text-xl font-bold text-[#17202A]">{activity}</div>
        </div>
      </div>

      {/* Chart & OLED Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 card-panel p-5 rounded-[8px]">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-3">Live Telemetry Plot</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#D0D5DD" />
                <YAxis tick={{ fontSize: 10 }} stroke="#D0D5DD" />
                <Tooltip contentStyle={{ backgroundColor: '#0B1726', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="heart_rate" name="Heart Rate" stroke="#C24141" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="spo2" name="SpO₂" stroke="#2764A5" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#B7791F" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 card-panel p-5 rounded-[8px] flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-3">Wrist OLED Mirror</h3>
          <ESP32OledDisplay reading={currentReading} device={device} />
        </div>
      </div>

      {/* Clinical Alerts Section */}
      <div className="card-panel p-5 rounded-[8px] space-y-4">
        <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider border-b border-[#E2E6EB] pb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#C24141]" />
          <span>Clinical Alerts & Triage Notes</span>
        </h3>

        {studentAlerts.length === 0 ? (
          <p className="text-xs text-[#98A2B3]">No active or historical alerts recorded for this student.</p>
        ) : (
          <div className="space-y-3">
            {studentAlerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17202A]">{a.alert_type} ({a.parameter}: {a.value})</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} size="sm" />
                    <span className="text-[11px] text-[#667085] font-mono">{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <p className="text-xs text-[#334155]">{a.message}</p>

                {a.status === 'ACTIVE' && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewAlert(a.id)}
                      className="btn-secondary text-xs py-1 px-3 min-h-[32px]"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B7791F]" />
                      <span>Acknowledge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAlertForNotes(a.id)}
                      className="btn-primary text-xs py-1 px-3 min-h-[32px]"
                    >
                      <span>Add Notes & Resolve</span>
                    </button>
                  </div>
                )}

                {selectedAlertForNotes === a.id && (
                  <div className="mt-2 space-y-2 pt-2 border-t border-[#E2E6EB]">
                    <textarea
                      placeholder="Enter clinical assessment notes..."
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      className="form-textarea text-xs"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(a.id)}
                      className="btn-primary text-xs"
                    >
                      Confirm Resolution
                    </button>
                  </div>
                )}

                {a.resolution_notes && (
                  <div className="text-xs bg-white p-2 rounded border border-[#E2E6EB] text-[#334155]">
                    <strong>Staff Notes ({a.reviewed_by}):</strong> {a.resolution_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
