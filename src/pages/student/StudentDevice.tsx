import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Battery,
  BatteryWarning,
  Activity,
  CheckCircle,
  Radio,
  Clock,
  Sliders,
  Server,
  Network,
  Heart,
  Thermometer,
  Monitor,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ESP32OledDisplay } from '../../components/iot/ESP32OledDisplay';
import { ESP32DeviceIPConnector } from '../../components/iot/ESP32DeviceIPConnector';

interface StudentDeviceProps {
  onOpenSimulator: () => void;
}

export const StudentDevice: React.FC<StudentDeviceProps> = ({ onOpenSimulator }) => {
  const { user } = useAuth();
  const { deviceForStudent, latestReadingForStudent, updateDeviceUid } = useHealthData();

  const [activeTab, setActiveTab] = useState<'specs' | 'ip_connect'>('specs');
  const [isEditingUid, setIsEditingUid] = useState(false);
  const [customUidInput, setCustomUidInput] = useState('');

  const studentId = user?.id || 'usr-student-001';
  const device = deviceForStudent(studentId);

  const handleSaveUid = (e: React.FormEvent) => {
    e.preventDefault();
    if (device && customUidInput.trim()) {
      updateDeviceUid(device.id, customUidInput.trim());
    }
    setIsEditingUid(false);
  };
  const reading = latestReadingForStudent(studentId);

  const battery = device?.battery_level ?? reading?.battery_level ?? 82;
  const isBatteryLow = battery <= 20;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#474A2C]" />
            <span>Connected Wearable Hardware</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Hardware Specifications & Direct Wi-Fi IP Link (`GET /api/data`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'ip_connect' ? 'specs' : 'ip_connect')}
            className="btn-primary text-xs"
          >
            <Network className="h-3.5 w-3.5" />
            <span>{activeTab === 'ip_connect' ? 'Device Specs' : 'Connect Physical ESP32 via IP'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="btn-secondary text-xs"
          >
            <Sliders className="h-3.5 w-3.5 text-[#474A2C]" />
            <span>Test Bench</span>
          </button>
        </div>
      </div>

      {/* Low Battery Warning Banner */}
      {isBatteryLow && (
        <div className="rounded-[8px] border border-[#C24141] bg-[#C24141]/10 p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#C24141] text-white font-bold shrink-0">
            <BatteryWarning className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#C24141]">DEVICE BATTERY LOW: {battery}%</h4>
            <p className="text-xs text-[#334155]">
              {device?.device_uid || 'VT-ESP32-001'} is below 20%. Connect charging cable to maintain continuous telemetry.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-[#E2E6EB] bg-[#F1F3F5] p-1 rounded-[6px]">
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors ${
            activeTab === 'specs'
              ? 'bg-white text-[#17202A] shadow-xs'
              : 'text-[#667085] hover:text-[#17202A]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Device Specifications & Sensors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ip_connect')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors ${
            activeTab === 'ip_connect'
              ? 'bg-white text-[#474A2C] shadow-xs'
              : 'text-[#667085] hover:text-[#17202A]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Physical ESP32 IP Link (GET /api/data)</span>
        </button>
      </div>

      {activeTab === 'ip_connect' ? (
        <div className="card-panel p-5 rounded-[8px] space-y-4">
          <div className="border-b border-[#E2E6EB] pb-3">
            <h3 className="text-sm font-bold text-[#17202A] flex items-center gap-2">
              <Network className="h-4 w-4 text-[#474A2C]" />
              <span>Connect Physical ESP32 Wearable via Local IP</span>
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Enter the local IP address assigned to your ESP32 device. VitaTrack polls <code className="bg-[#F1F3F5] px-1 py-0.5 rounded text-[#17202A]">GET /api/data</code> every 2 seconds.
            </p>
          </div>
          <ESP32DeviceIPConnector />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Device Hardware Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-panel p-5 rounded-[8px]">
              <div className="flex items-center justify-between mb-4 border-b border-[#E2E6EB] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">Wearable Unit Specifications</h3>
                  <p className="text-xs text-[#667085]">Microcontroller board based on Espressif ESP32-S3 / C3</p>
                </div>
                <StatusBadge status={device?.status || 'ONLINE'} pulse />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#667085] text-[11px] block">Device UID</span>
                    {!isEditingUid && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomUidInput(device?.device_uid || 'VT-21/SC/CO/1117');
                          setIsEditingUid(true);
                        }}
                        className="text-[10px] font-semibold text-[#474A2C] hover:underline flex items-center gap-1"
                        title="Update Device UID"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                  {isEditingUid ? (
                    <form onSubmit={handleSaveUid} className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={customUidInput}
                        onChange={(e) => setCustomUidInput(e.target.value)}
                        className="form-input text-xs py-1 px-2 font-mono"
                        placeholder="Enter new UID..."
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 rounded bg-[#474A2C] text-white hover:bg-[#3A3D24]"
                        title="Save Device UID"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingUid(false)}
                        className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="font-mono font-bold text-[#17202A] text-xs block">{device?.device_uid || 'VT-21/SC/CO/1117'}</span>
                  )}
                </div>

                <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                  <span className="text-[#667085] text-[11px] block">Battery Capacity</span>
                  <span className={`font-mono font-bold text-xs flex items-center gap-1.5 ${battery <= 20 ? 'text-[#C24141]' : 'text-[#17202A]'}`}>
                    <Battery className="w-3.5 h-3.5 text-[#474A2C]" />
                    {battery}% LiPo
                  </span>
                </div>

                <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                  <span className="text-[#667085] text-[11px] block">Wi-Fi Connection</span>
                  <span className="font-mono font-bold text-[#16805C] text-xs flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    {device?.wifi_status ? 'Connected (-58 dBm)' : 'Offline'}
                  </span>
                </div>

                <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB]">
                  <span className="text-[#667085] text-[11px] block">Firmware Version</span>
                  <span className="font-mono font-semibold text-[#17202A] text-xs">{device?.firmware_version || 'v1.2.4-esp32s3'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E6EB] flex items-center justify-between text-xs text-[#667085]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                  Last Keep-Alive Ping:
                </span>
                <span className="font-mono font-medium text-[#17202A]">
                  {device?.last_seen ? new Date(device.last_seen).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>

            {/* Sensor Diagnostics Stack */}
            <div className="card-panel p-5 rounded-[8px]">
              <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-1">Sensor Diagnostics Array</h3>
              <p className="text-xs text-[#667085] mb-4">I2C bus sensor stack diagnostics</p>

              <div className="space-y-2.5 text-xs">
                {/* MAX30102 */}
                <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#C24141]/10 text-[#C24141]">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#17202A]">MAX30102 Optical Pulse Oximeter</div>
                      <div className="text-[11px] text-[#667085]">I2C Address: 0x57 | PPG Red & IR LED</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#16805C] font-semibold text-[11px] bg-[#16805C]/10 px-2 py-0.5 rounded-[4px] border border-[#16805C]/20">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>

                {/* MLX90614 */}
                <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#B7791F]/10 text-[#B7791F]">
                      <Thermometer className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#17202A]">MLX90614 Non-Contact IR Thermometer</div>
                      <div className="text-[11px] text-[#667085]">I2C Address: 0x5A | ±0.2°C Medical Accuracy</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#16805C] font-semibold text-[11px] bg-[#16805C]/10 px-2 py-0.5 rounded-[4px] border border-[#16805C]/20">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>

                {/* MPU6050 */}
                <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#474A2C]/10 text-[#474A2C]">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#17202A]">MPU6050 6-Axis Motion & Fall Sensor</div>
                      <div className="text-[11px] text-[#667085]">I2C Address: 0x68 | 3-Axis Accel + Gyro</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#16805C] font-semibold text-[11px] bg-[#16805C]/10 px-2 py-0.5 rounded-[4px] border border-[#16805C]/20">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>

                {/* SSD1306 OLED */}
                <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#E2E6EB] bg-[#F1F3F5]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#2764A5]/10 text-[#2764A5]">
                      <Monitor className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#17202A]">SSD1306 0.96" Monochrome OLED</div>
                      <div className="text-[11px] text-[#667085]">I2C Address: 0x3C | 128x64 px Local Screen</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#16805C] font-semibold text-[11px] bg-[#16805C]/10 px-2 py-0.5 rounded-[4px] border border-[#16805C]/20">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embedded OLED Screen (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-panel p-5 rounded-[8px]">
              <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-1">Wrist OLED Display Mirror</h3>
              <p className="text-xs text-[#667085] mb-4">
                Real-time rendering mirror of physical hardware screen
              </p>

              <div className="flex justify-center my-4">
                <ESP32OledDisplay reading={reading} device={device} />
              </div>

              <div className="rounded-[6px] bg-[#F1F3F5] p-3 border border-[#E2E6EB] text-xs text-[#334155] leading-relaxed space-y-1.5">
                <p>
                  <strong>NVS Flash Buffer:</strong> If Wi-Fi drops, readings cache in non-volatile flash RAM and sync automatically upon reconnection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
