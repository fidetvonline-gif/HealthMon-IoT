import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Radio,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  Cpu,
  Activity,
  Server,
  Terminal,
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

export const ESP32DeviceIPConnector: React.FC<ESP32DeviceIPConnectorProps> = () => {
  const { devices, sendSensorReading } = useHealthData();
  const { availableUsers } = useAuth();

  const [deviceIp, setDeviceIp] = useState<string>('192.168.1.42');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollIntervalMs] = useState<number>(2000); // 2s per spec
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
      performPoll();
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
      <div className="card-panel bg-[#0B1726] text-white p-6 rounded-[8px] border border-[#12263A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#12263A] text-[#474A2C]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  ESP32-C3 Physio Monitor V4 — IP Connector
                </h2>
                <span className="rounded-[4px] bg-[#12263A] px-2 py-0.5 text-xs font-mono font-semibold text-[#474A2C] border border-[#334155]/40">
                  GET /api/data
                </span>
              </div>
              <p className="text-xs text-[#98A2B3] mt-0.5">
                Connect directly to your physical ESP32-C3 SuperMini hardware over local IP. Polled every 2s per V4 spec.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-[4px] bg-[#12263A] border border-[#334155]/40 px-3 py-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isPolling ? 'bg-[#16805C]' : 'bg-[#98A2B3]'}`} />
              <span className="text-xs font-bold text-white">
                {isPolling ? (connectionStatus === 'connected' ? 'Polling Active (2s)' : 'Connecting...') : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 card-panel p-5 rounded-[8px] space-y-4">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#474A2C]" />
            <span>Hardware IP Address & Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#17202A] mb-1">
                ESP32-C3 IP Address
              </label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="192.168.1.42"
                className="form-input font-mono"
              />
              <p className="text-[11px] text-[#667085] mt-1">
                Found on Serial Monitor. Endpoint: <code className="text-[#474A2C]">/api/data</code>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#17202A] mb-1">
                Map Telemetry to Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="form-select"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.student_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E2E6EB]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLocalSimulationFallback}
                onChange={(e) => setUseLocalSimulationFallback(e.target.checked)}
                className="rounded border-[#E2E6EB] text-[#474A2C] focus:ring-[#474A2C] h-4 w-4"
              />
              <span className="text-xs font-semibold text-[#17202A]">
                Use Local Simulation at this IP
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={performPoll}
                className="btn-secondary text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#474A2C]" />
                <span>Test Poll</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPolling(!isPolling)}
                className={isPolling ? 'btn-danger text-xs' : 'btn-primary text-xs'}
              >
                {isPolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPolling ? 'Stop Polling' : 'Start Polling'}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-[6px] bg-[#C24141]/10 border border-[#C24141]/20 p-3 text-xs text-[#C24141] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#C24141] mt-0.5" />
              <div>
                <span className="font-bold">Connection Error:</span> {errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostics Card */}
        <div className="lg:col-span-5 card-panel p-5 rounded-[8px] space-y-4">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#16805C]" />
              <span>Link Diagnostics</span>
            </span>
            <span
              className={`rounded-[4px] px-2 py-0.5 text-[10px] font-bold ${
                connectionStatus === 'connected'
                  ? 'bg-[#16805C]/10 text-[#16805C] border border-[#16805C]/20'
                  : connectionStatus === 'error'
                  ? 'bg-[#C24141]/10 text-[#C24141] border border-[#C24141]/20'
                  : 'bg-[#F1F3F5] text-[#667085]'
              }`}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
              <span className="text-[#667085] block text-[11px]">Total Polls</span>
              <span className="font-mono text-sm font-bold text-[#17202A]">{pollCount}</span>
            </div>
            <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
              <span className="text-[#667085] block text-[11px]">Last Response</span>
              <span className="font-mono text-xs font-bold text-[#17202A]">{lastPollTime || 'Never'}</span>
            </div>
            <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
              <span className="text-[#667085] block text-[11px]">Wi-Fi RSSI</span>
              <span className="font-mono text-xs font-bold text-[#16805C]">
                {liveData?.rssi !== null && liveData?.rssi !== undefined ? `${liveData.rssi} dBm` : 'N/A'}
              </span>
            </div>
            <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
              <span className="text-[#667085] block text-[11px]">Device Uptime</span>
              <span className="font-mono text-xs font-bold text-[#17202A]">{liveData?.uptime || '0d 0h 0m'}</span>
            </div>
          </div>

          <div className="rounded-[6px] bg-[#474A2C]/10 border border-[#474A2C]/20 p-3 text-xs">
            <span className="font-bold text-[#474A2C] block mb-1">Target Student Account:</span>
            <div className="text-[#17202A] font-semibold">
              {assignedStudent?.full_name} ({assignedStudent?.student_id})
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Vitals Display */}
      {liveData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#474A2C]" />
              <span>Live Telemetry Response</span>
            </h3>
            <span className="text-xs font-mono text-[#667085]">
              Status: <strong className="text-[#17202A]">{liveData.status}</strong> | Signal:{' '}
              <strong className="text-[#17202A]">{liveData.signal}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-panel p-4 rounded-[8px]">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Heart Rate (MAX30102)</span>
              <div className="mt-2 text-2xl font-bold font-mono text-[#17202A]">
                {liveData.hr !== null ? liveData.hr : '--'} <span className="text-xs font-normal text-[#667085]">BPM</span>
              </div>
            </div>

            <div className="card-panel p-4 rounded-[8px]">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Blood Oxygen (SpO₂)</span>
              <div className="mt-2 text-2xl font-bold font-mono text-[#17202A]">
                {liveData.spo2 !== null ? liveData.spo2 : '--'} <span className="text-xs font-normal text-[#667085]">%</span>
              </div>
            </div>

            <div className="card-panel p-4 rounded-[8px]">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Body Temp (MLX90614)</span>
              <div className="mt-2 text-2xl font-bold font-mono text-[#17202A]">
                {liveData.temp !== null ? liveData.temp.toFixed(1) : '--'} <span className="text-xs font-normal text-[#667085]">°C</span>
              </div>
            </div>

            <div className="card-panel p-4 rounded-[8px]">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Motion State</span>
              <div className="mt-2 text-lg font-bold text-[#17202A]">
                {liveData.activity}
              </div>
            </div>
          </div>

          {/* Subsystem Hardware Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card-panel p-5 rounded-[8px] space-y-3">
              <h4 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
                I2C Sensor Hardware Init Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-[4px] border ${liveData.max30102 ? 'bg-[#16805C]/10 border-[#16805C]/30 text-[#16805C]' : 'bg-[#C24141]/10 border-[#C24141]/30 text-[#C24141]'}`}>
                  <span className="block font-semibold">MAX30102</span>
                  <span className="text-[10px] font-bold">{liveData.max30102 ? 'OK (0x57)' : 'FAIL'}</span>
                </div>
                <div className={`p-2.5 rounded-[4px] border ${liveData.mlx ? 'bg-[#16805C]/10 border-[#16805C]/30 text-[#16805C]' : 'bg-[#C24141]/10 border-[#C24141]/30 text-[#C24141]'}`}>
                  <span className="block font-semibold">MLX90614</span>
                  <span className="text-[10px] font-bold">{liveData.mlx ? 'OK (0x5A)' : 'FAIL'}</span>
                </div>
                <div className={`p-2.5 rounded-[4px] border ${liveData.mpu ? 'bg-[#16805C]/10 border-[#16805C]/30 text-[#16805C]' : 'bg-[#C24141]/10 border-[#C24141]/30 text-[#C24141]'}`}>
                  <span className="block font-semibold">MPU6050</span>
                  <span className="text-[10px] font-bold">{liveData.mpu ? 'OK (0x68)' : 'FAIL'}</span>
                </div>
                <div className={`p-2.5 rounded-[4px] border ${liveData.oled ? 'bg-[#16805C]/10 border-[#16805C]/30 text-[#16805C]' : 'bg-[#C24141]/10 border-[#C24141]/30 text-[#C24141]'}`}>
                  <span className="block font-semibold">SSD1306</span>
                  <span className="text-[10px] font-bold">{liveData.oled ? 'OK (0x3C)' : 'FAIL'}</span>
                </div>
              </div>
            </div>

            <div className="card-panel bg-[#0B1726] border border-[#12263A] p-4 rounded-[8px] space-y-2 text-white">
              <div className="flex items-center justify-between text-xs text-[#98A2B3]">
                <span className="flex items-center gap-1.5 font-mono text-[#474A2C]">
                  <Terminal className="w-3.5 h-3.5" />
                  GET http://{liveData.ip}/api/data
                </span>
                <span className="font-mono text-[10px]">Cache-Control: no-store</span>
              </div>
              <pre className="rounded-[4px] bg-[#12263A] p-3 text-[11px] font-mono text-[#474A2C] overflow-x-auto max-h-40">
                {JSON.stringify(liveData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
