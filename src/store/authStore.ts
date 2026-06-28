import { create } from 'zustand';
import { StudentProfile, FacultyProfile } from '../types';
import { mockFacultyProfile } from '../data/mockFacultyData';

interface AuthState {
  isLoggedIn: boolean;
  role: 'STUDENT' | 'FACULTY' | null;
  student: StudentProfile | null;
  faculty: FacultyProfile | null;
  loginError: string | null;
  login: (id: string, password: string, student: StudentProfile) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  student: null,
  faculty: null,
  loginError: null,

  login: (id, password, student) => {
    // Student credentials
    if (id === 'MUC710' && password === 'password123') {
      set({ isLoggedIn: true, role: 'STUDENT', student, faculty: null, loginError: null });
    }
    // Faculty credentials
    else if (id === 'FAC001' && password === 'faculty123') {
      set({ isLoggedIn: true, role: 'FACULTY', faculty: mockFacultyProfile, student: null, loginError: null });
    }
    else {
      set({ loginError: 'Invalid ID or Password. Please try again.' });
    }
  },

  logout: () => set({ isLoggedIn: false, role: null, student: null, faculty: null, loginError: null }),

  clearError: () => set({ loginError: null }),
}));
