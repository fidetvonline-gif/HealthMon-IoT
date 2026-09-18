import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline status notice"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2 duration-200 border border-amber-500"
    >
      <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
      <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
      <span>Offline Mode — Cached telemetry & local data are active.</span>
    </aside>
  );
};
