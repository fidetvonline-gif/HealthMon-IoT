import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Wifi,
  Battery,
  UserCheck,
  CheckCircle,
  Clock,
  Radio,
  Search,
  X,
  UserX,
  Sliders,
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { IoTDevice } from '../../types';

interface AdminDevicesPageProps {
  onOpenSimulator: () => void;
}

export const AdminDevicesPage: React.FC<AdminDevicesPageProps> = ({ onOpenSimulator }) => {
  const { devices, assignDevice, registerDevice } = useHealthData();
  const { availableUsers } = useAuth();

  const students = availableUsers.filter((u) => u.role === 'STUDENT');

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDeviceForAssign, setSelectedDeviceForAssign] = useState<IoTDevice | null>(null);
  const [selectedStudentToAssign, setSelectedStudentToAssign] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);

  // New device form state
  const [newUid, setNewUid] = useState('HM-ESP32-005');
  const [newName, setNewName] = useState('ESP32 Wrist Unit #5');

  const filteredDevices = devices.filter((d) => {
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        d.device_uid.toLowerCase().includes(q) ||
        (d.student_name && d.student_name.toLowerCase().includes(q)) ||
        (d.mac_address && d.mac_address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForAssign || !selectedStudentToAssign) return;

    const studentObj = students.find((s) => s.id === selectedStudentToAssign);
    if (studentObj) {
      assignDevice(selectedDeviceForAssign.id, studentObj.id, studentObj.full_name);
    }
    setSelectedDeviceForAssign(null);
    setSelectedStudentToAssign('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerDevice({
      device_uid: newUid,
      device_name: newName,
      firmware_version: 'v1.2.4-esp32s3',
    });
    setIsRegistering(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-600" />
            <span>ESP32 Hardware Fleet Registry</span>
          </h2>
          <p className="text-xs text-slate-500">
            Feature 12 — Microcontroller node registration, MAC binding & student assignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Hardware Test Bench</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register New ESP32</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Device UID (e.g. HM-ESP32-001) or student..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-xs">
                    IoT
                  </div>
                  <div>
                    <h3 className="font-mono font-extrabold text-slate-900 text-sm">{dev.device_uid}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{dev.mac_address || '24:6F:28:C2:55:01'}</span>
                  </div>
                </div>
                <StatusBadge status={dev.status} pulse />
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Assigned Student:</span>
                  {dev.student_name ? (
                    <span className="font-bold text-slate-900">{dev.student_name}</span>
                  ) : (
                    <span className="text-amber-600 font-semibold italic">Unassigned (In Pool)</span>
                  )}
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className={`font-mono font-bold ${dev.battery_level <= 20 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {dev.battery_level}% LiPo
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Wi-Fi Connection:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {dev.wifi_status ? 'Active (-58 dBm)' : 'Offline'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Firmware:</span>
                  <span className="font-mono text-slate-600">{dev.firmware_version}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {dev.student_id ? (
                <button
                  type="button"
                  onClick={() => assignDevice(dev.id, null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Unassign</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeviceForAssign(dev);
                    setSelectedStudentToAssign(students[0]?.id || '');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign to Student</span>
                </button>
              )}

              <span className="text-[10px] text-slate-400 font-mono">
                Ping: {new Date(dev.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Assign Device to Student */}
      {selectedDeviceForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Assign {selectedDeviceForAssign.device_uid} to Student
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDeviceForAssign(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Student</label>
                <select
                  value={selectedStudentToAssign}
                  onChange={(e) => setSelectedStudentToAssign(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.student_id || 'ID N/A'}) - {st.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Binding Policy:</div>
                <p>
                  Telemetry packets received with UID <code>{selectedDeviceForAssign.device_uid}</code> will be
                  automatically mapped and analyzed under the selected student profile.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDeviceForAssign(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Confirm Binding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New ESP32 */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Provision New ESP32 Microcontroller Node</h3>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Device UID</label>
                <input
                  type="text"
                  required
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Device Label / Description</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Firmware Auto-Enrollment:</div>
                <p>Defaulting to firmware v1.2.4-esp32s3 with MAX30102, MLX90614 and MPU6050 drivers enabled.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
