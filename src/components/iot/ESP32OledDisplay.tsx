import React from 'react';
import { Wifi, Battery, BatteryWarning, HeartPulse, Activity } from 'lucide-react';
import { HealthReading, IoTDevice } from '../../types';

interface ESP32OledDisplayProps {
  reading?: HealthReading;
  device?: IoTDevice;
  compact?: boolean;
}

export const ESP32OledDisplay: React.FC<ESP32OledDisplayProps> = ({ reading, device, compact = false }) => {
  const hr = reading?.heart_rate ?? 78;
  const spo2 = reading?.spo2 ?? 98;
  const temp = reading?.temperature ?? 36.7;
  const status = reading?.status ?? 'Normal';
  const activity = reading?.activity ?? 'Sitting';
  const battery = device?.battery_level ?? reading?.battery_level ?? 82;
  const isOnline = device?.status === 'ONLINE' || true;
  const isAbnormal = status === 'Abnormal';

  return (
    <div
      className={`relative rounded-xl border-4 border-slate-800 bg-slate-950 p-4 shadow-xl font-mono text-cyan-400 select-none ${
        compact ? 'max-w-xs' : 'max-w-sm w-full'
      }`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(6, 182, 212, 0.15)',
      }}
    >
      {/* Glossy screen glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

      {/* Screen Frame Header */}
      <div className="flex items-center justify-between border-b border-cyan-950/60 pb-1.5 mb-2 text-xs text-cyan-300/80">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-[11px] text-yellow-400">
          <span>HEALTHMON</span>
          <span className="text-[9px] px-1 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
            {device?.device_uid || 'ESP32-S3'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* WiFi icon */}
          <div className="flex items-center gap-0.5" title={`Wi-Fi: ${isOnline ? 'Connected' : 'Disconnected'}`}>
            <Wifi className={`w-3 h-3 ${isOnline ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>

          {/* Battery gauge */}
          <div className="flex items-center gap-0.5" title={`Battery: ${battery}%`}>
            {battery <= 20 ? (
              <BatteryWarning className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-[10px] text-cyan-300">{battery}%</span>
          </div>
        </div>
      </div>

      {/* Pixel Display Body */}
      <div className="space-y-1.5 text-xs">
        {/* Heart Rate */}
        <div className="flex items-center justify-between">
          <span className="text-cyan-400/70 text-[11px]">HR:</span>
          <div className="flex items-center gap-1 font-bold text-sm text-cyan-200">
            <HeartPulse className={`w-3.5 h-3.5 text-rose-400 ${hr > 100 ? 'animate-bounce' : 'animate-pulse'}`} />
            <span>{hr}</span>
            <span className="text-[10px] font-normal text-cyan-400/60">BPM</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="flex items-center justify-between">
          <span className="text-cyan-400/70 text-[11px]">SpO2:</span>
          <div className="flex items-center gap-1 font-bold text-sm text-cyan-200">
            <span>{spo2}</span>
            <span className="text-[10px] font-normal text-cyan-400/60">%</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between">
          <span className="text-cyan-400/70 text-[11px]">TEMP:</span>
          <div className="flex items-center gap-1 font-bold text-sm text-cyan-200">
            <span>{temp.toFixed(1)}</span>
            <span className="text-[10px] font-normal text-cyan-400/60">°C</span>
          </div>
        </div>

        {/* Activity & Motion */}
        <div className="flex items-center justify-between pt-0.5 border-t border-cyan-950/40">
          <span className="text-cyan-400/70 text-[11px]">ACT:</span>
          <div className="flex items-center gap-1 font-medium text-xs text-cyan-300">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>{activity.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="mt-2.5 pt-1.5 border-t border-cyan-950/80 flex items-center justify-between">
        <span className="text-[10px] text-cyan-400/60">SYSTEM STATUS</span>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isAbnormal
              ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
              : status === 'Warning'
              ? 'bg-amber-950 text-amber-300 border border-amber-600'
              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
          }`}
        >
          {status}
        </div>
      </div>

      {/* Simulated physical bezel label */}
      <div className="mt-2 text-center text-[9px] text-slate-500 font-sans tracking-widest uppercase">
        0.96" I2C OLED (SSD1306)
      </div>
    </div>
  );
};
