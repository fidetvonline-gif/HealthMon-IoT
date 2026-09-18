import React, { useState } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  CheckCircle,
  Clock,
  ShieldAlert,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HealthAlert } from '../../types';

export const AlertsManagementPage: React.FC = () => {
  const { alerts, reviewAlert, resolveAlert } = useHealthData();
  const { user } = useAuth();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const reviewerName = user?.full_name || 'Dr. Evelyn Adams, RN';

  const filteredAlerts = alerts.filter((alt) => {
    if (severityFilter !== 'ALL' && alt.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alt.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        (alt.student_name && alt.student_name.toLowerCase().includes(q)) ||
        alt.alert_type.toLowerCase().includes(q) ||
        alt.parameter.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReview = (alt: HealthAlert) => {
    reviewAlert(alt.id, reviewerName);
    if (selectedAlert && selectedAlert.id === alt.id) {
      setSelectedAlert({
        ...selectedAlert,
        status: 'REVIEWED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerName,
      });
    }
  };

  const handleResolve = (alt: HealthAlert) => {
    resolveAlert(alt.id, reviewerName, resolutionNotes || 'Condition stabilized; normal baseline vitals observed.');
    if (selectedAlert && selectedAlert.id === alt.id) {
      setSelectedAlert({
        ...selectedAlert,
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
        resolved_by: reviewerName,
        resolution_notes: resolutionNotes || 'Condition stabilized; normal baseline vitals observed.',
      });
    }
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
            <span>Abnormal Physiological Condition Alerts</span>
          </h2>
          <p className="text-xs text-slate-500">
            Features 10 & 11 — Central Clinical Alert Management, Review & Resolution Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-rose-100 text-rose-800 px-3 py-1 font-bold">
            {alerts.filter((a) => a.status === 'ACTIVE').length} Active
          </span>
          <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 font-bold">
            {alerts.filter((a) => a.status === 'REVIEWED').length} In Review
          </span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 font-bold">
            {alerts.filter((a) => a.status === 'RESOLVED').length} Resolved
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or condition..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Unresolved)</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feature 11: Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
            No alerts match the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md cursor-pointer transition-all ${
                alt.status === 'ACTIVE'
                  ? 'border-rose-300 bg-rose-50/20'
                  : alt.status === 'REVIEWED'
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={alt.severity} />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{alt.student_name || 'Student'}</h4>
                    <span className="text-xs text-slate-500 font-medium">{alt.alert_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={alt.status} size="sm" />
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Parameter</span>
                  <span className="font-semibold text-slate-800">{alt.parameter}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Recorded Reading</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">{alt.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Configured Threshold</span>
                  <span className="font-mono text-slate-600">{alt.threshold}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <p className="text-slate-600 truncate max-w-md">{alt.message}</p>
                <div className="flex items-center gap-2">
                  {alt.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReview(alt);
                      }}
                      className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      [Review]
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alt);
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feature 11: Section 21 ALERT DETAILS MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900">ALERT DETAILS (Section 21)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-500 block text-[11px]">Student:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedAlert.student_name || 'Student'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Severity:</span>
                  <StatusBadge status={selectedAlert.severity} />
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Parameter:</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.parameter}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Value:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">{selectedAlert.value}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Threshold:</span>
                  <span className="font-mono text-slate-700">{selectedAlert.threshold}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Detected:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedAlert.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Threshold Violation Summary:</span>
                <p className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              {/* Status and Notes */}
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Current Status:</span>
                <StatusBadge status={selectedAlert.status} size="md" />
              </div>

              {selectedAlert.resolution_notes && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
                  <span className="font-bold block mb-0.5">Clinical Resolution Notes ({selectedAlert.resolved_by}):</span>
                  <p>{selectedAlert.resolution_notes}</p>
                </div>
              )}

              {selectedAlert.status !== 'RESOLVED' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter Clinical Assessment Notes (Required for Resolution):
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Advised student to rest, administered hydration, vitals re-stabilized."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
              <div>
                {selectedAlert.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => handleReview(selectedAlert)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    [Mark as Reviewed]
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedAlert.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedAlert)}
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    [Resolve Alert]
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
