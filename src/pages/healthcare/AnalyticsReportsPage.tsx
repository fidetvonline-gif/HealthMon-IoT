import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  Users,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AnalyticsReportsPage: React.FC = () => {
  const { readings, alerts } = useHealthData();
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
    { name: 'Normal', value: readings.filter((r) => r.status === 'Normal').length, color: '#10b981' },
    { name: 'Warning', value: readings.filter((r) => r.status === 'Warning').length, color: '#f59e0b' },
    { name: 'Abnormal', value: readings.filter((r) => r.status === 'Abnormal').length, color: '#f43f5e' },
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

  // Export CSV function matching Section 43 format
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
    link.setAttribute('download', `HealthMon_Telemetry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Health Analytics & Reporting (Feature 8 & 43)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Statistical aggregation across student cohorts, sensor distributions and CSV dataset exports
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Aggregate Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Cohort Physiological Health Status</h3>
            <p className="text-xs text-slate-500 mb-4">Percentage of readings classified by Threshold Engine</p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            {statusCounts.map((s) => (
              <div key={s.name} className="p-2 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-500 block">{s.name}</span>
                <span className="font-bold text-sm" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Motion Histogram */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">MPU6050 Activity Classification Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Sample volume grouped by detected physical motion state</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="activity" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Sample Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Export Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700">
            Filtered Telemetry Records ({filteredReadings.length} results)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Student Filter */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Monitored Students</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.student_id})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Abnormal">Abnormal</option>
            </select>

            {/* Activity Filter */}
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Activities</option>
              <option value="Sitting">Sitting</option>
              <option value="Standing">Standing</option>
              <option value="Walking">Walking</option>
              <option value="Running">Running</option>
              <option value="Possible Fall">Possible Fall</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">SpO₂</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReadings.slice(0, 15).map((r) => {
                const student = students.find((s) => s.id === r.student_id);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{student?.full_name || 'Student'}</span>
                      <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                        ({student?.student_id || r.student_id})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{r.heart_rate} BPM</td>
                    <td className="py-3 px-4 font-mono font-bold">{r.spo2}%</td>
                    <td className="py-3 px-4 font-mono font-bold">{r.temperature.toFixed(1)}°C</td>
                    <td className="py-3 px-4">{r.activity}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(r.recorded_at).toLocaleTimeString()}
                    </td>
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
