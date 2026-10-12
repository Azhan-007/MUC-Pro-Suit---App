import { create } from 'zustand';
import { StudentProfile, FacultyProfile } from '../types';
import { apiClient } from '../lib/apiClient';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: 'STUDENT' | 'FACULTY' | null;
  student: StudentProfile | null;
  faculty: FacultyProfile | null;
  loginError: string | null;
  login: (id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: true,
  role: null,
  student: null,
  faculty: null,
  loginError: null,

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        // Timeout after 3.5s so startup never hangs if backend is slow/unreachable
        await Promise.race([
          get().fetchProfile(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session restore timeout')), 3500)
          ),
        ]);
      }
    } catch {
      // No valid session or timeout, stay logged out
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (id, password) => {
    try {
      set({ loginError: null });
      const res = await apiClient.post('/auth/login', {
        identifier: id,
        password,
        clientType: 'MOBILE'
      });
      
      const { accessToken, refreshToken } = res.data;
      if (accessToken && refreshToken) {
        await SecureStore.setItemAsync('access_token', accessToken);
        await SecureStore.setItemAsync('refresh_token', refreshToken);
        await get().fetchProfile();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      // Backend returns { code, message } — extract the message properly
      const serverMessage = error.response?.data?.message;
      const fallback = error.message === 'Network Error'
        ? 'Cannot reach server. Check your connection.'
        : 'Invalid ID or Password. Please try again.';
      set({ loginError: serverMessage || fallback });
    }
  },

  fetchProfile: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const user = res.data.user;
      const roles = user.roleAssignments?.map((ra: any) => ra.role.code) || [];
      
      if (roles.includes('STUDENT') && user.student) {
        const student = user.student;
        const enrollment = student.enrollments?.[0];
        
        // Map to mobile UI format
        const profile: StudentProfile = {
          id: student.id,
          name: student.firstName + ' ' + student.lastName,
          registerNumber: student.registrationNumber,
          department: enrollment?.program?.department?.name || 'Department',
          semester: 'Semester ' + (enrollment?.semesterNumber || 1),
          section: 'A', // Assuming a default or fetch if available
          email: student.email,
          dob: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
          bloodGroup: student.bloodGroup || ''
        };
        set({ isLoggedIn: true, isLoading: false, role: 'STUDENT', student: profile, faculty: null });
      } else if (roles.includes('FACULTY') && user.faculty) {
        const faculty = user.faculty;
        const profile: FacultyProfile = {
          id: faculty.id,
          name: faculty.firstName + ' ' + faculty.lastName,
          employeeId: faculty.employeeId,
          department: faculty.department?.name || 'Department',
          designation: faculty.designation,
          email: faculty.email
        };
        set({ isLoggedIn: true, isLoading: false, role: 'FACULTY', faculty: profile, student: null });
      } else {
        // Fallback for admins testing mobile
        set({ isLoggedIn: true, isLoading: false, role: 'FACULTY', faculty: { id: 'admin', name: 'Admin', employeeId: 'ADMIN', department: 'Admin', designation: 'Admin', email: user.email }, student: null });
      }
    } catch (error) {
      await get().logout();
    }
  },

  logout: async () => {
    // Attempt backend logout without blocking local cleanup
    apiClient.post('/auth/logout').catch(() => {});
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ isLoggedIn: false, isLoading: false, role: null, student: null, faculty: null, loginError: null });
  },

  clearError: () => set({ loginError: null }),
}));
