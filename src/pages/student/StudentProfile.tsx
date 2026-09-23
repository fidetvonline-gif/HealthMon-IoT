import React, { useState } from 'react';
import { User, Shield, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact_phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      phone,
      student_id: studentId,
      faculty,
      department,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-[#E2E6EB] pb-4">
        <h2 className="text-xl font-bold text-[#17202A] flex items-center gap-2">
          <User className="h-5 w-5 text-[#087F8C]" />
          <span>Student Health Profile</span>
        </h2>
        <p className="text-xs text-[#667085]">
          Personal identity, university matriculation and emergency contact details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-panel p-5 rounded-[8px] space-y-4">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider border-b border-[#E2E6EB] pb-2">Academic & Personal Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-input bg-[#F1F3F5] text-[#667085] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Student / Matriculation ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="form-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Faculty</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card-panel p-5 rounded-[8px] space-y-4">
          <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider border-b border-[#E2E6EB] pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C24141]" />
            <span>Emergency Clinic Contact Details</span>
          </h3>
          <p className="text-xs text-[#667085]">
            Designated emergency contact notified in the event of high severity abnormal condition alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Next of Kin / Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Sarah Doe (Mother)"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17202A] mb-1">Emergency Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +234 803 987 6543"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#16805C] bg-[#16805C]/10 px-3 py-2 rounded-[6px] border border-[#16805C]/20">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="btn-primary text-xs"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
