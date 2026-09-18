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
  Send,
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

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ student, onBack, onNavigateTab }) => {
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
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Live Dashboard</span>
        </button>

        <StatusBadge status={status} size="md" />
      </div>

      {/* Feature 6: Section 13 STUDENT PROFILE & DEVICE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Student Profile Info */}
        <div className="md:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{student.full_name}</h3>
              <p className="text-xs text-slate-500 font-mono">Student ID: {student.student_id || 'UY/CS/2026/001'}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900">{student.department || 'Computer Science'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Faculty:</span>
              <span className="font-semibold text-slate-900">{student.faculty || 'Computing Science'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Phone:</span>
              <span className="font-mono text-slate-800">{student.phone || '+234 803 123 4567'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Emergency Next of Kin:</span>
              <span className="font-semibold text-rose-700">{student.emergency_contact_name || 'Sarah Doe (Mother)'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Kin Phone:</span>
              <span className="font-mono text-slate-800">{student.emergency_contact_phone || '+234 803 987 6543'}</span>
            </div>
          </div>
        </div>

        {/* Assigned Device Info */}
        <div className="md:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {device?.device_uid || 'HM-ESP32-001'}
                  </h3>
                  <p className="text-xs text-slate-500">ESP32-S3 IoT Wrist Wearable Unit</p>
                </div>
              </div>
              <StatusBadge status={device?.status || 'ONLINE'} pulse />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                <span className="text-slate-500 text-[11px] block">Battery Capacity</span>
                <span className="font-mono font-bold text-sm text-slate-900 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-blue-600" /> {battery}%
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                <span className="text-slate-500 text-[11px] block">Wi-Fi Connection</span>
                <span className="font-mono font-bold text-sm text-emerald-600 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" /> -58 dBm
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                <span className="text-slate-500 text-[11px] block">Firmware</span>
                <span className="font-mono text-slate-700 font-semibold">{device?.firmware_version || 'v1.2.4'}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
                <span className="text-slate-500 text-[11px] block">Last Seen</span>
                <span className="font-mono text-slate-700">
                  {device?.last_seen ? new Date(device.last_seen).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hardware Sensors: MAX30102, MLX90614, MPU6050</span>
            <span className="text-emerald-600 font-bold">All Calibrated</span>
          </div>
        </div>
      </div>

      {/* Feature 6: CURRENT READINGS 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1 text-rose-600">
              <Heart className="h-4 w-4 fill-rose-500" />
              HEART RATE
            </span>
            <StatusBadge status={hr > 100 || hr < 60 ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{hr}</span>
            <span className="text-xs font-semibold text-slate-500">BPM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Normal Range: 60 - 100 BPM</div>
        </div>

        {/* SpO2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1 text-blue-600">
              <Droplets className="h-4 w-4 fill-blue-500" />
              SpO₂
            </span>
            <StatusBadge status={spo2 < 95 ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{spo2}</span>
            <span className="text-xs font-semibold text-slate-500">%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Safe Baseline: &gt;= 95%</div>
        </div>

        {/* Temperature */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1 text-amber-600">
              <Thermometer className="h-4 w-4" />
              TEMPERATURE
            </span>
            <StatusBadge status={temp > 37.5 || temp < 36.5 ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{temp.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Baseline: 36.5 - 37.5°C</div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1 text-purple-600">
              <Activity className="h-4 w-4" />
              ACTIVITY
            </span>
            <StatusBadge status={activity === 'Possible Fall' ? 'Abnormal' : 'Normal'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activity}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">MPU6050 Motion Classifier</div>
        </div>
      </div>

      {/* Realtime Chart Telemetry */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Live Telemetry Trend Plot</h3>
        <p className="text-xs text-slate-500 mb-4">Real-time signal feed ingested via Supabase Realtime</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Abnormal Alerts History & Clinical Triage */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Student Abnormal Condition Alerts</h3>
            <p className="text-xs text-slate-500">Threshold violations recorded for {student.full_name}</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">Total: {studentAlerts.length}</span>
        </div>

        <div className="space-y-3">
          {studentAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No abnormal alerts on record for this student.
            </div>
          ) : (
            studentAlerts.map((alt) => (
              <div key={alt.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alt.severity} />
                    <span className="font-bold text-xs text-slate-900">{alt.alert_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <StatusBadge status={alt.status} size="sm" />
                    <span className="text-slate-400 font-mono">{new Date(alt.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-slate-400 text-[11px]">Parameter:</span> {alt.parameter}
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Value:</span>{' '}
                    <span className="font-mono font-bold text-rose-600">{alt.value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Threshold:</span> {alt.threshold}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3">{alt.message}</p>

                {/* Resolution Notes */}
                {alt.resolution_notes && (
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5 text-xs text-blue-900 mb-2">
                    <strong>Clinic Action ({alt.reviewed_by || 'Staff'}):</strong> {alt.resolution_notes}
                  </div>
                )}

                {/* Healthcare Action Buttons */}
                {alt.status !== 'RESOLVED' && (
                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    {alt.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleReviewAlert(alt.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Mark as Reviewed
                      </button>
                    )}

                    {selectedAlertForNotes === alt.id ? (
                      <div className="w-full mt-2 space-y-2">
                        <textarea
                          placeholder="Enter clinical assessment notes or intervention taken..."
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-hidden"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAlertForNotes(null)}
                            className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveAlert(alt.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                          >
                            Save & Resolve Alert
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedAlertForNotes(alt.id)}
                        className="rounded-lg bg-emerald-600 text-white px-3 py-1 text-xs font-bold hover:bg-emerald-700 shadow-xs"
                      >
                        Resolve Alert With Notes
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
