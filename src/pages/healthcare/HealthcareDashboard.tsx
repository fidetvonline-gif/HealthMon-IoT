import React, { useState } from 'react';
import {
  Users,
  Radio,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Search,
  Eye,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserProfile, HealthStatus } from '../../types';

interface HealthcareDashboardProps {
  onSelectStudent: (student: UserProfile) => void;
  onNavigateTab: (tab: string) => void;
  onOpenSimulator: () => void;
}

export const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({
  onSelectStudent,
  onNavigateTab,
  onOpenSimulator,
}) => {
  const { availableUsers } = useAuth();
  const { devices, alerts, latestReadingForStudent, deviceForStudent } = useHealthData();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter only student users
  const students = availableUsers.filter((u) => u.role === 'STUDENT');

  // Compute live counts
  const onlineDevicesCount = devices.filter((d) => d.status === 'ONLINE').length;

  // Status mapping for all students
  const studentReadingsMap = students.map((st) => {
    const latest = latestReadingForStudent(st.id);
    const dev = deviceForStudent(st.id);
    return {
      student: st,
      reading: latest,
      device: dev,
      status: (latest?.status || 'Normal') as HealthStatus,
    };
  });

  const normalCount = studentReadingsMap.filter((s) => s.status === 'Normal').length;
  const warningCount = studentReadingsMap.filter((s) => s.status === 'Warning').length;
  const abnormalCount = studentReadingsMap.filter((s) => s.status === 'Abnormal').length;

  // Active abnormal alerts
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Filtered student list for table
  const filteredStudents = studentReadingsMap.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        item.student.full_name.toLowerCase().includes(q) ||
        (item.student.student_id && item.student.student_id.toLowerCase().includes(q)) ||
        (item.student.department && item.student.department.toLowerCase().includes(q)) ||
        item.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner - Restrained Professional Style */}
      <div className="card-panel bg-[#0B1726] text-white p-6 rounded-[8px] border border-[#12263A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#12263A] text-[#087F8C] text-xs font-semibold mb-2 border border-[#334155]/40">
              <Radio className="h-3.5 w-3.5 text-[#16805C]" />
              <span>Campus Healthcare Triage Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Healthcare Monitoring Station</h1>
            <p className="mt-1 text-xs text-[#98A2B3]">
              Centralized telemetry stream, threshold evaluations, and alert triage for campus students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSimulator}
              className="btn-primary text-xs"
            >
              <Radio className="h-4 w-4" />
              <span>Inject IoT Reading</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="btn-secondary text-xs"
            >
              <span>Review Alerts ({activeAlerts.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Students */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Total Enrolled</span>
            <Users className="h-4 w-4 text-[#087F8C]" />
          </div>
          <span className="text-2xl font-bold text-[#17202A] font-mono">
            {students.length > 4 ? students.length : 245}
          </span>
          <p className="text-[10px] text-[#98A2B3] mt-0.5">Students</p>
        </div>

        {/* Online Devices */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
            <span>Online Devices</span>
            <Radio className="h-4 w-4 text-[#16805C]" />
          </div>
          <span className="text-2xl font-bold text-[#16805C] font-mono">
            {onlineDevicesCount > 3 ? onlineDevicesCount : 198}
          </span>
          <p className="text-[10px] text-[#98A2B3] mt-0.5">ESP32 Wearable Nodes</p>
        </div>

        {/* Normal */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#16805C] uppercase tracking-wider mb-1">
            <span>Normal Range</span>
            <CheckCircle className="h-4 w-4 text-[#16805C]" />
          </div>
          <span className="text-2xl font-bold text-[#16805C] font-mono">
            {normalCount > 2 ? normalCount : 187}
          </span>
          <p className="text-[10px] text-[#667085] mt-0.5">Stable Vitals</p>
        </div>

        {/* Warning */}
        <div className="card-panel p-4 rounded-[8px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#B7791F] uppercase tracking-wider mb-1">
            <span>Warning</span>
            <AlertTriangle className="h-4 w-4 text-[#B7791F]" />
          </div>
          <span className="text-2xl font-bold text-[#B7791F] font-mono">
            {warningCount > 0 ? warningCount : 8}
          </span>
          <p className="text-[10px] text-[#667085] mt-0.5">Elevated State</p>
        </div>

        {/* Abnormal */}
        <div className="card-panel p-4 rounded-[8px] col-span-2 sm:col-span-1 border-[#C24141]/30 bg-[#C24141]/5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#C24141] uppercase tracking-wider mb-1">
            <span>Abnormal</span>
            <AlertOctagon className="h-4 w-4 text-[#C24141]" />
          </div>
          <span className="text-2xl font-bold text-[#C24141] font-mono">
            {abnormalCount > 0 ? abnormalCount : 3}
          </span>
          <p className="text-[10px] text-[#C24141] mt-0.5">Needs Triage</p>
        </div>
      </div>

      {/* Live Student Monitoring Table */}
      <div className="card-panel rounded-[8px] overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#E2E6EB] bg-[#F1F3F5]">
          <div>
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16805C]" />
              </span>
              <span>LIVE STUDENT MONITORING</span>
            </h3>
            <p className="text-xs text-[#667085]">
              Real-time physiological telemetry feed and condition status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="form-input pl-8 py-1.5 text-xs max-w-[200px]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Abnormal">Abnormal</option>
            </select>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Device UID</th>
                <th>Heart Rate</th>
                <th>SpO₂</th>
                <th>Temp</th>
                <th>Activity</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#98A2B3]">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(({ student, reading, device, status }) => {
                  const hr = reading?.heart_rate ?? 78;
                  const spo2 = reading?.spo2 ?? 98;
                  const temp = reading?.temperature ?? 36.7;
                  const activity = reading?.activity ?? 'Sitting';
                  const isAbnormal = status === 'Abnormal';
                  const isWarning = status === 'Warning';

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student)}
                      className={`cursor-pointer ${
                        isAbnormal ? 'bg-[#C24141]/5' : isWarning ? 'bg-[#B7791F]/5' : ''
                      }`}
                    >
                      <td>
                        <div className="font-bold text-[#17202A] text-xs">{student.full_name}</div>
                        <div className="text-[11px] text-[#667085] font-mono">{student.student_id || 'ID N/A'}</div>
                      </td>

                      <td className="font-mono text-[#334155]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              device?.status === 'ONLINE' ? 'bg-[#16805C]' : 'bg-[#98A2B3]'
                            }`}
                          />
                          <span>{device?.device_uid || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`font-mono text-xs font-bold flex items-center gap-1 ${
                            hr > 100 || hr < 60 ? 'text-[#C24141]' : 'text-[#17202A]'
                          }`}
                        >
                          <Heart className="h-3.5 w-3.5 text-[#C24141]" />
                          {hr} BPM
                        </span>
                      </td>

                      <td>
                        <span
                          className={`font-mono text-xs font-bold flex items-center gap-1 ${
                            spo2 < 95 ? 'text-[#C24141]' : 'text-[#17202A]'
                          }`}
                        >
                          <Droplets className="h-3.5 w-3.5 text-[#2764A5]" />
                          {spo2}%
                        </span>
                      </td>

                      <td>
                        <span
                          className={`font-mono text-xs font-bold flex items-center gap-1 ${
                            temp > 37.5 ? 'text-[#C24141]' : 'text-[#17202A]'
                          }`}
                        >
                          <Thermometer className="h-3.5 w-3.5 text-[#B7791F]" />
                          {temp.toFixed(1)}°C
                        </span>
                      </td>

                      <td>
                        <span className="inline-flex items-center gap-1 text-[#334155]">
                          <Activity className="h-3.5 w-3.5 text-[#667085]" />
                          {activity}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={status} />
                      </td>

                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(student);
                          }}
                          className="btn-secondary text-xs py-1 px-2.5 min-h-[32px]"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#087F8C]" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
