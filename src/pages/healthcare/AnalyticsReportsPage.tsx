import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AnalyticsReportsPage: React.FC = () => {
  const { readings } = useHealthData();
  const { availableUsers } = useAuth();

  const students = availableUsers.filter((u) => u.role === 'STUDENT');

  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedActivity, setSelectedActivity] = useState<string>('ALL');

  // Filtered dataset
  const filteredReadings = readings.filter((r) => {
    if (selectedStudentId !== 'ALL' && r.student_id !== selectedStudentId) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (selectedActivity !== 'ALL' && r.activity !== selectedActivity) return false;
    return true;
  });

  // Calculate status counts for Pie Chart
  const statusCounts = [
    { name: 'Normal', value: readings.filter((r) => r.status === 'Normal').length, color: '#16805C' },
    { name: 'Warning', value: readings.filter((r) => r.status === 'Warning').length, color: '#B7791F' },
    { name: 'Abnormal', value: readings.filter((r) => r.status === 'Abnormal').length, color: '#C24141' },
  ];

  // Activity breakdown for Bar Chart
  const activityMap: Record<string, number> = {};
  readings.forEach((r) => {
    activityMap[r.activity] = (activityMap[r.activity] || 0) + 1;
  });
  const activityData = Object.keys(activityMap).map((k) => ({
    activity: k,
    count: activityMap[k],
  }));

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredReadings.length === 0) return;
    const headers = ['student_id', 'heart_rate', 'spo2', 'temperature', 'activity', 'status', 'time'];
    const rows = filteredReadings.map((r) => {
      const studentObj = students.find((s) => s.id === r.student_id);
      const studentMatric = studentObj?.student_id || studentObj?.full_name || r.student_id;
      const timeStr = new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return [
        studentMatric,
        r.heart_rate,
        r.spo2,
        r.temperature.toFixed(1),
        r.activity.toLowerCase(),
        r.status.toLowerCase(),
        timeStr,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VitaTrack_Telemetry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#474A2C]" />
            <span>Health Analytics & CSV Exports</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Cohort statistics, parameter breakdown, and dataset exports
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-primary text-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-5 card-panel p-5 rounded-[8px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-1">Cohort Health Distribution</h3>
            <p className="text-xs text-[#667085] mb-4">Percentage of readings classified by Threshold Engine</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B1726', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E2E6EB] text-center text-xs">
            {statusCounts.map((s) => (
              <div key={s.name} className="p-2 rounded-[4px] bg-[#F1F3F5]">
                <span className="text-[10px] text-[#667085] block uppercase font-bold">{s.name}</span>
                <span className="font-bold font-mono text-sm" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Breakdown Bar Chart */}
        <div className="lg:col-span-7 card-panel p-5 rounded-[8px]">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-1">Activity Classification Distribution</h3>
          <p className="text-xs text-[#667085] mb-4">MPU6050 classifier event occurrences</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" />
                <XAxis dataKey="activity" tick={{ fontSize: 10, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1726', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Readings" fill="#474A2C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtered Dataset Table */}
      <div className="card-panel rounded-[8px] overflow-hidden">
        <div className="p-4 border-b border-[#E2E6EB] bg-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">Cohort Telemetry Log</h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="form-select text-xs w-auto"
            >
              <option value="ALL">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select text-xs w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Abnormal">Abnormal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Heart Rate</th>
                <th>SpO₂</th>
                <th>Temp</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Recorded Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.slice(0, 50).map((r) => {
                const st = students.find((s) => s.id === r.student_id);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="font-bold text-[#17202A] text-xs">{st?.full_name || 'Student'}</div>
                      <div className="text-[10px] text-[#667085] font-mono">{st?.student_id || r.student_id}</div>
                    </td>
                    <td className="font-mono font-bold text-[#17202A]">{r.heart_rate} BPM</td>
                    <td className="font-mono font-bold text-[#17202A]">{r.spo2}%</td>
                    <td className="font-mono font-bold text-[#17202A]">{r.temperature.toFixed(1)}°C</td>
                    <td className="text-[#334155]">{r.activity}</td>
                    <td>
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="font-mono text-[#667085] text-[11px]">{new Date(r.recorded_at).toLocaleTimeString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
