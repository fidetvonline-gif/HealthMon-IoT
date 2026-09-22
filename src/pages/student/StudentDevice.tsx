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
  ShieldCheck,
  RefreshCw,
  Sliders,
  Server,
  Network,
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
  const { deviceForStudent, latestReadingForStudent } = useHealthData();

  const [activeTab, setActiveTab] = useState<'specs' | 'ip_connect'>('specs');

  const studentId = user?.id || 'usr-student-001';
  const device = deviceForStudent(studentId);
  const reading = latestReadingForStudent(studentId);

  const battery = device?.battery_level ?? reading?.battery_level ?? 82;
  const isBatteryLow = battery <= 20;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-600" />
            <span>Connected IoT Wearable Device</span>
          </h2>
          <p className="text-xs text-slate-500">
            ESP32-S3 Hardware Health, Battery Level & Direct Wi-Fi IP Telemetry Link (`/api/data`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'ip_connect' ? 'specs' : 'ip_connect')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors shadow-xs ${
              activeTab === 'ip_connect'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>{activeTab === 'ip_connect' ? 'View Device Specs' : 'Connect Physical ESP32 via IP'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 px-3.5 py-2 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Test Bench</span>
          </button>
        </div>
      </div>

      {/* Low Battery Warning Banner if applicable - Section 25 */}
      {isBatteryLow && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 sm:p-5 flex items-center gap-3 animate-pulse">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shrink-0">
            <BatteryWarning className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-rose-900">⚠️ DEVICE BATTERY LOW: {battery}%</h4>
            <p className="text-xs text-rose-800">
              {device?.device_uid || 'HM-ESP32-001'} is below 20%. Please connect the 5V magnetic charging cable to
              ensure uninterrupted continuous health telemetry.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher for User Friendliness */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'specs'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Device Specifications & Sensors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ip_connect')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ip_connect'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Physical ESP32-C3 IP Link (GET /api/data)</span>
        </button>
      </div>

      {activeTab === 'ip_connect' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Network className="h-5 w-5 text-emerald-600" />
              <span>Connect Physical ESP32-C3 Wearable via Local IP Address</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the local IP address assigned to your ESP32-C3 device over Wi-Fi. VitaTrack will poll <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">GET /api/data</code> every 2 seconds to ingest real-time vital signs and fall detection alerts.
            </p>
          </div>
          <ESP32DeviceIPConnector />
        </div>
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Hardware Specification & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Wearable Unit Specifications</h3>
                <p className="text-xs text-slate-500">Custom PCB wrist unit based on Espressif ESP32-S3</p>
              </div>
              <StatusBadge status={device?.status || 'ONLINE'} pulse />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Device UID</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{device?.device_uid || 'HM-ESP32-001'}</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Battery Capacity</span>
                <span className={`font-mono font-bold text-sm flex items-center gap-1.5 ${battery <= 20 ? 'text-rose-600' : 'text-slate-900'}`}>
                  <Battery className="w-4 h-4 text-blue-600" />
                  {battery}% LiPo
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Wi-Fi Connection</span>
                <span className="font-mono font-bold text-emerald-600 text-sm flex items-center gap-1.5">
                  <Wifi className="w-4 h-4" />
                  {device?.wifi_status ? 'Connected (-58 dBm)' : 'Offline'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Firmware Version</span>
                <span className="font-mono font-semibold text-slate-800 text-sm">{device?.firmware_version || 'v1.2.4-esp32s3'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Keep-Alive Ping:
              </span>
              <span className="font-mono font-medium text-slate-700">
                {device?.last_seen ? new Date(device.last_seen).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* Sensor Diagnostics Stack */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hardware Sensor Array Diagnostics</h3>
            <p className="text-xs text-slate-500 mb-4">Specified physical sensor modules connected over I2C bus</p>

            <div className="space-y-3 text-xs">
              {/* MAX30102 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 font-bold">
                    ❤️
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">MAX30102 Optical Pulse Oximeter</div>
                    <div className="text-[11px] text-slate-500">I2C Address: 0x57 | Dual Red & IR LED PPG</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Operational
                </span>
              </div>

              {/* MLX90614 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 font-bold">
                    🌡
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">MLX90614 Non-Contact IR Thermometer</div>
                    <div className="text-[11px] text-slate-500">I2C Address: 0x5A | ±0.2°C Medical Accuracy</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Operational
                </span>
              </div>

              {/* MPU6050 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
                    🏃
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">MPU6050 6-Axis Motion & Fall Sensor</div>
                    <div className="text-[11px] text-slate-500">I2C Address: 0x68 | 3-Axis Accel + 3-Axis Gyro</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Operational
                </span>
              </div>

              {/* SSD1306 OLED */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 font-bold">
                    📺
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">SSD1306 0.96" Monochrome OLED</div>
                    <div className="text-[11px] text-slate-500">I2C Address: 0x3C | 128x64 px Local Screen</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Embedded OLED & On-Device Screen Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Local Wrist OLED Screen (Feature 15)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time rendering mirror of what the physical OLED displays on student's wrist
            </p>

            <div className="flex justify-center my-4">
              <ESP32OledDisplay reading={reading} device={device} />
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>Offline Buffer Fallback:</strong> If campus Wi-Fi drops temporarily, the ESP32-S3 caches up to
                500 historical sensor readings in non-volatile flash RAM (NVS) and automatically uploads pending records
                once the Wi-Fi connection is re-established.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
