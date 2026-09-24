import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Activity,
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
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';

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

  // Prepare chart data
  const chartData = [...studentReadings]
    .reverse()
    .slice(-30)
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <History className="h-5 w-5 text-[#474A2C]" />
            <span>Health History & Analytics</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Telemetry logs and physiological trends
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Health Analytics Chart */}
      <div className="card-panel p-5 rounded-[8px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">Telemetry Trend Plot</h3>
            <p className="text-xs text-[#667085]">Continuous PPG, SpO₂ and Temperature Signals</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 rounded-[6px] bg-[#F1F3F5] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedMetric === 'all' ? 'bg-white text-[#17202A] font-bold shadow-xs' : 'text-[#667085]'
              }`}
            >
              All Signals
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('hr')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedMetric === 'hr' ? 'bg-white text-[#C24141] font-bold shadow-xs' : 'text-[#667085]'
              }`}
            >
              Heart Rate
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('spo2')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedMetric === 'spo2' ? 'bg-white text-[#2764A5] font-bold shadow-xs' : 'text-[#667085]'
              }`}
            >
              SpO₂
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('temp')}
              className={`px-3 py-1 rounded-[4px] transition-all ${
                selectedMetric === 'temp' ? 'bg-white text-[#B7791F] font-bold shadow-xs' : 'text-[#667085]'
              }`}
            >
              Temperature
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-[#98A2B3]">
              No reading telemetry available for plotting.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#667085' }} stroke="#D0D5DD" />
                <YAxis
                  yAxisId="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 10, fill: '#667085' }}
                  stroke="#D0D5DD"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1726',
                    borderRadius: '6px',
                    border: '1px solid #12263A',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {(selectedMetric === 'all' || selectedMetric === 'hr') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heart_rate"
                    name="Heart Rate (BPM)"
                    stroke="#C24141"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#C24141' }}
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'spo2') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="spo2"
                    name="SpO₂ (%)"
                    stroke="#2764A5"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#2764A5' }}
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Body Temp (°C)"
                    stroke="#B7791F"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#B7791F' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Health Readings Table */}
      <div className="card-panel rounded-[8px] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#E2E6EB] bg-[#F1F3F5]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17202A] uppercase tracking-wider">Health Records</span>
            <span className="rounded-[4px] bg-[#E2E6EB] px-2 py-0.5 text-[10px] font-semibold text-[#334155]">
              {filteredReadings.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Search activity or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-8 py-1.5 text-xs max-w-[200px]"
              />
            </div>

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

        {/* Enterprise Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Heart Rate</th>
                <th>SpO₂</th>
                <th>Temperature</th>
                <th>Activity</th>
                <th>Battery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#98A2B3]">
                    No readings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r) => {
                  const dateObj = new Date(r.recorded_at);
                  const dateStr = dateObj.toLocaleDateString();
                  const timeStr = dateObj.toLocaleTimeString();

                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-[#667085]">
                        <div>{timeStr}</div>
                        <div className="text-[10px] text-[#98A2B3]">{dateStr}</div>
                      </td>
                      <td>
                        <span className={`font-mono font-bold ${r.heart_rate > 100 || r.heart_rate < 60 ? 'text-[#C24141]' : 'text-[#17202A]'}`}>
                          {r.heart_rate} BPM
                        </span>
                      </td>
                      <td>
                        <span className={`font-mono font-bold ${r.spo2 < 95 ? 'text-[#C24141]' : 'text-[#17202A]'}`}>
                          {r.spo2}%
                        </span>
                      </td>
                      <td>
                        <span className={`font-mono font-bold ${r.temperature > 37.5 ? 'text-[#C24141]' : 'text-[#17202A]'}`}>
                          {r.temperature.toFixed(1)}°C
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-[#334155]">
                          <Activity className="h-3.5 w-3.5 text-[#667085]" />
                          <span>{r.activity}</span>
                        </span>
                      </td>
                      <td className="font-mono text-[#667085]">{r.battery_level ?? 82}%</td>
                      <td>
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
