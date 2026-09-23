import React, { useState } from 'react';
import { Users, UserPlus, Search, Shield, GraduationCap, Stethoscope, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { availableUsers } = useAuth();
  const { devices } = useHealthData();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('STUDENT');
  const [newStudentId, setNewStudentId] = useState('');
  const [newDept, setNewDept] = useState('');

  const filteredUsers = availableUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.student_id && u.student_id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(false);
    setNewName('');
    setNewEmail('');
    setNewStudentId('');
    setNewDept('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6EB] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#087F8C]" />
            <span>User & Access Management</span>
          </h2>
          <p className="text-xs text-[#667085]">
            Manage student accounts, healthcare clinicians, and administration roles
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingUser(true)}
          className="btn-primary text-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Controls */}
      <div className="card-panel p-4 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by name, email or student ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-select text-xs w-auto"
        >
          <option value="ALL">All Roles ({availableUsers.length})</option>
          <option value="STUDENT">Students Only</option>
          <option value="HEALTHCARE">Healthcare Staff Only</option>
          <option value="ADMIN">Admins Only</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="card-panel rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Student ID / Dept</th>
                <th>Assigned Wearable</th>
                <th>Emergency Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const assignedDevice = devices.find((d) => d.student_id === u.id);

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="font-bold text-[#17202A] text-xs">{u.full_name}</div>
                      <div className="text-[11px] text-[#667085]">{u.email}</div>
                    </td>

                    <td>
                      {u.role === 'STUDENT' && (
                        <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#087F8C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#087F8C] border border-[#087F8C]/20">
                          <GraduationCap className="w-3 h-3" /> Student
                        </span>
                      )}
                      {u.role === 'HEALTHCARE' && (
                        <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#16805C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#16805C] border border-[#16805C]/20">
                          <Stethoscope className="w-3 h-3" /> Healthcare
                        </span>
                      )}
                      {u.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#0B1726]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0B1726] border border-[#0B1726]/20">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>

                    <td>
                      {u.student_id ? (
                        <div>
                          <span className="font-mono font-bold text-[#17202A] text-xs">{u.student_id}</span>
                          <div className="text-[11px] text-[#667085]">{u.department || 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-[#98A2B3] text-xs">Staff Account</span>
                      )}
                    </td>

                    <td>
                      {assignedDevice ? (
                        <span className="font-mono text-xs font-bold text-[#087F8C]">
                          {assignedDevice.device_uid}
                        </span>
                      ) : (
                        <span className="text-[#98A2B3] text-xs">None Assigned</span>
                      )}
                    </td>

                    <td>
                      {u.emergency_contact_name ? (
                        <div>
                          <div className="font-semibold text-[#17202A] text-xs">{u.emergency_contact_name}</div>
                          <div className="text-[11px] font-mono text-[#667085]">{u.emergency_contact_phone}</div>
                        </div>
                      ) : (
                        <span className="text-[#98A2B3] text-xs">Not Provided</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding user */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 bg-[#0B1726]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-panel bg-white rounded-[8px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <h3 className="text-sm font-bold text-[#17202A]">Register New Account</h3>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-[#667085] hover:text-[#17202A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17202A] mb-1">Account Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="form-select"
                >
                  <option value="STUDENT">Student</option>
                  <option value="HEALTHCARE">Healthcare Professional</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              {newRole === 'STUDENT' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#17202A] mb-1">Student / Matric ID</label>
                    <input
                      type="text"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="form-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#17202A] mb-1">Department</label>
                    <input
                      type="text"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
