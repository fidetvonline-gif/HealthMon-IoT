import React, { useState } from 'react';
import {
  X,
  Sliders,
  Cpu,
  Wifi,
  Play,
  Pause,
  Code2,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityType } from '../../types';
import { ESP32OledDisplay } from './ESP32OledDisplay';
import { ESP32DeviceIPConnector } from './ESP32DeviceIPConnector';

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

  const [activeModalTab, setActiveModalTab] = useState<'simulator' | 'ip_link'>('simulator');

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || 'dev-001');
  const activeDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];
  const assignedStudent = availableUsers.find((u) => u.id === activeDevice?.student_id) || availableUsers[0];

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

  const applyPreset = (presetName: string) => {
    if (presetName === 'normal') {
      setHr(78);
      setSpo2(98);
      setTemp(36.7);
      setActivity('Sitting');
    } else if (presetName === 'tachycardia') {
      setHr(125);
      setSpo2(98);
      setTemp(36.8);
      setActivity('Sitting');
    } else if (presetName === 'hypoxia') {
      setHr(94);
      setSpo2(91);
      setTemp(36.9);
      setActivity('Sitting');
    } else if (presetName === 'fever') {
      setHr(104);
      setSpo2(96);
      setTemp(38.4);
      setActivity('Sitting');
    } else if (presetName === 'fall') {
      setHr(115);
      setSpo2(96);
      setTemp(36.8);
      setActivity('Possible Fall');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-[#0B1726]/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto pt-10 sm:pt-14">
      <div className="relative w-full max-w-5xl rounded-[8px] bg-white shadow-xl border border-[#E2E6EB] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Sticky Header with Safe Padding & Back/Close Controls */}
        <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E6EB] bg-[#F1F3F5] px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
              title="Close and return to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to App</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0B1726] text-white">
                <Cpu className="h-4 w-4 text-[#087F8C]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
                  IoT Hardware & IP Bench
                </h3>
                <p className="text-[11px] text-[#667085]">
                  ESP32 sensor telemetry simulator & direct local IP connection (`/api/data`)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFirmware && (
              <button
                type="button"
                onClick={onOpenFirmware}
                className="btn-secondary text-xs"
              >
                <Code2 className="h-3.5 w-3.5 text-[#087F8C]" />
                <span>ESP32 Firmware</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs bg-[#C24141]/10 text-[#C24141] border-[#C24141]/20 hover:bg-[#C24141]/20"
            >
              <X className="h-4 w-4" />
              <span>Exit Bench</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Test Bench vs IP Connector */}
        <div className="flex border-b border-[#E2E6EB] bg-white px-4">
          <button
            type="button"
            onClick={() => setActiveModalTab('simulator')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeModalTab === 'simulator'
                ? 'border-[#087F8C] text-[#087F8C]'
                : 'border-transparent text-[#667085] hover:text-[#17202A]'
            }`}
          >
            Hardware Test Bench (Manual Control)
          </button>
          <button
            type="button"
            onClick={() => setActiveModalTab('ip_link')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeModalTab === 'ip_link'
                ? 'border-[#087F8C] text-[#087F8C]'
                : 'border-transparent text-[#667085] hover:text-[#17202A]'
            }`}
          >
            Physical Device IP Link (`GET /api/data`)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeModalTab === 'ip_link' ? (
            <ESP32DeviceIPConnector onClose={onClose} />
          ) : (
            <div className="space-y-6">
              {/* Preset Scenarios */}
              <div className="card-panel p-4 rounded-[8px] bg-[#F1F3F5] border border-[#E2E6EB]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-bold text-[#17202A]">Preset Clinical Test Scenarios:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('normal')}
                      className="btn-secondary text-xs"
                    >
                      Baseline Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('tachycardia')}
                      className="btn-secondary text-xs text-[#C24141]"
                    >
                      Tachycardia (125 BPM)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('hypoxia')}
                      className="btn-secondary text-xs text-[#2764A5]"
                    >
                      Hypoxemia (91% SpO₂)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('fever')}
                      className="btn-secondary text-xs text-[#B7791F]"
                    >
                      Fever (38.4°C)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('fall')}
                      className="btn-secondary text-xs text-[#17202A]"
                    >
                      Fall Event
                    </button>
                  </div>
                </div>
              </div>

              {/* Sliders & Controls Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-panel p-5 rounded-[8px] space-y-4">
                  <h4 className="text-xs font-bold text-[#17202A] uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#087F8C]" />
                    <span>Sensor Output Sliders</span>
                  </h4>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-[#17202A]">Heart Rate (MAX30102)</span>
                        <span className="font-mono text-[#087F8C] font-bold">{hr} BPM</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="180"
                        value={hr}
                        onChange={(e) => setHr(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#E2E6EB] rounded-lg appearance-none cursor-pointer accent-[#087F8C]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-[#17202A]">Blood Oxygen (SpO₂)</span>
                        <span className="font-mono text-[#2764A5] font-bold">{spo2}%</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="100"
                        value={spo2}
                        onChange={(e) => setSpo2(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#E2E6EB] rounded-lg appearance-none cursor-pointer accent-[#2764A5]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-[#17202A]">Body Temperature (MLX90614)</span>
                        <span className="font-mono text-[#B7791F] font-bold">{temp.toFixed(1)}°C</span>
                      </div>
                      <input
                        type="range"
                        min="35.0"
                        max="41.0"
                        step="0.1"
                        value={temp}
                        onChange={(e) => setTemp(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#E2E6EB] rounded-lg appearance-none cursor-pointer accent-[#B7791F]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#17202A] mb-1">Motion Activity (MPU6050)</label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value as ActivityType)}
                        className="form-select"
                      >
                        <option value="Sitting">Sitting / Still</option>
                        <option value="Walking">Walking</option>
                        <option value="Running">Running</option>
                        <option value="Possible Fall">Possible Fall</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleTransmit}
                        className="btn-primary flex-1 justify-center text-xs"
                      >
                        Transmit Telemetry Packet
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                        className={isAutoStreaming ? 'btn-danger text-xs' : 'btn-secondary text-xs'}
                      >
                        {isAutoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isAutoStreaming ? 'Stop Auto' : 'Start Auto (3s)'}</span>
                      </button>
                    </div>

                    {sendSuccess && (
                      <div className="text-center font-bold text-xs text-[#16805C] bg-[#16805C]/10 py-1.5 rounded-[4px] border border-[#16805C]/20">
                        Packet transmitted successfully at {lastSentTime}!
                      </div>
                    )}
                  </div>
                </div>

                {/* OLED Render Card */}
                <div className="card-panel p-5 rounded-[8px] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-3">
                      On-Device SSD1306 OLED Display View
                    </h4>
                    <ESP32OledDisplay
                      hr={hr}
                      spo2={spo2}
                      temp={temp}
                      activity={activity}
                      battery={battery}
                      wifiStatus={wifiConnected}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E6EB] text-xs space-y-2">
                    <div className="flex justify-between text-[#667085]">
                      <span>Target Student:</span>
                      <strong className="text-[#17202A]">{assignedStudent?.full_name} ({assignedStudent?.student_id})</strong>
                    </div>
                    <div className="flex justify-between text-[#667085]">
                      <span>Device UID:</span>
                      <strong className="font-mono text-[#17202A]">{activeDevice?.device_uid}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
