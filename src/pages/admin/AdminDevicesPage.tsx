import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Wifi,
  Battery,
  Search,
  X,
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
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#087F8C]" />
            <span>ESP32 Hardware Fleet Registry</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Microcontroller registration, MAC binding & student assignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="btn-secondary text-xs"
          >
            <Sliders className="h-3.5 w-3.5 text-[#087F8C]" />
            <span>Hardware Test Bench</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className="btn-primary text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register New ESP32</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-panel p-4 rounded-[8px]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by Device UID or student..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="card-panel p-4 rounded-[8px] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0B1726] text-white font-mono font-bold text-xs">
                    MCU
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-[#17202A] text-xs">{dev.device_uid}</h3>
                    <span className="text-[10px] text-[#667085] font-mono">{dev.mac_address || '24:6F:28:C2:55:01'}</span>
                  </div>
                </div>
                <StatusBadge status={dev.status} pulse />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#667085]">Assigned Student:</span>
                  {dev.student_name ? (
                    <span className="font-bold text-[#17202A]">{dev.student_name}</span>
                  ) : (
                    <span className="text-[#B7791F] font-semibold italic">Unassigned Pool</span>
                  )}
                </div>

                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#667085]">Battery Level:</span>
                  <span className={`font-mono font-bold ${dev.battery_level <= 20 ? 'text-[#C24141]' : 'text-[#17202A]'}`}>
                    <Battery className="inline h-3.5 w-3.5 mr-1 text-[#087F8C]" />
                    {dev.battery_level}% LiPo
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#667085]">Wi-Fi Signal:</span>
                  <span className="font-mono text-[#16805C] font-semibold">
                    <Wifi className="inline h-3.5 w-3.5 mr-1" />
                    {dev.wifi_status ? 'Active (-58 dBm)' : 'Offline'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#667085]">Firmware:</span>
                  <span className="font-mono text-[#334155]">{dev.firmware_version}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E6EB]">
              <button
                type="button"
                onClick={() => setSelectedDeviceForAssign(dev)}
                className="btn-secondary w-full justify-center text-xs"
              >
                <span>Reassign Student Node</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Assigning Device */}
      {selectedDeviceForAssign && (
        <div className="fixed inset-0 z-50 bg-[#0B1726]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-panel bg-white rounded-[8px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <h3 className="text-sm font-bold text-[#17202A]">Assign Wearable {selectedDeviceForAssign.device_uid}</h3>
              <button
                type="button"
                onClick={() => setSelectedDeviceForAssign(null)}
                className="text-[#667085] hover:text-[#17202A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Select Student</label>
                <select
                  required
                  value={selectedStudentToAssign}
                  onChange={(e) => setSelectedStudentToAssign(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.student_id || st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeviceForAssign(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Confirm Binding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Registering Device */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 bg-[#0B1726]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-panel bg-white rounded-[8px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <h3 className="text-sm font-bold text-[#17202A]">Register New ESP32 Unit</h3>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-[#667085] hover:text-[#17202A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Device UID</label>
                <input
                  type="text"
                  required
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Device Display Label</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Save Hardware Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
