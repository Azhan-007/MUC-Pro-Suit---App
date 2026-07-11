"use client";

import React from 'react';
import { useERPStore } from '@/store';

// Import all views
import DashboardView from '@/features/DashboardView';
import StudentView from '@/features/StudentView';
import FacultyView from '@/features/FacultyView';
import DepartmentsView from '@/features/DepartmentsView';
import CoursesView from '@/features/CoursesView';
import AttendanceView from '@/features/AttendanceView';
import TimetableView from '@/features/TimetableView';
import ExamsView from '@/features/ExamsView';
import ResultsView from '@/features/ResultsView';
import FeesView from '@/features/FeesView';
import LibraryView from '@/features/LibraryView';
import PlacementsView from '@/features/PlacementsView';
import CertificatesView from '@/features/CertificatesView';
import AnnouncementsView from '@/features/AnnouncementsView';
import ReportsView from '@/features/ReportsView';
import SettingsView from '@/features/SettingsView';

export default function AdminPage() {
  const activeTab = useERPStore((state) => state.activeTab);
  const activeRole = useERPStore((state) => state.activeRole);

  // Restrict views on tab loading based on roles
  const getRenderedTab = () => {
    if (activeRole === 'ADMIN' && ['fees', 'reports'].includes(activeTab)) {
      return 'dashboard';
    }
    return activeTab;
  };

  const tab = getRenderedTab();

  switch (tab) {
    case 'dashboard':
      return <DashboardView />;
    case 'students':
      return <StudentView />;
    case 'faculty':
      return <FacultyView />;
    case 'departments':
      return <DepartmentsView />;
    case 'courses':
      return <CoursesView />;
    case 'attendance':
      return <AttendanceView />;
    case 'timetable':
      return <TimetableView />;
    case 'exams':
      return <ExamsView />;
    case 'results':
      return <ResultsView />;
    case 'fees':
      return <FeesView />;
    case 'library':
      return <LibraryView />;
    case 'placements':
      return <PlacementsView />;
    case 'certificates':
      return <CertificatesView />;
    case 'announcements':
      return <AnnouncementsView />;
    case 'reports':
      return <ReportsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
}
