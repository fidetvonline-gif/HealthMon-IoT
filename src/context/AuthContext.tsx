import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../lib/initialData';
import { supabase, isSupabaseConfigured, dispatchRealtimeEvent } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAs: (userId: string) => void;
  loginWithEmail: (email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: {
    full_name: string;
    email: string;
    password?: string;
    student_id: string;
    faculty: string;
    department: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  logout: () => void;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'healthmon_users';
const CURRENT_USER_ID_KEY = 'healthmon_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed: UserProfile[] = JSON.parse(cached);
        return parsed.map((u) => {
          if (u.id === 'usr-student-001' || u.full_name === 'John Doe') {
            return {
              ...u,
              full_name: 'Alma Brown',
              email: 'alma.brown@student.uni.edu',
              emergency_contact_name: 'Eleanor Brown (Mother)',
            };
          }
          if (u.id === 'usr-admin-001' || u.role === 'ADMIN' || u.full_name.includes('Marcus Vance') || u.full_name.includes('Alma Brown')) {
            return {
              ...u,
              full_name: 'Grace Mfon',
              email: 'grace.mfon@admin.uni.edu',
              student_id: '21/sc/co/1117',
            };
          }
          return u;
        });
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const activeId = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (activeId) {
        const found = users.find((u) => u.id === activeId);
        if (found) {
          if (found.id === 'usr-student-001' || found.full_name === 'John Doe') {
            return {
              ...found,
              full_name: 'Alma Brown',
              email: 'alma.brown@student.uni.edu',
              emergency_contact_name: 'Eleanor Brown (Mother)',
            };
          }
          if (found.id === 'usr-admin-001' || found.role === 'ADMIN' || found.full_name.includes('Marcus Vance') || found.full_name.includes('Alma Brown')) {
            return {
              ...found,
              full_name: 'Grace Mfon',
              email: 'grace.mfon@admin.uni.edu',
              student_id: '21/sc/co/1117',
            };
          }
          return found;
        }
      }
      return users[0] || null; // default to student Alma Brown
    } catch {
      return users[0] || null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_ID_KEY, currentUser.id);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
  }, [currentUser]);

  const loginAs = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      dispatchRealtimeEvent('USER_LOGIN', { user: target });
    }
  };

  const loginWithEmail = async (email: string, requestedRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // If Supabase is active, we can authenticate
      if (isSupabaseConfigured && supabase) {
        // Real Supabase Auth attempt
      }
      // Check in local users database
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
        setIsLoading(false);
        return { success: true };
      }

      // Create new user if not found for seamless testing
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        full_name: email.split('@')[0].replace('.', ' '),
        email,
        phone: '+234 800 000 0000',
        role: requestedRole,
        student_id: requestedRole === 'STUDENT' ? `UY/UG/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}` : undefined,
        faculty: requestedRole === 'STUDENT' ? 'Computing Science' : undefined,
        department: requestedRole === 'STUDENT' ? 'Computer Science' : 'University Services',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const registerStudent = async (data: {
    full_name: string;
    email: string;
    student_id: string;
    faculty: string;
    department: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Check duplicate student_id or email
      const existing = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase() || (u.student_id && u.student_id.toLowerCase() === data.student_id.toLowerCase())
      );
      if (existing) {
        setIsLoading(false);
        return { success: false, error: 'A student account with this email or Student ID already exists.' };
      }

      const newStudent: UserProfile = {
        id: `usr-student-${Date.now()}`,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: 'STUDENT',
        student_id: data.student_id,
        faculty: data.faculty,
        department: data.department,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUsers((prev) => [newStudent, ...prev]);
      setCurrentUser(newStudent);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const refreshed = { ...currentUser, ...updated, updated_at: new Date().toISOString() };
    setCurrentUser(refreshed);
    setUsers((prev) => prev.map((u) => (u.id === refreshed.id ? refreshed : u)));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser?.role || null,
        isLoading,
        loginAs,
        loginWithEmail,
        registerStudent,
        updateProfile,
        logout,
        availableUsers: users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
