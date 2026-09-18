import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, Info, HeartPulse } from 'lucide-react';
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
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <span>Abnormal Condition Alerts</span>
        </h2>
        <p className="text-xs text-slate-500">
          Features 10 & 11 — Real-Time Alert Engine Notifications & Clinical Review Status
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
            <span>ACTIVE ALERTS</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-950">{activeCount}</span>
          <p className="text-[11px] text-rose-700 mt-1">Requiring monitoring or clinical check</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
            <span>CLINIC REVIEWED</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-950">{reviewedCount}</span>
          <p className="text-[11px] text-amber-700 mt-1">Acknowledged by healthcare staff</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
            <span>RESOLVED</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950">{resolvedCount}</span>
          <p className="text-[11px] text-emerald-700 mt-1">Stabilized within normal thresholds</p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {studentAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Physiological Alerts</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              All monitored physiological parameters are currently within normal baseline thresholds.
            </p>
          </div>
        ) : (
          studentAlerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL' || alt.severity === 'HIGH';
            return (
              <div
                key={alt.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                  isCritical ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={alt.severity} />
                    <h3 className="text-sm font-bold text-slate-900">{alt.alert_type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alt.status} size="sm" />
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Monitored Parameter</span>
                    <span className="font-semibold text-slate-800">{alt.parameter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Recorded Value</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">{alt.value}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Configured Upper/Lower Limit</span>
                    <span className="font-mono text-slate-600">{alt.threshold}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 mb-2">
                  <span className="font-semibold text-slate-900">System Message: </span>
                  {alt.message}
                </div>

                {alt.resolution_notes && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">
                    <span className="font-bold text-blue-950">
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
