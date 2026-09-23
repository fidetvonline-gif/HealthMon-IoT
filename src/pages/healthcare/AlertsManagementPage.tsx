import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Clock,
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
      <div className="border-b border-[#E2E6EB] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#C24141]" />
            <span>Physiological Condition Alerts</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Clinical alert management, review, and resolution workflow
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-[4px] bg-[#C24141]/10 text-[#C24141] px-2.5 py-1 border border-[#C24141]/20">
            {alerts.filter((a) => a.status === 'ACTIVE').length} Active
          </span>
          <span className="rounded-[4px] bg-[#B7791F]/10 text-[#B7791F] px-2.5 py-1 border border-[#B7791F]/20">
            {alerts.filter((a) => a.status === 'REVIEWED').length} In Review
          </span>
          <span className="rounded-[4px] bg-[#16805C]/10 text-[#16805C] px-2.5 py-1 border border-[#16805C]/20">
            {alerts.filter((a) => a.status === 'RESOLVED').length} Resolved
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="card-panel p-4 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by student name or condition..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="form-select text-xs w-auto"
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
            className="form-select text-xs w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Unresolved)</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="card-panel p-12 text-center text-[#98A2B3] text-xs rounded-[8px]">
            No alerts match the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`card-panel p-4 rounded-[8px] cursor-pointer transition-colors ${
                alt.status === 'ACTIVE'
                  ? 'border-[#C24141]/40 bg-[#C24141]/5'
                  : alt.status === 'REVIEWED'
                  ? 'border-[#B7791F]/40 bg-[#B7791F]/5'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E6EB] pb-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={alt.severity} />
                  <div>
                    <h4 className="text-xs font-bold text-[#17202A]">{alt.student_name || 'Student'}</h4>
                    <span className="text-[11px] text-[#667085]">{alt.alert_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={alt.status} size="sm" />
                  <span className="text-xs text-[#667085] font-mono">
                    {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary text-xs py-1 px-2.5 min-h-[32px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#087F8C]" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-[#667085] text-[11px] block">Parameter</span>
                  <span className="font-semibold text-[#17202A]">{alt.parameter}</span>
                </div>
                <div>
                  <span className="text-[#667085] text-[11px] block">Recorded Value</span>
                  <span className="font-mono font-bold text-[#C24141] text-xs">{alt.value}</span>
                </div>
                <div>
                  <span className="text-[#667085] text-[11px] block">Threshold</span>
                  <span className="font-mono text-[#334155]">{alt.threshold}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-[#0B1726]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-panel bg-white rounded-[8px] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAlert.severity} />
                <h3 className="text-sm font-bold text-[#17202A]">{selectedAlert.alert_type}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded text-[#667085] hover:text-[#17202A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Student:</span>
                <span className="font-bold text-[#17202A]">{selectedAlert.student_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Monitored Parameter:</span>
                <span className="font-semibold text-[#17202A]">{selectedAlert.parameter}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Recorded Sensor Value:</span>
                <span className="font-mono font-bold text-[#C24141] text-sm">{selectedAlert.value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                <span className="text-[#667085]">Threshold Limit:</span>
                <span className="font-mono text-[#334155]">{selectedAlert.threshold}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Timestamp:</span>
                <span className="font-mono text-[#334155]">{new Date(selectedAlert.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-[6px] bg-[#F1F3F5] p-3 text-xs text-[#334155]">
              <span className="font-bold text-[#17202A]">Message: </span>
              {selectedAlert.message}
            </div>

            {selectedAlert.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => handleReview(selectedAlert)}
                className="btn-secondary w-full justify-center text-xs"
              >
                <Clock className="w-4 h-4 text-[#B7791F]" />
                <span>Mark as Reviewed</span>
              </button>
            )}

            {selectedAlert.status !== 'RESOLVED' && (
              <div className="space-y-2 pt-2 border-t border-[#E2E6EB]">
                <label className="block text-xs font-bold text-[#17202A]">
                  Resolution Notes & Clinical Assessment
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter medical observations or instructions..."
                  className="form-textarea text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleResolve(selectedAlert)}
                  className="btn-primary w-full justify-center text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Resolve Alert</span>
                </button>
              </div>
            )}

            {selectedAlert.status === 'RESOLVED' && selectedAlert.resolution_notes && (
              <div className="rounded-[6px] bg-[#16805C]/10 border border-[#16805C]/20 p-3 text-xs text-[#16805C]">
                <div className="font-bold mb-1">
                  Resolved by {selectedAlert.resolved_by || 'Clinic Staff'} at{' '}
                  {selectedAlert.resolved_at ? new Date(selectedAlert.resolved_at).toLocaleTimeString() : 'N/A'}
                </div>
                <p className="text-[#334155]">{selectedAlert.resolution_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
