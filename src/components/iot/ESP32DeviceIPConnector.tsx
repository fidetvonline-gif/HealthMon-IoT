import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Radio,
  RefreshCw,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Activity,
  Server,
  HelpCircle,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityType } from '../../types';

interface ESP32DeviceIPConnectorProps {
  onClose?: () => void;
}

interface PhysioV4Data {
  hr: number | null;
  spo2: number | null;
  temp: number | null;
  activity: string;
  status: string;
  signal: string;
  contact: boolean;
  score: number;
  reason: string;
  baselineReady: boolean;
  hrBase: number | null;
  spo2Base: number | null;
  tempBase: number | null;
  max30102: boolean;
  mlx: boolean;
  mpu: boolean;
  oled: boolean;
  wifi: boolean;
  ip: string;
  rssi: number | null;
  uptime: string;
  ir: number;
}

export const ESP32DeviceIPConnector: React.FC<ESP32DeviceIPConnectorProps> = ({ onClose }) => {
  const { devices, sendSensorReading } = useHealthData();
  const { availableUsers } = useAuth();

  const [deviceIp, setDeviceIp] = useState<string>('192.168.1.42');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollIntervalMs, setPollIntervalMs] = useState<number>(2000); // 2s per spec
  const [useLocalSimulationFallback, setUseLocalSimulationFallback] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(availableUsers[0]?.id || 'usr-student-001');

  const [liveData, setLiveData] = useState<PhysioV4Data | null>({
    hr: 72,
    spo2: 97.5,
    temp: 36.8,
    activity: 'STILL',
    status: 'NORMAL',
    signal: 'GOOD',
    contact: true,
    score: 0,
    reason: 'No abnormal findings',
    baselineReady: true,
    hrBase: 71.2,
    spo2Base: 97.8,
    tempBase: 36.7,
    max30102: true,
    mlx: true,
    mpu: true,
    oled: true,
    wifi: true,
    ip: '192.168.1.42',
    rssi: -58,
    uptime: '0d 0h 14m 22s',
    ir: 84213,
  });

  const [lastPollTime, setLastPollTime] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollTimerRef = useRef<any>(null);

  // Map V4 activity string to VitaTrack ActivityType
  const mapActivityToVitaTrack = (actStr: string): ActivityType => {
    switch (actStr?.toUpperCase()) {
      case 'WALKING':
        return 'Walking';
      case 'RUNNING':
        return 'Running';
      case 'SUDDEN':
        return 'Possible Fall';
      case 'STILL':
      case 'SITTING':
      default:
        return 'Sitting';
    }
  };

  const performPoll = async () => {
    const targetUrl = deviceIp.startsWith('http') ? `${deviceIp}/api/data` : `http://${deviceIp}/api/data`;
    try {
      if (useLocalSimulationFallback) {
        // Generate realistic dynamic variation for simulation mode matching V4
        const mockHr = 70 + Math.floor(Math.sin(Date.now() / 2000) * 8);
        const mockSpo2 = 97.5 + Number((Math.cos(Date.now() / 3000) * 1).toFixed(1));
        const mockTemp = 36.8 + Number((Math.sin(Date.now() / 5000) * 0.3).toFixed(1));
        const isAbnormal = mockHr > 100 || mockSpo2 < 95 || mockTemp >= 38.0;

        const simulatedResponse: PhysioV4Data = {
          hr: mockHr,
          spo2: mockSpo2,
          temp: mockTemp,
          activity: 'STILL',
          status: isAbnormal ? 'ABNORMAL' : 'NORMAL',
          signal: 'GOOD',
          contact: true,
          score: isAbnormal ? 3 : 0,
          reason: isAbnormal ? 'Elevated telemetry threshold exceeded' : 'No abnormal findings',
          baselineReady: true,
          hrBase: 71.2,
          spo2Base: 97.8,
          tempBase: 36.7,
          max30102: true,
          mlx: true,
          mpu: true,
          oled: true,
          wifi: true,
          ip: deviceIp.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
          rssi: -56,
          uptime: '0d 1h 22m 10s',
          ir: 84213,
        };

        setLiveData(simulatedResponse);
        setConnectionStatus('connected');
        setLastPollTime(new Date().toLocaleTimeString());
        setPollCount((c) => c + 1);
        setErrorMessage(null);

        // Ingest into VitaTrack cloud engine
        const student = availableUsers.find((u) => u.id === selectedStudentId) || availableUsers[0];
        const assignedDev = devices[0];
        if (student && simulatedResponse.hr !== null && simulatedResponse.spo2 !== null && simulatedResponse.temp !== null) {
          sendSensorReading({
            student_id: student.id,
            student_name: student.full_name,
            device_id: assignedDev?.id || 'dev-esp32-c3',
            heart_rate: simulatedResponse.hr,
            spo2: simulatedResponse.spo2,
            temperature: simulatedResponse.temp,
            activity: mapActivityToVitaTrack(simulatedResponse.activity),
            battery_level: 90,
          });
        }
        return;
      }

      // Real fetch from physical hardware IP
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP status ${res.status} from ESP32-C3 device`);
      }

      const data: PhysioV4Data = await res.json();
      setLiveData(data);
      setConnectionStatus('connected');
      setLastPollTime(new Date().toLocaleTimeString());
      setPollCount((c) => c + 1);
      setErrorMessage(null);

      // Ingest into VitaTrack
      const student = availableUsers.find((u) => u.id === selectedStudentId) || availableUsers[0];
      const assignedDev = devices[0];
      if (student && data.hr !== null && data.spo2 !== null && data.temp !== null) {
        sendSensorReading({
          student_id: student.id,
          student_name: student.full_name,
          device_id: assignedDev?.id || 'dev-esp32-c3',
          heart_rate: data.hr,
          spo2: data.spo2,
          temperature: data.temp,
          activity: mapActivityToVitaTrack(data.activity),
          battery_level: 88,
        });
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage(err.message || 'Failed to connect to device IP');
    }
  };

  useEffect(() => {
    if (isPolling) {
      pollTimerRef.current = setInterval(performPoll, pollIntervalMs);
      performPoll(); // Immediate first poll
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isPolling, deviceIp, pollIntervalMs, useLocalSimulationFallback, selectedStudentId]);

  const assignedStudent = availableUsers.find((u) => u.id === selectedStudentId) || availableUsers[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  ESP32-C3 Physio Monitor V4 — IP Device Link
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  GET /api/data
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Connect directly to your physical ESP32-C3 SuperMini wearable device via local IP address. Polled every 2s per V4 specification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-xs">
              <span className={`h-2.5 w-2.5 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-700">
                {isPolling ? (connectionStatus === 'connected' ? 'Polling Active (2s)' : 'Connecting...') : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-600" />
            Hardware IP Address & Polling Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ESP32-C3 Device IP Address / URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={deviceIp}
                  onChange={(e) => setDeviceIp(e.target.value)}
                  placeholder="192.168.1.42"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Found on Serial Monitor when connected to Wi-Fi. Endpoint: <code className="text-blue-600">/api/data</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Map Telemetry to Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.student_id})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Incoming vitals update this student's live records.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLocalSimulationFallback}
                onChange={(e) => setUseLocalSimulationFallback(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-700">
                Use Local Simulation at this IP (Test without physical hardware connected)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={performPoll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Test Single Poll</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPolling(!isPolling)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  isPolling ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPolling ? 'Stop Polling (2s)' : 'Start Live Polling'}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Connection Warning:</span> {errorMessage}.{' '}
                <span className="block mt-1 text-[11px]">
                  Note: If connecting to physical ESP32-C3 over local network, ensure your ESP32 Arduino sketch includes CORS header: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">server.sendHeader("Access-Control-Allow-Origin", "*");</code> or check Wi-Fi connection.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Connection Diagnostics Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              ESP32-C3 V4 Link Status
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : connectionStatus === 'error'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Total Polls</span>
              <span className="font-mono text-base font-bold text-slate-900">{pollCount}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Last Poll Time</span>
              <span className="font-mono text-xs font-bold text-slate-900">{lastPollTime || 'Never'}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Wi-Fi RSSI</span>
              <span className="font-mono text-xs font-bold text-emerald-700">
                {liveData?.rssi !== null && liveData?.rssi !== undefined ? `${liveData.rssi} dBm` : 'N/A'}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Device Uptime</span>
              <span className="font-mono text-xs font-bold text-slate-800">{liveData?.uptime || '0d 0h 0m'}</span>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100 text-xs space-y-1">
            <span className="font-bold text-blue-900 block">Assigned Target Student:</span>
            <div className="text-blue-800 font-medium">
              {assignedStudent?.full_name} ({assignedStudent?.student_id})
            </div>
          </div>
        </div>
      </div>

      {/* Live Vitals & Hardware Diagnostics Grid */}
      {liveData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Live Sensor Telemetry from ESP32-C3 V4 (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">GET /api/data</code>)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Status: <strong className="text-slate-800">{liveData.status}</strong> | Signal:{' '}
              <strong className="text-slate-800">{liveData.signal}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-rose-500 opacity-20">
                <Activity className="w-12 h-12" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Heart Rate (MAX30102)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {liveData.hr !== null ? liveData.hr : '--'}
                </span>
                <span className="text-xs font-bold text-slate-600">BPM</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>Baseline: {liveData.hrBase !== null ? `${liveData.hrBase} BPM` : 'Learning...'}</span>
                <span className="text-emerald-600 font-semibold">Valid</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-blue-500 opacity-20">
                <Radio className="w-12 h-12" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Blood Oxygen (SpO₂)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {liveData.spo2 !== null ? liveData.spo2 : '--'}
                </span>
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>Baseline: {liveData.spo2Base !== null ? `${liveData.spo2Base}%` : 'Learning...'}</span>
                <span className="text-emerald-600 font-semibold">&gt;= 95%</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-amber-500 opacity-20">
                <Cpu className="w-12 h-12" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Body Temp (MLX90614)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {liveData.temp !== null ? liveData.temp.toFixed(1) : '--'}
                </span>
                <span className="text-xs font-bold text-slate-600">°C</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>Baseline: {liveData.tempBase !== null ? `${liveData.tempBase}°C` : 'Learning...'}</span>
                <span className="text-emerald-600 font-semibold">Normal</span>
              </div>
            </div>

            {/* Activity & Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-purple-500 opacity-20">
                <Server className="w-12 h-12" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Motion & Skin Contact</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-extrabold uppercase">
                  {liveData.activity}
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    liveData.contact ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {liveData.contact ? 'CONTACT OK' : 'NO CONTACT'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>Raw IR: {liveData.ir}</span>
                <span className={liveData.score > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                  Score: {liveData.score}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Subsystem Init Status & Raw JSON API Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Hardware Sensor Initialization Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${liveData.max30102 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span className="block font-semibold">MAX30102</span>
                  <span className="text-[11px] font-bold">{liveData.max30102 ? 'OK (0x57)' : 'FAIL'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${liveData.mlx ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span className="block font-semibold">MLX90614</span>
                  <span className="text-[11px] font-bold">{liveData.mlx ? 'OK (0x5A)' : 'FAIL'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${liveData.mpu ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span className="block font-semibold">MPU6050</span>
                  <span className="text-[11px] font-bold">{liveData.mpu ? 'OK (0x68)' : 'FAIL'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${liveData.oled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <span className="block font-semibold">SSD1306 OLED</span>
                  <span className="text-[11px] font-bold">{liveData.oled ? 'OK (0x3C)' : 'FAIL'}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Baseline Learning Status:</span>
                  <span className={liveData.baselineReady ? 'text-emerald-700' : 'text-amber-700'}>
                    {liveData.baselineReady ? 'Ready (Loaded from Flash)' : 'Learning (~60s cumulative mean)'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Reason / Triggered Factors: <span className="font-mono text-slate-800">{liveData.reason}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  GET http://{liveData.ip}/api/data (JSON Response)
                </span>
                <span className="font-mono text-[10px] text-slate-500">Cache-Control: no-store</span>
              </div>
              <pre className="rounded-xl bg-slate-900 p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner max-h-48">
                {JSON.stringify(liveData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
