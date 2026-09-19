import React, { useState } from 'react';
import {
  History,
  Download,
  Filter,
  Search,
  Calendar,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HealthStatus } from '../../types';

export const StudentHistory: React.FC = () => {
  const { user } = useAuth();
  const { readings } = useHealthData();

  const studentId = user?.id || 'usr-student-001';
  const studentReadings = readings.filter((r) => r.student_id === studentId);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'hr' | 'spo2' | 'temp'>('all');

  // Filtered readings
  const filteredReadings = studentReadings.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.activity.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.heart_rate.toString().includes(q)
      );
    }
    return true;
  });

  // Prepare chart data (chronological order)
  const chartData = [...studentReadings]
    .reverse()
    .slice(-30) // last 30 data points
    .map((r, idx) => {
      const time = new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        index: idx,
        time,
        heart_rate: r.heart_rate,
        spo2: r.spo2,
        temperature: r.temperature,
        activity: r.activity,
        status: r.status,
      };
    });

  // Export CSV
  const handleExportCSV = () => {
    if (filteredReadings.length === 0) return;
    const headers = ['ID', 'Student ID', 'Device UID', 'Heart Rate (BPM)', 'SpO2 (%)', 'Temperature (C)', 'Activity', 'Status', 'Timestamp'];
    const rows = filteredReadings.map((r) => [
      r.id,
      user?.student_id || user?.id,
      r.device_id,
      r.heart_rate,
      r.spo2,
      r.temperature,
      r.activity,
      r.status,
      r.recorded_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VitaTrack_${user?.student_id || 'Student'}_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            <span>Health History & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Features 7 & 8 — Sensor Telemetry Logs & Physiological Trend Visualization
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Feature 8: Health Analytics Charts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physiological Parameter Trend Visualizer</h3>
            <p className="text-xs text-slate-500">Continuous telemetry plot from MAX30102 and MLX90614 sensors</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Signals
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('hr')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'hr' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heart Rate (BPM)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('spo2')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'spo2' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SpO₂ (%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('temp')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'temp' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp (°C)
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No reading telemetry available for plotting.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis
                  yAxisId="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {(selectedMetric === 'all' || selectedMetric === 'hr') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heart_rate"
                    name="Heart Rate (BPM)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f43f5e' }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'spo2') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="spo2"
                    name="SpO2 (%)"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Body Temp (°C)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Feature 7: Historical Health Readings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Health Records Table</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {filteredReadings.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search activity or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Abnormal">Abnormal</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">SpO₂</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No readings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r) => {
                  const dateObj = new Date(r.recorded_at);
                  const dateStr = dateObj.toLocaleDateString();
                  const timeStr = dateObj.toLocaleTimeString();

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        <div>{timeStr}</div>
                        <div className="text-[10px] text-slate-400">{dateStr}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${r.heart_rate > 100 || r.heart_rate < 60 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {r.heart_rate} BPM
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${r.spo2 < 95 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {r.spo2}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${r.temperature > 37.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {r.temperature.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-slate-400" />
                          <span>{r.activity}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.battery_level ?? 82}%</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
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
