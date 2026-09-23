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
  const sizeClasses = isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  // Normal / Online / Resolved
  if (['NORMAL', 'ONLINE', 'RESOLVED'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] bg-[#16805C]/10 text-[#16805C] border border-[#16805C]/20 ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full bg-[#16805C] ${pulse ? 'animate-ping' : ''}`} />
        {status}
      </span>
    );
  }

  // Warning / Connecting / Reviewed
  if (['WARNING', 'CONNECTING', 'REVIEWED'].includes(normalized)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20 ${sizeClasses}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#B7791F]" />
        {status}
      </span>
    );
  }

  // Abnormal / Offline / High / Critical / Active
  if (['ABNORMAL', 'OFFLINE', 'HIGH', 'CRITICAL', 'ACTIVE', 'ERROR'].includes(normalized)) {
    const isCritical = ['CRITICAL', 'ABNORMAL', 'HIGH'].includes(normalized);
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] ${
          isCritical
            ? 'bg-[#C24141]/10 text-[#C24141] border border-[#C24141]/20'
            : 'bg-[#F1F3F5] text-[#334155] border border-[#E2E6EB]'
        } ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-[#C24141]' : 'bg-[#98A2B3]'}`} />
        {status}
      </span>
    );
  }

  // Info
  if (normalized === 'INFO') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] bg-[#2764A5]/10 text-[#2764A5] border border-[#2764A5]/20 ${sizeClasses}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#2764A5]" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[4px] bg-[#F1F3F5] text-[#334155] border border-[#E2E6EB] ${sizeClasses}`}
    >
      {status}
    </span>
  );
};
