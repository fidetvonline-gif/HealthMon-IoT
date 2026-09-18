import React from 'react';
import { HealthStatus, DeviceStatus, AlertSeverity, AlertStatus } from '../../types';

interface StatusBadgeProps {
  status?: HealthStatus | DeviceStatus | AlertSeverity | AlertStatus | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', pulse = false }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  // Normal / Online / Resolved
  if (['NORMAL', 'ONLINE', 'RESOLVED'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${pulse ? 'animate-ping' : ''}`} />
        {status}
      </span>
    );
  }

  // Warning / Connecting / Reviewed
  if (['WARNING', 'CONNECTING', 'REVIEWED'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {status}
      </span>
    );
  }

  // Abnormal / Offline / High / Critical / Active
  if (['ABNORMAL', 'OFFLINE', 'HIGH', 'CRITICAL', 'ACTIVE', 'ERROR'].includes(normalized)) {
    const isCritical = ['CRITICAL', 'ABNORMAL', 'HIGH'].includes(normalized);
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
          isCritical
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        } ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
        {status}
      </span>
    );
  }

  // Info
  if (normalized === 'INFO') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
    >
      {status}
    </span>
  );
};
