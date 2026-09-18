import React, { useState } from 'react';
import {
  X,
  Radio,
  Sliders,
  Send,
  RefreshCw,
  Cpu,
  Wifi,
  Battery,
  AlertTriangle,
  Play,
  Pause,
  Code2,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityType } from '../../types';
import { ESP32OledDisplay } from './ESP32OledDisplay';

interface ESP32HardwareSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFirmware?: () => void;
}

export const ESP32HardwareSimulatorModal: React.FC<ESP32HardwareSimulatorModalProps> = ({
  isOpen,
  onClose,
  onOpenFirmware,
}) => {
  const {
    devices,
    sendSensorReading,
    isAutoStreaming,
    setIsAutoStreaming,
    latestReadingForStudent,
  } = useHealthData();
  const { availableUsers } = useAuth();

  // Selected device and student
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || 'dev-001');
  const activeDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];
  const assignedStudent = availableUsers.find((u) => u.id === activeDevice?.student_id) || availableUsers[0];

  // Sensor parameters state
  const [hr, setHr] = useState<number>(78);
  const [spo2, setSpo2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(36.7);
  const [activity, setActivity] = useState<ActivityType>('Sitting');
  const [battery, setBattery] = useState<number>(82);
  const [wifiConnected, setWifiConnected] = useState<boolean>(true);
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentReading = latestReadingForStudent(assignedStudent.id);

  const handleTransmit = () => {
    if (!wifiConnected) {
      alert('Wi-Fi is disconnected on ESP32-S3. Packet transmission aborted.');
      return;
    }

    sendSensorReading({
      student_id: assignedStudent.id,
      student_name: assignedStudent.full_name,
      device_id: activeDevice.id,
      heart_rate: hr,
      spo2,
      temperature: temp,
      activity,
      battery_level: battery,
    });

    setLastSentTime(new Date().toLocaleTimeString());
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 2000);
  };

  // Preset scenarios
  const applyPreset = (presetName: string) => {
    if (presetName === 'normal') {
      setHr(78);
      setSpo2(98);
      setTemp(36.7);
      setActivity('Sitting');
    } else if (presetName === 'tachycardia') {
      setHr(125); // Section 50 defense scenario
      setSpo2(98);
      setTemp(36.8);
      setActivity('Sitting');
    } else if (presetName === 'hypoxia') {
      setHr(94);
      setSpo2(91); // Low oxygen
      setTemp(36.9);
      setActivity('Sitting');
    } else if (presetName === 'fever') {
      setHr(104);
      setSpo2(96);
      setTemp(38.4); // High temp
      setActivity('Sitting');
    } else if (presetName === 'fall') {
      setHr(115);
      setSpo2(96);
      setTemp(36.8);
      setActivity('Possible Fall'); // Fall vector
    }
  };

  const simulatedPayload = {
    device_id: activeDevice?.device_uid || 'HM-ESP32-001',
    student_id: assignedStudent?.student_id || assignedStudent?.id,
    heart_rate: hr,
    spo2,
    temperature: temp,
    activity: activity.toLowerCase(),
    battery_level: battery,
    wifi_connected: wifiConnected,
    recorded_at: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">ESP32-S3 IoT Hardware Test Bench</h3>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Simulation & Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Directly inject real-time physiological telemetry packets into Supabase and test threshold rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFirmware && (
              <button
                type="button"
                onClick={onOpenFirmware}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Code2 className="h-3.5 w-3.5 text-blue-600" />
                <span>ESP32 C++ Code</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Sensor Sliders & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Device & Student Selector */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target IoT Device</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.device_uid} ({d.device_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Student</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{assignedStudent?.full_name || 'Unassigned'}</span>
                  <span className="text-[11px] text-slate-500">({assignedStudent?.student_id || 'ID N/A'})</span>
                </div>
              </div>
            </div>

            {/* Abnormal Preset Triggers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Quick Condition Presets (Defense Testing)
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('normal')}
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors text-center"
                >
                  🟢 Normal (78)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('tachycardia')}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 transition-colors text-center"
                >
                  🚨 High HR (125)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hypoxia')}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100 transition-colors text-center"
                >
                  🫁 Low SpO₂ (91%)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fever')}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors text-center"
                >
                  🌡 Fever (38.4°C)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fall')}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[11px] font-semibold text-purple-800 hover:bg-purple-100 transition-colors text-center"
                >
                  ⚠️ Sudden Fall
                </button>
              </div>
            </div>

            {/* Sliders Box */}
            <div className="space-y-3.5 rounded-xl border border-slate-200 bg-white p-4">
              {/* MAX30102: Heart Rate */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">MAX30102 — Heart Rate</span>
                  <span className={`font-mono text-sm ${hr > 100 || hr < 60 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                    {hr} BPM
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>40 BPM (Bradycardia)</span>
                  <span>Threshold: 60-100</span>
                  <span>180 BPM (Tachycardia)</span>
                </div>
              </div>

              {/* MAX30102: SpO2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">MAX30102 — Blood Oxygen (SpO₂)</span>
                  <span className={`font-mono text-sm ${spo2 < 95 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                    {spo2} %
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>80% (Severe Hypoxemia)</span>
                  <span>Safe &gt;= 95%</span>
                  <span>100% (Optimal)</span>
                </div>
              </div>

              {/* MLX90614: Temperature */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">MLX90614 — Infrared Body Temperature</span>
                  <span className={`font-mono text-sm ${temp > 37.5 || temp < 36.5 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                    {temp.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="34.0"
                  max="41.5"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>34.0°C (Hypothermia)</span>
                  <span>Normal: 36.5 - 37.5°C</span>
                  <span>41.5°C (High Pyrexia)</span>
                </div>
              </div>

              {/* MPU6050: Activity Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MPU6050 — Activity Classification (6-Axis Motion)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['Sitting', 'Standing', 'Walking', 'Running', 'Inactive', 'Possible Fall'] as ActivityType[]).map(
                    (act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setActivity(act)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          activity === act
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {act}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Battery & Wi-Fi */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-slate-500" /> Battery
                    </span>
                    <span className="font-mono text-xs">{battery}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={battery}
                    onChange={(e) => setBattery(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-slate-500" /> Wi-Fi Link
                  </span>
                  <button
                    type="button"
                    onClick={() => setWifiConnected(!wifiConnected)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      wifiConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {wifiConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isAutoStreaming
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isAutoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Auto-Stream: {isAutoStreaming ? 'ON (4.5s)' : 'PAUSED'}</span>
              </button>

              <button
                type="button"
                onClick={handleTransmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Reading to Cloud</span>
              </button>
            </div>

            {sendSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 text-center font-medium">
                ✓ Sensor telemetry packet ingested and processed by Threshold Engine!
              </div>
            )}
          </div>

          {/* Right Column: Physical OLED & Ingestion Packet JSON (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-2">
                Simulated On-Device OLED (SSD1306)
              </span>
              <div className="flex justify-center">
                <ESP32OledDisplay
                  reading={{
                    id: 'sim',
                    student_id: assignedStudent.id,
                    device_id: activeDevice.id,
                    heart_rate: hr,
                    spo2,
                    temperature: temp,
                    activity,
                    status: hr > 100 || spo2 < 95 || temp > 37.5 || activity === 'Possible Fall' ? 'Abnormal' : 'Normal',
                    recorded_at: new Date().toISOString(),
                    battery_level: battery,
                  }}
                  device={activeDevice}
                />
              </div>
            </div>

            {/* IoT Telemetry JSON Payload */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  JSON Wi-Fi Payload (POST /readings)
                </span>
                {lastSentTime && <span className="text-[10px] text-slate-400">Last: {lastSentTime}</span>}
              </div>
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner">
                {JSON.stringify(simulatedPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
