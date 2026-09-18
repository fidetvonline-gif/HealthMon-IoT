import React, { useState } from 'react';
import { Users, UserPlus, Search, Shield, GraduationCap, Stethoscope, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { UserProfile, UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { availableUsers, updateProfile } = useAuth();
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
    // Simulate user creation
    setIsAddingUser(false);
    setNewName('');
    setNewEmail('');
    setNewStudentId('');
    setNewDept('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>User & Access Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Feature 9 — Manage student accounts, healthcare clinicians and administrative roles
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingUser(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or student matric ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
        >
          <option value="ALL">All Roles ({availableUsers.length})</option>
          <option value="STUDENT">Students Only</option>
          <option value="HEALTHCARE">Healthcare Personnel Only</option>
          <option value="ADMIN">System Admins Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Student ID / Dept</th>
                <th className="py-3 px-4">Assigned Wearable</th>
                <th className="py-3 px-4">Emergency Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((u) => {
                const assignedDevice = devices.find((d) => d.student_id === u.id);

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === 'STUDENT' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                          <GraduationCap className="w-3 h-3" /> Student
                        </span>
                      )}
                      {u.role === 'HEALTHCARE' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <Stethoscope className="w-3 h-3" /> Healthcare Staff
                        </span>
                      )}
                      {u.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.student_id ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900">{u.student_id}</span>
                          <div className="text-[11px] text-slate-500">{u.department || 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Clinical / Staff</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {assignedDevice ? (
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {assignedDevice.device_uid}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None Assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.emergency_contact_name ? (
                        <div>
                          <div className="font-semibold text-slate-800">{u.emergency_contact_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.emergency_contact_phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Enroll New HealthMon User</h3>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Michael Okon"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. michael.okon@uni.edu.ng"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">User Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value="STUDENT">Student (Health Subject)</option>
                  <option value="HEALTHCARE">Healthcare Personnel (Nurse / Doctor)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {newRole === 'STUDENT' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Student Matric ID</label>
                    <input
                      type="text"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      placeholder="e.g. UY/ENG/2026/044"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      placeholder="e.g. Electrical & Electronics Engineering"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Enroll User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
