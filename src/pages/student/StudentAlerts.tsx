import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentAlerts: React.FC = () => {
  const { user } = useAuth();
  const { alerts } = useHealthData();

  const studentId = user?.id || 'usr-student-001';
  const studentAlerts = alerts.filter((a) => a.student_id === studentId);

  const activeCount = studentAlerts.filter((a) => a.status === 'ACTIVE').length;
  const reviewedCount = studentAlerts.filter((a) => a.status === 'REVIEWED').length;
  const resolvedCount = studentAlerts.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="border-b border-[#E2E6EB] pb-4">
        <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#B7791F]" />
          <span>Abnormal Condition Alerts</span>
        </h2>
        <p className="text-xs text-[#667085]">
          Real-Time Alert Engine Notifications & Clinical Review Status
        </p>
      </div>

      {/* Summary Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-panel p-4 rounded-[8px] border-[#C24141]/30 bg-[#C24141]/5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#C24141] uppercase tracking-wider mb-1">
            <span>ACTIVE ALERTS</span>
            <ShieldAlert className="h-4 w-4 text-[#C24141]" />
          </div>
          <span className="text-2xl font-bold text-[#C24141] font-mono">{activeCount}</span>
          <p className="text-[11px] text-[#C24141] mt-0.5">Requiring clinical monitoring</p>
        </div>

        <div className="card-panel p-4 rounded-[8px] border-[#B7791F]/30 bg-[#B7791F]/5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#B7791F] uppercase tracking-wider mb-1">
            <span>CLINIC REVIEWED</span>
            <Clock className="h-4 w-4 text-[#B7791F]" />
          </div>
          <span className="text-2xl font-bold text-[#B7791F] font-mono">{reviewedCount}</span>
          <p className="text-[11px] text-[#B7791F] mt-0.5">Acknowledged by healthcare staff</p>
        </div>

        <div className="card-panel p-4 rounded-[8px] border-[#16805C]/30 bg-[#16805C]/5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#16805C] uppercase tracking-wider mb-1">
            <span>RESOLVED</span>
            <CheckCircle className="h-4 w-4 text-[#16805C]" />
          </div>
          <span className="text-2xl font-bold text-[#16805C] font-mono">{resolvedCount}</span>
          <p className="text-[11px] text-[#16805C] mt-0.5">Stabilized within normal thresholds</p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {studentAlerts.length === 0 ? (
          <div className="card-panel rounded-[8px] p-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#16805C]/10 text-[#16805C] mb-3">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#17202A]">No Physiological Alerts</h3>
            <p className="mt-1 text-xs text-[#667085] max-w-sm mx-auto">
              All monitored physiological parameters are currently within normal baseline thresholds.
            </p>
          </div>
        ) : (
          studentAlerts.map((alt) => {
            return (
              <div
                key={alt.id}
                className="card-panel p-4 rounded-[8px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E6EB] pb-3">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={alt.severity} />
                    <h3 className="text-xs font-bold text-[#17202A]">{alt.alert_type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alt.status} size="sm" />
                    <span className="text-xs text-[#667085] font-mono">
                      {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-[#667085] block text-[11px]">Monitored Parameter</span>
                    <span className="font-semibold text-[#17202A]">{alt.parameter}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[11px]">Recorded Value</span>
                    <span className="font-mono font-bold text-[#C24141] text-xs">{alt.value}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[11px]">Configured Upper/Lower Limit</span>
                    <span className="font-mono text-[#334155]">{alt.threshold}</span>
                  </div>
                </div>

                <div className="rounded-[6px] bg-[#F1F3F5] p-3 text-xs text-[#334155] mb-2">
                  <span className="font-semibold text-[#17202A]">System Message: </span>
                  {alt.message}
                </div>

                {alt.resolution_notes && (
                  <div className="rounded-[6px] bg-[#2764A5]/10 border border-[#2764A5]/20 p-3 text-xs text-[#2764A5]">
                    <span className="font-bold">
                      Clinic Staff Notes ({alt.reviewed_by || 'Healthcare RN'}):{' '}
                    </span>
                    {alt.resolution_notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
