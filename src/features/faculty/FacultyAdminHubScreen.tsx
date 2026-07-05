import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, FileText, Briefcase, Book, Plus, X, ArrowRight, RotateCw, Pencil, Trash2, Check, ChevronDown, Filter } from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, CustomButton, StatusChip, useCampusAlert } from '../../components';
import {
  mockLeaveApplications as initialLeaves,
  mockPlacementDrives,
  mockBorrowedBooks,
  mockLeaveAllocations,
  mockAllBooks,
  mockReadingHistory,
  mockLibraryStats,
  mockPlacementStudents,
  mockFacultyEvents,
} from '../../data/mockFacultyData';
import { LeaveAllocation, LeaveApplication, LibraryBook, BorrowedBook, ReadingHistoryEntry, LibraryStats, PlacementDrive, PlacementStudent, PlacementStats, CollegeEvent } from '../../types';

const ModalKeyboardAvoidingView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ width: '100%' }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <>{children}</>;
};

type ActiveTab = 'LEAVE' | 'EVENTS' | 'PLACEMENTS' | 'LIBRARY';

export const FacultyAdminHubScreen: React.FC = () => {
  const router = useRouter();
  const { showAlert } = useCampusAlert();
  const params = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('LEAVE');

  React.useEffect(() => {
    if (params.tab && ['LEAVE', 'EVENTS', 'PLACEMENTS', 'LIBRARY'].includes(params.tab)) {
      setActiveTab(params.tab as ActiveTab);
    }
  }, [params.tab]);

  // Leaves State
  const [leaves, setLeaves] = React.useState<LeaveApplication[]>(initialLeaves as LeaveApplication[]);
  const [allocations, setAllocations] = React.useState<LeaveAllocation[]>(mockLeaveAllocations);
  const [selectedAllocId, setSelectedAllocId] = React.useState<string>('alloc_2026');
  const [activeFilter, setActiveFilter] = React.useState<string>('ALL');
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedLeave, setSelectedLeave] = React.useState<LeaveApplication | null>(null);
  const [showAllocDropdown, setShowAllocDropdown] = React.useState(false);

  // Leave Form Fields
  const [leaveType, setLeaveType] = React.useState('Casual Leave');
  const [leaveStart, setLeaveStart] = React.useState('08 Jul 2026');
  const [leaveEnd, setLeaveEnd] = React.useState('09 Jul 2026');
  const [leaveReason, setLeaveReason] = React.useState('');
  const [halfDay, setHalfDay] = React.useState(false);
  const [emergencyContact, setEmergencyContact] = React.useState('');
  const [attachmentName, setAttachmentName] = React.useState('');
  const [editingLeaveId, setEditingLeaveId] = React.useState<string | null>(null);

  // Library State
  const [allBooks, setAllBooks] = React.useState<LibraryBook[]>(mockAllBooks);
  const [borrowedBooks, setBorrowedBooks] = React.useState<BorrowedBook[]>(mockBorrowedBooks);
  const [readingHistory, setReadingHistory] = React.useState<ReadingHistoryEntry[]>(mockReadingHistory);
  const [libraryTab, setLibraryTab] = React.useState<'ALL_BOOKS' | 'IN_HAND' | 'HISTORY'>('ALL_BOOKS');

  // Library Filters/Sorting/Search
  const [searchBookQuery, setSearchBookQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('All');
  const [filterLanguage, setFilterLanguage] = React.useState('All');
  const [filterAvailability, setFilterAvailability] = React.useState('All');
  const [sortBy, setSortBy] = React.useState<'NEWEST' | 'OLDEST' | 'AZ' | 'ZA'>('NEWEST');
  const [filterHistoryYear, setFilterHistoryYear] = React.useState('All');

  // Book Details Modal
  const [selectedBook, setSelectedBook] = React.useState<LibraryBook | null>(null);
  const [showBookDetailsModal, setShowBookDetailsModal] = React.useState(false);

  // Filter Dropdowns visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = React.useState(false);
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);

  // Placement State
  const [placementDrives, setPlacementDrives] = React.useState<PlacementDrive[]>(mockPlacementDrives);
  const [placementStudents, setPlacementStudents] = React.useState<PlacementStudent[]>(mockPlacementStudents);
  const [placementTab, setPlacementTab] = React.useState<'ACTIVE_DRIVES' | 'HISTORY'>('ACTIVE_DRIVES');

  // Placement Filters & Search
  const [searchPlacementQuery, setSearchPlacementQuery] = React.useState('');
  const [filterPlacementStatus, setFilterPlacementStatus] = React.useState('All');
  const [filterPlacementDept, setFilterPlacementDept] = React.useState('All');

  // Placement details & dropdowns
  const [selectedDrive, setSelectedDrive] = React.useState<PlacementDrive | null>(null);
  const [showDriveDetailsModal, setShowDriveDetailsModal] = React.useState(false);
  const [showPlacementStatusDropdown, setShowPlacementStatusDropdown] = React.useState(false);
  const [showPlacementDeptDropdown, setShowPlacementDeptDropdown] = React.useState(false);
  
  // Placement drive details modal sub-tabs
  const [driveModalSubTab, setDriveModalSubTab] = React.useState<'ELIGIBLE' | 'REGISTERED' | 'RESULTS'>('ELIGIBLE');

  // College Events State
  const [facultyEvents, setFacultyEvents] = React.useState<CollegeEvent[]>(mockFacultyEvents);
  const [eventsTab, setEventsTab] = React.useState<'MY_DUTIES' | 'HISTORY'>('MY_DUTIES');

  // Events Filters & Search
  const [searchEventQuery, setSearchEventQuery] = React.useState('');
  const [filterEventStatus, setFilterEventStatus] = React.useState('All');

  // Event details & dropdowns
  const [selectedEvent, setSelectedEvent] = React.useState<CollegeEvent | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = React.useState(false);
  const [showEventStatusDropdown, setShowEventStatusDropdown] = React.useState(false);

  // ── Date Utility Helpers ──
  const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = months.indexOf(parts[1].toLowerCase().slice(0, 3));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== -1 && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const dateObj = new Date(str);
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
    return null;
  };

  const getDaysCount = (start: Date, end: Date, isHalfDay: boolean): number => {
    if (isHalfDay) return 0.5;
    let count = 0;
    const cur = new Date(start.getTime());
    cur.setHours(0, 0, 0, 0);
    const endNormalized = new Date(end.getTime());
    endNormalized.setHours(0, 0, 0, 0);

    const holidays = ['15 Aug 2026', '25 Dec 2026', '26 Jan 2026', '01 May 2026'];
    const holidayDates = holidays.map(h => {
      const d = parseDateString(h);
      return d ? d.toDateString() : '';
    }).filter(Boolean);

    while (cur <= endNormalized) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDates.includes(cur.toDateString());

      if (!isWeekend && !isHoliday) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const validateDates = (startStr: string, endStr: string) => {
    const start = parseDateString(startStr);
    const end = parseDateString(endStr);
    if (!start) return 'Invalid Start Date format. Use dd Mmm yyyy (e.g. 08 Jul 2026)';
    if (!end) return 'Invalid End Date format. Use dd Mmm yyyy (e.g. 09 Jul 2026)';
    if (start > end) return 'Start Date cannot be after End Date';
    return null;
  };

  const checkOverlapping = (start: Date, end: Date, excludeId?: string) => {
    return leaves.some(lv => {
      if (lv.id === excludeId) return false;
      if (lv.status === 'CANCELLED' || lv.status === 'REJECTED') return false;
      const lvStart = parseDateString(lv.startDate);
      const lvEnd = parseDateString(lv.endDate);
      if (!lvStart || !lvEnd) return false;

      const s1 = start.getTime();
      const e1 = end.getTime();
      const s2 = lvStart.getTime();
      const e2 = lvEnd.getTime();

      return (s1 <= e2) && (e1 >= s2);
    });
  };

  const isDuplicate = (type: string, startStr: string, endStr: string, excludeId?: string) => {
    return leaves.some(lv => {
      if (lv.id === excludeId) return false;
      if (lv.status === 'CANCELLED' || lv.status === 'REJECTED') return false;
      return lv.leaveType === type && lv.startDate === startStr && lv.endDate === endStr;
    });
  };

  // ── Dynamic Balance Calculation ──
  const selectedAlloc = React.useMemo(() => {
    return allocations.find(a => a.id === selectedAllocId) || allocations[0];
  }, [allocations, selectedAllocId]);

  const dynamicBalances = React.useMemo(() => {
    const alloc = selectedAlloc;
    const result = JSON.parse(JSON.stringify(alloc.balances));

    const yearLeaves = leaves.filter(lv => lv.allocationYear === alloc.year);

    const typesMap: Record<string, keyof typeof alloc.balances> = {
      'Casual Leave': 'casualLeave',
      'Medical Leave': 'medicalLeave',
      'Duty Leave': 'dutyLeave',
      'Earned Leave': 'earnedLeave',
      'Loss of Pay': 'lossOfPay',
      'Maternity/Paternity Leave': 'maternityPaternityLeave',
    };

    Object.keys(result).forEach(key => {
      const k = key as keyof typeof alloc.balances;
      if (result[k]) {
        result[k] = {
          total: result[k]!.total,
          used: 0,
          remaining: result[k]!.total,
        };
      }
    });

    yearLeaves.forEach(lv => {
      const key = typesMap[lv.leaveType];
      if (key && result[key]) {
        const duration = lv.totalDays;
        if (lv.status === 'APPROVED' || lv.status === 'COMPLETED') {
          result[key]!.used += duration;
        }
        if (lv.status !== 'CANCELLED' && lv.status !== 'REJECTED') {
          result[key]!.remaining -= duration;
        }
      }
    });

    Object.keys(result).forEach(key => {
      const k = key as keyof typeof alloc.balances;
      if (result[k]) {
        if (result[k]!.remaining < 0) {
          result[k]!.remaining = 0;
        }
      }
    });

    return result;
  }, [selectedAlloc, leaves]);

  const handleEditLeavePress = (lv: LeaveApplication) => {
    setEditingLeaveId(lv.id);
    setLeaveType(lv.leaveType);
    setLeaveStart(lv.startDate);
    setLeaveEnd(lv.endDate);
    setLeaveReason(lv.reason);
    setHalfDay(lv.halfDay || false);
    setEmergencyContact(lv.emergencyContact || '');
    setAttachmentName(lv.attachmentName || '');
    setShowLeaveModal(true);
  };

  const handleCancelLeave = (id: string) => {
    showAlert(
      'Cancel Leave Application',
      'Are you sure you want to cancel this pending leave application?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setLeaves((prev) => prev.map((lv) => lv.id === id ? { ...lv, status: 'CANCELLED' } : lv));
            showAlert('Leave Cancelled', 'Your leave request has been cancelled.');
          }
        }
      ]
    );
  };

  const handleDuplicateLeave = (lv: LeaveApplication) => {
    setLeaveType(lv.leaveType);
    setLeaveStart(lv.startDate);
    setLeaveEnd(lv.endDate);
    setLeaveReason(lv.reason + ' (Resubmitted)');
    setHalfDay(lv.halfDay || false);
    setEmergencyContact(lv.emergencyContact || '');
    setAttachmentName(lv.attachmentName || '');
    setEditingLeaveId(null);
    setShowLeaveModal(true);
    showAlert('Duplicate Request', 'Leave details copied. You can modify and submit.');
  };

  const handleApplyLeave = () => {
    if (!leaveReason.trim()) {
      showAlert('Error', 'Please provide a reason for the leave application.');
      return;
    }

    const dateErr = validateDates(leaveStart, leaveEnd);
    if (dateErr) {
      showAlert('Validation Error', dateErr);
      return;
    }

    const start = parseDateString(leaveStart)!;
    const end = parseDateString(leaveEnd)!;
    const days = getDaysCount(start, end, halfDay);

    if (days <= 0) {
      showAlert('Validation Error', 'Calculated duration must be greater than 0 days (weekends/holidays are excluded).');
      return;
    }

    // Check overlap
    if (checkOverlapping(start, end, editingLeaveId || undefined)) {
      showAlert('Validation Error', 'This request overlaps with an existing active leave request.');
      return;
    }

    // Check duplicate
    if (isDuplicate(leaveType, leaveStart, leaveEnd, editingLeaveId || undefined)) {
      showAlert('Validation Error', 'A request with the same type and dates already exists.');
      return;
    }

    // Check balance
    const typesMap: Record<string, keyof typeof selectedAlloc.balances> = {
      'Casual Leave': 'casualLeave',
      'Medical Leave': 'medicalLeave',
      'Duty Leave': 'dutyLeave',
      'Earned Leave': 'earnedLeave',
      'Loss of Pay': 'lossOfPay',
      'Maternity/Paternity Leave': 'maternityPaternityLeave',
    };
    const balKey = typesMap[leaveType];
    const remainingBal = balKey && dynamicBalances[balKey] ? dynamicBalances[balKey]!.remaining : 0;

    let allowedRemaining = remainingBal;
    if (editingLeaveId) {
      const currentEditingRequest = leaves.find(l => l.id === editingLeaveId);
      if (currentEditingRequest && currentEditingRequest.leaveType === leaveType && currentEditingRequest.allocationYear === selectedAlloc.year) {
        allowedRemaining += currentEditingRequest.totalDays;
      }
    }

    if (days > allowedRemaining) {
      showAlert('Validation Error', `Calculated duration (${days} days) exceeds available ${leaveType} balance (${allowedRemaining} days).`);
      return;
    }

    if (editingLeaveId) {
      setLeaves((prev) => prev.map((lv) =>
        lv.id === editingLeaveId
          ? {
              ...lv,
              leaveType,
              startDate: leaveStart,
              endDate: leaveEnd,
              reason: leaveReason,
              totalDays: days,
              halfDay,
              emergencyContact,
              attachmentName: attachmentName || 'None',
            }
          : lv
      ));
      setEditingLeaveId(null);
      setLeaveReason('');
      setEmergencyContact('');
      setAttachmentName('');
      setShowLeaveModal(false);
      showAlert('Success', 'Leave application updated successfully.');
    } else {
      const newLeave: LeaveApplication = {
        id: 'lv_' + Date.now(),
        leaveType,
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: leaveReason,
        status: 'APPLIED',
        totalDays: days,
        allocationYear: selectedAlloc.year,
        appliedDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        halfDay,
        emergencyContact: emergencyContact || '+91 98765 00001',
        attachmentName: attachmentName || 'medical_certificate.pdf',
      };
      setLeaves([newLeave, ...leaves]);
      setLeaveReason('');
      setEmergencyContact('');
      setAttachmentName('');
      setShowLeaveModal(false);
      showAlert('Success', 'Leave application submitted to HOD successfully.');
    }
  };

  const filteredLeaves = React.useMemo(() => {
    let filtered = leaves;
    if (activeFilter === 'APPLIED') {
      filtered = leaves.filter(l => l.status === 'APPLIED' || l.status === 'PENDING');
    } else if (activeFilter === 'VERIFIED') {
      filtered = leaves.filter(l => l.status === 'VERIFIED');
    } else if (activeFilter === 'APPROVED') {
      filtered = leaves.filter(l => l.status === 'APPROVED' || l.status === 'COMPLETED');
    } else if (activeFilter === 'REJECTED') {
      filtered = leaves.filter(l => l.status === 'REJECTED');
    } else if (activeFilter === 'CANCELLED') {
      filtered = leaves.filter(l => l.status === 'CANCELLED');
    }
    return filtered;
  }, [leaves, activeFilter]);

  const handleRenewBook = (issueId: string, title: string) => {
    const book = borrowedBooks.find((b) => b.id === issueId);
    if (!book) return;

    if (book.renewCount >= 3) {
      showAlert('Renewal Failed', `"${title}" has reached the maximum renewal limit of 3 times.`);
      return;
    }

    if (book.status === 'OVERDUE') {
      showAlert('Renewal Blocked', 'This book is overdue. Please return it to the library. Overdue books cannot be renewed.');
      return;
    }

    const extendDueDate = (dateStr: string, days: number): string => {
      const date = parseDateString(dateStr);
      if (!date) return '20 Aug 2026';
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const newDueDate = extendDueDate(book.dueDate, 14);

    setBorrowedBooks(prev => prev.map(b => {
      if (b.id === issueId) {
        return {
          ...b,
          renewCount: b.renewCount + 1,
          dueDate: newDueDate,
          status: 'ISSUED'
        };
      }
      return b;
    }));

    showAlert('Renew Successful', `"${title}" renewed successfully!\nNew Due Date: ${newDueDate}`);
  };

  const filteredAllBooks = React.useMemo(() => {
    let result = allBooks;

    if (searchBookQuery.trim() !== '') {
      const q = searchBookQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.accessNo.toLowerCase().includes(q) ||
        b.rackNo.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(b => b.category === filterCategory);
    }

    if (filterLanguage !== 'All') {
      result = result.filter(b => b.language === filterLanguage);
    }

    if (filterAvailability !== 'All') {
      result = result.filter(b => {
        if (filterAvailability === 'Available') return b.status === 'AVAILABLE';
        if (filterAvailability === 'Issued') return b.status === 'ISSUED';
        return b.status === 'UNAVAILABLE' || b.status === 'RESERVED';
      });
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'AZ') return a.title.localeCompare(b.title);
      if (sortBy === 'ZA') return b.title.localeCompare(a.title);
      if (sortBy === 'NEWEST') return b.id.localeCompare(a.id);
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [allBooks, searchBookQuery, filterCategory, filterLanguage, filterAvailability, sortBy]);

  const filteredReadingHistory = React.useMemo(() => {
    let result = readingHistory;

    if (searchBookQuery.trim() !== '') {
      const q = searchBookQuery.toLowerCase();
      result = result.filter(h => 
        h.title.toLowerCase().includes(q) ||
        h.author.toLowerCase().includes(q)
      );
    }

    if (filterHistoryYear !== 'All') {
      result = result.filter(h => {
        return h.returnDate.includes(filterHistoryYear);
      });
    }

    return result;
  }, [readingHistory, searchBookQuery, filterHistoryYear]);

  const dynamicLibraryStats = React.useMemo(() => {
    const currentCount = borrowedBooks.length;
    const overdueCount = borrowedBooks.filter(b => b.status === 'OVERDUE').length;
    const returnedCount = readingHistory.length;
    const renewedCount = borrowedBooks.reduce((sum, b) => sum + b.renewCount, 0);
    const totalBorrowed = currentCount + returnedCount;

    return {
      borrowedCount: totalBorrowed,
      returnedCount,
      overdueCount,
      renewedCount,
      currentCount,
    };
  }, [borrowedBooks, readingHistory]);

  const dynamicPlacementStats = React.useMemo(() => {
    const totalDrives = placementDrives.length;
    const upcomingDrives = placementDrives.filter(d => d.status === 'UPCOMING' || d.status === 'REGISTRATION_OPEN').length;
    const ongoingDrives = placementDrives.filter(d => d.status === 'ONGOING').length;
    const completedDrives = placementDrives.filter(d => d.status === 'COMPLETED').length;
    const totalRegistered = placementStudents.filter(s => s.currentStatus !== 'ELIGIBLE' && s.currentStatus !== 'REJECTED').length;
    const totalSelected = placementStudents.filter(s => s.currentStatus === 'SELECTED').length;

    return {
      totalDrives,
      upcomingDrives,
      ongoingDrives,
      completedDrives,
      totalRegistered,
      totalSelected
    };
  }, [placementDrives, placementStudents]);

  const filteredPlacementDrives = React.useMemo(() => {
    let result = placementDrives;

    if (placementTab === 'ACTIVE_DRIVES') {
      result = result.filter(d => ['UPCOMING', 'REGISTRATION_OPEN', 'ONGOING'].includes(d.status));
    } else {
      result = result.filter(d => ['COMPLETED', 'CANCELLED'].includes(d.status));
    }

    if (searchPlacementQuery.trim() !== '') {
      const q = searchPlacementQuery.toLowerCase();
      result = result.filter(d => {
        const matchesDrive = 
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.package.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q);
          
        if (matchesDrive) return true;
        
        const matchStudent = placementStudents.some(s => 
          s.driveId === d.id && s.name.toLowerCase().includes(q)
        );
        return matchStudent;
      });
    }

    if (filterPlacementStatus !== 'All') {
      result = result.filter(d => {
        if (filterPlacementStatus === 'Upcoming') return d.status === 'UPCOMING' || d.status === 'REGISTRATION_OPEN';
        if (filterPlacementStatus === 'Ongoing') return d.status === 'ONGOING';
        if (filterPlacementStatus === 'Completed') return d.status === 'COMPLETED';
        return d.status === 'CANCELLED';
      });
    }

    if (filterPlacementDept !== 'All') {
      result = result.filter(d => d.departments.includes(filterPlacementDept));
    }

    return result;
  }, [placementDrives, placementTab, searchPlacementQuery, filterPlacementStatus, filterPlacementDept, placementStudents]);

  const todayDuties = React.useMemo(() => {
    return facultyEvents.filter(
      ev => (ev.status === 'TODAY' || ev.status === 'ONGOING') && ev.dutyStatus !== 'COMPLETED'
    );
  }, [facultyEvents]);

  const filteredEvents = React.useMemo(() => {
    let result = facultyEvents;

    if (eventsTab === 'MY_DUTIES') {
      result = result.filter(ev => ev.status !== 'COMPLETED');
    } else {
      result = result.filter(ev => ev.status === 'COMPLETED');
    }

    if (searchEventQuery.trim() !== '') {
      const q = searchEventQuery.toLowerCase();
      result = result.filter(ev => 
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.coordinator.toLowerCase().includes(q) ||
        ev.assignedDuty.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    }

    if (filterEventStatus !== 'All') {
      result = result.filter(ev => {
        if (filterEventStatus === 'Upcoming') return ev.status === 'UPCOMING';
        if (filterEventStatus === 'Today') return ev.status === 'TODAY';
        if (filterEventStatus === 'Ongoing') return ev.status === 'ONGOING';
        if (filterEventStatus === 'Completed') return ev.status === 'COMPLETED';
        return ev.status === 'CANCELLED';
      });
    }

    return result;
  }, [facultyEvents, eventsTab, searchEventQuery, filterEventStatus]);

  const handleConfirmDuty = (eventId: string) => {
    setFacultyEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          dutyStatus: 'CONFIRMED',
          currentTimelineStepIndex: 1
        };
      }
      return ev;
    }));
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, dutyStatus: 'CONFIRMED', currentTimelineStepIndex: 1 } : null);
    }
    showAlert('Duty Confirmed', 'You have successfully confirmed your duty assignment. Thank you!');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {activeTab === 'LEAVE' ? 'Easy Leave' :
           activeTab === 'EVENTS' ? 'College Events' :
           activeTab === 'PLACEMENTS' ? 'Placement Cell' :
           activeTab === 'LIBRARY' ? 'Digital Library' : 'Administrative Services'}
        </Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ──── LEAVE TAB ──── */}
        {activeTab === 'LEAVE' && (
          <View style={styles.tabPane}>
            {/* Allocation Selector */}
            <View style={[styles.rowBetween, { zIndex: 999 }]}>
              <Text style={styles.sectionTitle}>Leave Balances</Text>
              <View>
                <Pressable 
                  style={styles.allocationBtn} 
                  onPress={() => setShowAllocDropdown(!showAllocDropdown)}
                >
                  <Text style={styles.allocationBtnTxt}>{selectedAlloc.year}</Text>
                  <ChevronDown size={14} color={Colors.BluePrimary} />
                </Pressable>
                
                {showAllocDropdown && (
                  <View style={styles.allocDropdownMenu}>
                    {allocations.map((alloc) => (
                      <Pressable
                        key={alloc.id}
                        style={styles.allocDropdownItem}
                        onPress={() => {
                          setSelectedAllocId(alloc.id);
                          setShowAllocDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.allocDropdownItemTxt, 
                          selectedAllocId === alloc.id && { color: Colors.BluePrimary, fontWeight: '700' }
                        ]}>
                          {alloc.year}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Balance cards grid (horizontal scroll) */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.balanceGrid}
            >
              {[
                { label: 'Casual Leave', key: 'casualLeave' },
                { label: 'Medical Leave', key: 'medicalLeave' },
                { label: 'On Duty', key: 'dutyLeave' },
                { label: 'Earned Leave', key: 'earnedLeave' },
                { label: 'Loss of Pay', key: 'lossOfPay' },
                { label: 'Maternity/Paternity', key: 'maternityPaternityLeave' },
              ].map((item) => {
                const bal = dynamicBalances[item.key as keyof typeof selectedAlloc.balances];
                if (!bal) return null;
                return (
                  <View key={item.key} style={styles.balanceCard}>
                    <Text style={styles.balanceCardLabel}>{item.label}</Text>
                    <View style={styles.balanceCardNumberRow}>
                      <Text style={styles.balanceCardRemaining}>{bal.remaining}</Text>
                      <Text style={styles.balanceCardTotal}>/ {bal.total}</Text>
                    </View>
                    <Text style={styles.balanceCardUsed}>Used: {bal.used} days</Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Leave Applications Title and Apply Button */}
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>Leave Applications</Text>
              <Pressable style={styles.addBtn} onPress={() => { setEditingLeaveId(null); setLeaveReason(''); setEmergencyContact(''); setAttachmentName(''); setHalfDay(false); setShowLeaveModal(true); }}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Apply Leave</Text>
              </Pressable>
            </View>

            {/* Filter Chips Bar */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.filterChipsRow}
            >
              {[
                { key: 'ALL', label: 'All' },
                { key: 'APPLIED', label: 'Applied' },
                { key: 'VERIFIED', label: 'Verified' },
                { key: 'APPROVED', label: 'Approved' },
                { key: 'REJECTED', label: 'Rejected' },
                { key: 'CANCELLED', label: 'Cancelled' },
              ].map((f) => {
                const count = f.key === 'ALL' ? leaves.length :
                             f.key === 'APPLIED' ? leaves.filter(l => l.status === 'APPLIED' || l.status === 'PENDING').length :
                             f.key === 'VERIFIED' ? leaves.filter(l => l.status === 'VERIFIED').length :
                             f.key === 'APPROVED' ? leaves.filter(l => l.status === 'APPROVED' || l.status === 'COMPLETED').length :
                             f.key === 'REJECTED' ? leaves.filter(l => l.status === 'REJECTED').length :
                             leaves.filter(l => l.status === 'CANCELLED').length;
                const active = activeFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setActiveFilter(f.key)}
                  >
                    <Text style={[styles.filterChipTxt, active && styles.filterChipTxtActive]}>
                      {f.label} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Leave Cards List */}
            {filteredLeaves.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <FileText size={48} color={Colors.AppOutline} />
                <Text style={styles.emptyStateTitle}>No Applications Found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {activeFilter === 'ALL' ? 'You have not submitted any leave applications yet.' :
                   activeFilter === 'APPLIED' ? 'There are no pending or applied requests.' :
                   activeFilter === 'VERIFIED' ? 'There are no verified requests.' :
                   activeFilter === 'APPROVED' ? 'There are no approved requests.' :
                   activeFilter === 'REJECTED' ? 'There are no rejected requests.' :
                   'There are no cancelled requests.'}
                </Text>
              </View>
            ) : (
              filteredLeaves.map((lv) => (
                <CampusCard key={lv.id} style={styles.card} elevation="sm">
                  <Pressable onPress={() => { setSelectedLeave(lv); setShowDetailsModal(true); }}>
                    <View style={styles.leaveHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.leaveType}>{lv.leaveType}</Text>
                        <Text style={styles.leaveDays}>{lv.totalDays} {lv.totalDays === 1 ? 'Day' : 'Days'}</Text>
                        <Text style={styles.leaveAppliedDate}>Duration: {lv.startDate} to {lv.endDate}</Text>
                        <Text style={styles.leaveAppliedDate}>Applied: {lv.appliedDate}</Text>
                      </View>
                      <StatusChip
                        text={lv.status}
                        level={
                          ['APPROVED', 'COMPLETED'].includes(lv.status) ? 'SAFE' :
                          ['APPLIED', 'PENDING', 'VERIFIED'].includes(lv.status) ? 'WARNING' : 'LOW'
                        }
                      />
                    </View>
                    <Text style={styles.leaveReason} numberOfLines={2}>Reason: {lv.reason}</Text>
                    
                    <View style={styles.leaveCardActions}>
                      {(lv.status === 'APPLIED' || lv.status === 'PENDING') && (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <Pressable onPress={() => handleEditLeavePress(lv)} style={styles.iconActionBtn}>
                            <Pencil size={14} color={Colors.BluePrimary} />
                            <Text style={styles.iconActionBtnTxt}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => handleCancelLeave(lv.id)} style={styles.iconActionBtn}>
                            <Trash2 size={14} color={Colors.ColorAbsent} />
                            <Text style={[styles.iconActionBtnTxt, { color: Colors.ColorAbsent }]}>Cancel</Text>
                          </Pressable>
                        </View>
                      )}
                      {lv.status === 'REJECTED' && (
                        <Pressable onPress={() => handleDuplicateLeave(lv)} style={styles.iconActionBtn}>
                          <RotateCw size={14} color={Colors.BluePrimary} />
                          <Text style={styles.iconActionBtnTxt}>Re-apply</Text>
                        </Pressable>
                      )}
                      <Pressable 
                        onPress={() => { setSelectedLeave(lv); setShowDetailsModal(true); }}
                        style={[styles.iconActionBtn, { marginLeft: 'auto' }]}
                      >
                        <ArrowRight size={14} color={Colors.BluePrimary} />
                        <Text style={styles.iconActionBtnTxt}>Details</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                </CampusCard>
              ))
            )}
          </View>
        )}

        {/* ──── EVENTS TAB ──── */}
        {activeTab === 'EVENTS' && (
          <View style={styles.tabPane}>
            {/* Today's Duty Section */}
            {todayDuties.length > 0 && (
              <CampusCard style={[styles.card, { borderColor: Colors.BluePrimary, borderWidth: 1.5 }]} elevation="sm">
                <View style={styles.todayDutyHeader}>
                  <Text style={styles.todayDutyBadge}>TODAY'S DUTY</Text>
                  <Text style={styles.todayDutyTime}>Report at {todayDuties[0].reportingTime}</Text>
                </View>
                <Text style={styles.todayDutyTitle}>{todayDuties[0].title}</Text>
                <Text style={styles.todayDutyVenue}>📍 {todayDuties[0].venue}</Text>
                <Text style={styles.todayDutyVenue}>🕙 {todayDuties[0].startTime} - {todayDuties[0].endTime}</Text>
                <View style={styles.todayDutyRoleRow}>
                  <Text style={styles.todayDutyRoleLabel}>Your Role: <Text style={styles.todayDutyRoleVal}>{todayDuties[0].assignedDuty}</Text></Text>
                  <Pressable 
                    onPress={() => { setSelectedEvent(todayDuties[0]); setShowEventDetailsModal(true); }}
                    style={styles.todayDutyBtn}
                  >
                    <Text style={styles.todayDutyBtnTxt}>View Details</Text>
                  </Pressable>
                </View>
              </CampusCard>
            )}

            {/* Events Sub-Tabs */}
            <View style={styles.subTabBar}>
              {[
                { key: 'MY_DUTIES', label: 'My Duties' },
                { key: 'HISTORY', label: 'Event History' },
              ].map((subTab) => {
                const active = eventsTab === subTab.key;
                return (
                  <Pressable
                    key={subTab.key}
                    style={[styles.subTabItem, active && styles.subTabItemActive]}
                    onPress={() => { setEventsTab(subTab.key as any); setSearchEventQuery(''); }}
                  >
                    <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{subTab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchBar}
              placeholder="Search events, venue, coordinator or duty..."
              value={searchEventQuery}
              onChangeText={setSearchEventQuery}
              placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
            />

            {/* Event Dropdown Filter */}
            <View style={styles.filterDropdownsContainer}>
              <View style={styles.filterTitleRow}>
                <Filter size={16} color={Colors.BluePrimary} />
                <Text style={styles.filterTitleLabel}>Event Status</Text>
              </View>

              <View style={{ position: 'relative', zIndex: 4000, width: '100%' }}>
                <Pressable 
                  style={styles.filterDropdownBtn} 
                  onPress={() => setShowEventStatusDropdown(!showEventStatusDropdown)}
                >
                  <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                    Status: {filterEventStatus}
                  </Text>
                  <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                </Pressable>

                {showEventStatusDropdown && (
                  <View style={styles.filterDropdownMenu}>
                    {['All', 'Upcoming', 'Today', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                      <Pressable 
                        key={st} 
                        style={[styles.filterDropdownItem, filterEventStatus === st && styles.filterDropdownItemActive]}
                        onPress={() => {
                          setFilterEventStatus(st);
                          setShowEventStatusDropdown(false);
                        }}
                      >
                        <Text style={[styles.filterDropdownItemTxt, filterEventStatus === st && styles.filterDropdownItemTxtActive]}>
                          {st}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Events List */}
            <View style={{ gap: 16 }}>
              {filteredEvents.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Calendar size={48} color={Colors.AppOutline} />
                  <Text style={styles.emptyStateTitle}>No Events Found</Text>
                  <Text style={styles.emptyStateSubtitle}>Try adjusting your search query or dropdown filter.</Text>
                </View>
              ) : (
                filteredEvents.map((ev) => {
                  const isCompleted = ev.status === 'COMPLETED';

                  return (
                    <CampusCard key={ev.id} style={styles.card} elevation="sm">
                      <Pressable onPress={() => { setSelectedEvent(ev); setShowEventDetailsModal(true); }}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.eventDateBox, isCompleted && { backgroundColor: '#E2E8F0' }]}>
                            <Text style={[styles.eventDateDay, isCompleted && { color: Colors.AppOnSurfaceVariant }]}>
                              {ev.day}
                            </Text>
                            <Text style={[styles.eventDateMonth, isCompleted && { color: Colors.AppOnSurfaceVariant }]}>
                              {ev.month}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.eventTitle}>{ev.title}</Text>
                            <Text style={styles.eventMeta}>📍 {ev.venue}</Text>
                            <Text style={styles.eventMeta}>🕙 {ev.startTime} - {ev.endTime}</Text>
                            <Text style={styles.eventDuty}>Duty: {ev.assignedDuty}</Text>
                          </View>
                          <StatusChip 
                            text={ev.status} 
                            level={
                              ev.status === 'TODAY' || ev.status === 'ONGOING' ? 'NOW' : 
                              ev.status === 'UPCOMING' ? 'WARNING' : 
                              ev.status === 'COMPLETED' ? 'SAFE' : 'LOW'
                            } 
                          />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.placementDetails}>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Category</Text>
                            <Text style={styles.placementValue}>{ev.category}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Coordinator</Text>
                            <Text style={styles.placementValue} numberOfLines={1}>{ev.coordinator}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Duty Status</Text>
                            <Text style={[
                              styles.placementValue, 
                              ev.dutyStatus === 'CONFIRMED' && { color: Colors.ColorPresent },
                              ev.dutyStatus === 'ASSIGNED' && { color: Colors.BluePrimary }
                            ]}>
                              {ev.dutyStatus}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </CampusCard>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ──── PLACEMENTS TAB ──── */}
        {activeTab === 'PLACEMENTS' && (
          <View style={styles.tabPane}>
            {/* Placement Statistics Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsGrid}>
              {[
                { label: 'Total Drives', val: dynamicPlacementStats.totalDrives, desc: 'Drives this year' },
                { label: 'Upcoming', val: dynamicPlacementStats.upcomingDrives, desc: 'Registration open' },
                { label: 'Ongoing', val: dynamicPlacementStats.ongoingDrives, desc: 'Interviews active' },
                { label: 'Completed', val: dynamicPlacementStats.completedDrives, desc: 'Drives concluded' },
                { label: 'Registered', val: dynamicPlacementStats.totalRegistered, desc: 'Active applicants' },
                { label: 'Selected', val: dynamicPlacementStats.totalSelected, desc: 'Offers secured', success: true },
              ].map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Text style={styles.statCardLabel}>{stat.label}</Text>
                  <Text style={[styles.statCardVal, stat.success && { color: Colors.ColorPresent }]}>{stat.val}</Text>
                  <Text style={styles.statCardDesc}>{stat.desc}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Placements Sub-Tabs */}
            <View style={styles.subTabBar}>
              {[
                { key: 'ACTIVE_DRIVES', label: 'Active Drives' },
                { key: 'HISTORY', label: 'Placement History' },
              ].map((subTab) => {
                const active = placementTab === subTab.key;
                return (
                  <Pressable
                    key={subTab.key}
                    style={[styles.subTabItem, active && styles.subTabItemActive]}
                    onPress={() => { setPlacementTab(subTab.key as any); setSearchPlacementQuery(''); }}
                  >
                    <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{subTab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchBar}
              placeholder="Search by company, role, department or student name..."
              value={searchPlacementQuery}
              onChangeText={setSearchPlacementQuery}
              placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
            />

            {/* Placement Dropdown Filters */}
            <View style={styles.filterDropdownsContainer}>
              <View style={styles.filterTitleRow}>
                <Filter size={16} color={Colors.BluePrimary} />
                <Text style={styles.filterTitleLabel}>Drive Filters</Text>
              </View>

              <View style={styles.dropdownsGrid}>
                {/* Status Dropdown Selector */}
                <View style={{ flex: 1, position: 'relative', zIndex: 3000 }}>
                  <Pressable 
                    style={styles.filterDropdownBtn} 
                    onPress={() => {
                      setShowPlacementStatusDropdown(!showPlacementStatusDropdown);
                      setShowPlacementDeptDropdown(false);
                    }}
                  >
                    <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                      Status: {filterPlacementStatus}
                    </Text>
                    <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                  </Pressable>

                  {showPlacementStatusDropdown && (
                    <View style={styles.filterDropdownMenu}>
                      {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                        <Pressable 
                          key={st} 
                          style={[styles.filterDropdownItem, filterPlacementStatus === st && styles.filterDropdownItemActive]}
                          onPress={() => {
                            setFilterPlacementStatus(st);
                            setShowPlacementStatusDropdown(false);
                          }}
                        >
                          <Text style={[styles.filterDropdownItemTxt, filterPlacementStatus === st && styles.filterDropdownItemTxtActive]}>
                            {st}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Department Dropdown Selector */}
                <View style={{ flex: 1, position: 'relative', zIndex: 2000 }}>
                  <Pressable 
                    style={styles.filterDropdownBtn} 
                    onPress={() => {
                      setShowPlacementDeptDropdown(!showPlacementDeptDropdown);
                      setShowPlacementStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                      Dept: {filterPlacementDept}
                    </Text>
                    <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                  </Pressable>

                  {showPlacementDeptDropdown && (
                    <View style={styles.filterDropdownMenu}>
                      {['All', 'CSE', 'ECE', 'EEE', 'MECH'].map((dp) => (
                        <Pressable 
                          key={dp} 
                          style={[styles.filterDropdownItem, filterPlacementDept === dp && styles.filterDropdownItemActive]}
                          onPress={() => {
                            setFilterPlacementDept(dp);
                            setShowPlacementDeptDropdown(false);
                          }}
                        >
                          <Text style={[styles.filterDropdownItemTxt, filterPlacementDept === dp && styles.filterDropdownItemTxtActive]}>
                            {dp}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Drives List */}
            <View style={{ gap: 16 }}>
              {filteredPlacementDrives.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Briefcase size={48} color={Colors.AppOutline} />
                  <Text style={styles.emptyStateTitle}>No Recruitment Drives Found</Text>
                  <Text style={styles.emptyStateSubtitle}>Try adjusting your search query or dropdown filters.</Text>
                </View>
              ) : (
                filteredPlacementDrives.map((pl) => {
                  const regCount = placementStudents.filter(s => s.driveId === pl.id && s.currentStatus !== 'ELIGIBLE' && s.currentStatus !== 'REJECTED').length;
                  const eligCount = placementStudents.filter(s => s.driveId === pl.id && s.currentStatus === 'ELIGIBLE').length;

                  return (
                    <CampusCard key={pl.id} style={styles.card} elevation="sm">
                      <Pressable onPress={() => { setSelectedDrive(pl); setShowDriveDetailsModal(true); setDriveModalSubTab('ELIGIBLE'); }}>
                        <View style={styles.placementHeader}>
                          <View style={styles.bookIconPlaceholder}>
                            <Briefcase size={20} color={Colors.BluePrimary} />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.companyName}>{pl.companyName}</Text>
                            <Text style={styles.companyRole}>{pl.role} · {pl.jobType}</Text>
                          </View>
                          <StatusChip 
                            text={pl.status.replace('_', ' ')} 
                            level={
                              pl.status === 'REGISTRATION_OPEN' ? 'NOW' : 
                              pl.status === 'ONGOING' ? 'WARNING' : 
                              pl.status === 'COMPLETED' ? 'SAFE' : 'LOW'
                            } 
                          />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.placementDetails}>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Package Offered</Text>
                            <Text style={styles.placementValue}>{pl.package}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Drive Date</Text>
                            <Text style={styles.placementValue}>{pl.driveDate}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Deadline</Text>
                            <Text style={[styles.placementValue, pl.status === 'REGISTRATION_OPEN' && { color: Colors.RedError }]}>{pl.deadline}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                          <Text style={styles.bookMetaLabel}>Eligible Students: <Text style={styles.bookMetaVal}>{eligCount}</Text></Text>
                          <Text style={styles.bookMetaLabel}>Registered: <Text style={styles.bookMetaVal}>{regCount}</Text></Text>
                        </View>
                      </Pressable>
                    </CampusCard>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ──── LIBRARY TAB ──── */}
        {activeTab === 'LIBRARY' && (
          <View style={styles.tabPane}>
            {/* Library Statistics Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsGrid}>
              {[
                { label: 'Borrowed', val: dynamicLibraryStats.borrowedCount, desc: 'Total books borrowed' },
                { label: 'Returned', val: dynamicLibraryStats.returnedCount, desc: 'Returned history' },
                { label: 'Overdue', val: dynamicLibraryStats.overdueCount, desc: 'Requires attention', alert: true },
                { label: 'Renewed', val: dynamicLibraryStats.renewedCount, desc: 'Times renewed' },
                { label: 'In Hand', val: dynamicLibraryStats.currentCount, desc: 'Current books' },
              ].map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Text style={styles.statCardLabel}>{stat.label}</Text>
                  <Text style={[styles.statCardVal, stat.alert && { color: Colors.RedError }]}>{stat.val}</Text>
                  <Text style={styles.statCardDesc}>{stat.desc}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Library Sub-Tabs */}
            <View style={styles.subTabBar}>
              {[
                { key: 'ALL_BOOKS', label: 'All Books' },
                { key: 'IN_HAND', label: 'In Hand' },
                { key: 'HISTORY', label: 'Reading History' },
              ].map((subTab) => {
                const active = libraryTab === subTab.key;
                return (
                  <Pressable
                    key={subTab.key}
                    style={[styles.subTabItem, active && styles.subTabItemActive]}
                    onPress={() => { setLibraryTab(subTab.key as any); setSearchBookQuery(''); }}
                  >
                    <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{subTab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchBar}
              placeholder={
                libraryTab === 'ALL_BOOKS' ? 'Search by title, author, isbn, category...' :
                libraryTab === 'IN_HAND' ? 'Search issued books by title or author...' :
                'Search reading history by title or author...'
              }
              value={searchBookQuery}
              onChangeText={setSearchBookQuery}
              placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
            />

            {/* Sub-Tab 1: All Books Filters */}
            {libraryTab === 'ALL_BOOKS' && (
              <View style={styles.filterDropdownsContainer}>
                <View style={styles.filterTitleRow}>
                  <Filter size={16} color={Colors.BluePrimary} />
                  <Text style={styles.filterTitleLabel}>Catalog Filters</Text>
                </View>
                
                <View style={styles.dropdownsGrid}>
                  {/* Category Dropdown */}
                  <View style={{ flex: 1.2, position: 'relative', zIndex: 3000 }}>
                    <Pressable 
                      style={styles.filterDropdownBtn} 
                      onPress={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                        setShowAvailabilityDropdown(false);
                        setShowSortDropdown(false);
                      }}
                    >
                      <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                        Category: {filterCategory}
                      </Text>
                      <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                    </Pressable>

                    {showCategoryDropdown && (
                      <View style={styles.filterDropdownMenu}>
                        {['All', 'Computer Science', 'Networking', 'Artificial Intelligence', 'Data Structures'].map((cat) => (
                          <Pressable 
                            key={cat} 
                            style={[styles.filterDropdownItem, filterCategory === cat && styles.filterDropdownItemActive]}
                            onPress={() => {
                              setFilterCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text style={[styles.filterDropdownItemTxt, filterCategory === cat && styles.filterDropdownItemTxtActive]}>
                              {cat}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Availability Dropdown */}
                  <View style={{ flex: 1, position: 'relative', zIndex: 2000 }}>
                    <Pressable 
                      style={styles.filterDropdownBtn} 
                      onPress={() => {
                        setShowAvailabilityDropdown(!showAvailabilityDropdown);
                        setShowCategoryDropdown(false);
                        setShowSortDropdown(false);
                      }}
                    >
                      <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                        Status: {filterAvailability}
                      </Text>
                      <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                    </Pressable>

                    {showAvailabilityDropdown && (
                      <View style={styles.filterDropdownMenu}>
                        {['All', 'Available', 'Issued'].map((av) => (
                          <Pressable 
                            key={av} 
                            style={[styles.filterDropdownItem, filterAvailability === av && styles.filterDropdownItemActive]}
                            onPress={() => {
                              setFilterAvailability(av);
                              setShowAvailabilityDropdown(false);
                            }}
                          >
                            <Text style={[styles.filterDropdownItemTxt, filterAvailability === av && styles.filterDropdownItemTxtActive]}>
                              {av}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Sort Dropdown */}
                  <View style={{ flex: 1, position: 'relative', zIndex: 1000 }}>
                    <Pressable 
                      style={styles.filterDropdownBtn} 
                      onPress={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowCategoryDropdown(false);
                        setShowAvailabilityDropdown(false);
                      }}
                    >
                      <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                        Sort: {
                          sortBy === 'NEWEST' ? 'Newest' :
                          sortBy === 'OLDEST' ? 'Oldest' :
                          sortBy === 'AZ' ? 'A-Z' : 'Z-A'
                        }
                      </Text>
                      <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                    </Pressable>

                    {showSortDropdown && (
                      <View style={styles.filterDropdownMenu}>
                        {[
                          { key: 'NEWEST', label: 'Newest' },
                          { key: 'OLDEST', label: 'Oldest' },
                          { key: 'AZ', label: 'Title A-Z' },
                          { key: 'ZA', label: 'Title Z-A' },
                        ].map((s) => (
                          <Pressable 
                            key={s.key} 
                            style={[styles.filterDropdownItem, sortBy === s.key && styles.filterDropdownItemActive]}
                            onPress={() => {
                              setSortBy(s.key as any);
                              setShowSortDropdown(false);
                            }}
                          >
                            <Text style={[styles.filterDropdownItemTxt, sortBy === s.key && styles.filterDropdownItemTxtActive]}>
                              {s.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Sub-Tab 3: Reading History Filter by Year */}
            {libraryTab === 'HISTORY' && (
              <View style={styles.filterDropdownsContainer}>
                <View style={styles.filterTitleRow}>
                  <Filter size={16} color={Colors.BluePrimary} />
                  <Text style={styles.filterTitleLabel}>History Filters</Text>
                </View>

                <View style={[styles.dropdownsGrid, { width: '50%', zIndex: 3000 }]}>
                  <View style={{ flex: 1, position: 'relative' }}>
                    <Pressable 
                      style={styles.filterDropdownBtn} 
                      onPress={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                      }}
                    >
                      <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                        Year: {filterHistoryYear}
                      </Text>
                      <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
                    </Pressable>

                    {showCategoryDropdown && (
                      <View style={styles.filterDropdownMenu}>
                        {['All', '2026', '2025'].map((yr) => (
                          <Pressable 
                            key={yr} 
                            style={[styles.filterDropdownItem, filterHistoryYear === yr && styles.filterDropdownItemActive]}
                            onPress={() => {
                              setFilterHistoryYear(yr);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text style={[styles.filterDropdownItemTxt, filterHistoryYear === yr && styles.filterDropdownItemTxtActive]}>
                              {yr}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* List Contents */}
            {/* 1. All Books List */}
            {libraryTab === 'ALL_BOOKS' && (
              <View style={{ gap: 16 }}>
                {filteredAllBooks.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Book size={48} color={Colors.AppOutline} />
                    <Text style={styles.emptyStateTitle}>No Books Found</Text>
                    <Text style={styles.emptyStateSubtitle}>Try modifying your search queries or filters.</Text>
                  </View>
                ) : (
                  filteredAllBooks.map((bk) => (
                    <CampusCard key={bk.id} style={styles.card} elevation="sm">
                      <Pressable onPress={() => { setSelectedBook(bk); setShowBookDetailsModal(true); }}>
                        <View style={styles.bookHeader}>
                          <View style={styles.bookIconPlaceholder}>
                            <Book size={20} color={Colors.BluePrimary} />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.bookTitle}>{bk.title}</Text>
                            <Text style={styles.bookAuthor}>Author: {bk.author} · Ed: {bk.edition}</Text>
                            <Text style={styles.bookMetaLabel}>Category: <Text style={styles.bookMetaVal}>{bk.category}</Text></Text>
                          </View>
                          <StatusChip 
                            text={bk.status}
                            level={bk.status === 'AVAILABLE' ? 'SAFE' : bk.status === 'ISSUED' ? 'WARNING' : 'LOW'}
                          />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.placementDetails}>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Accession No</Text>
                            <Text style={styles.placementValue}>{bk.accessNo}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Shelf/Rack</Text>
                            <Text style={styles.placementValue}>{bk.rackNo}</Text>
                          </View>
                          <View style={styles.placementCol}>
                            <Text style={styles.placementLabel}>Available Copies</Text>
                            <Text style={styles.placementValue}>{bk.availableCopies} / {bk.totalCopies}</Text>
                          </View>
                        </View>
                      </Pressable>
                    </CampusCard>
                  ))
                )}
              </View>
            )}

            {/* 2. In Hand List */}
            {libraryTab === 'IN_HAND' && (
              <View style={{ gap: 16 }}>
                {borrowedBooks.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Book size={48} color={Colors.AppOutline} />
                    <Text style={styles.emptyStateTitle}>No Issued Books</Text>
                    <Text style={styles.emptyStateSubtitle}>You do not have any borrowed books in hand.</Text>
                  </View>
                ) : (
                  (() => {
                    const q = searchBookQuery.toLowerCase();
                    const filteredInHand = borrowedBooks.filter(b => 
                      b.title.toLowerCase().includes(q) || 
                      b.author.toLowerCase().includes(q)
                    );
                    if (filteredInHand.length === 0) {
                      return (
                        <View style={styles.emptyStateContainer}>
                          <Book size={48} color={Colors.AppOutline} />
                          <Text style={styles.emptyStateTitle}>No Search Results</Text>
                          <Text style={styles.emptyStateSubtitle}>No currently issued books match your query.</Text>
                        </View>
                      );
                    }
                    return filteredInHand.map((bk) => {
                      // Calculate days remaining dynamically
                      const today = new Date();
                      const due = parseDateString(bk.dueDate);
                      let daysRem = 0;
                      if (due) {
                        const diffTime = due.getTime() - today.getTime();
                        daysRem = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      }
                      
                      // Check status
                      let statusText = bk.status;
                      let statusLevel = 'WARNING'; // DUE_SOON
                      if (daysRem < 0) {
                        statusText = 'OVERDUE';
                        statusLevel = 'LOW';
                      } else if (daysRem > 3) {
                        statusText = 'ISSUED';
                        statusLevel = 'SAFE';
                      }
                      
                      return (
                        <CampusCard key={bk.id} style={styles.card} elevation="sm">
                          <View style={styles.bookHeader}>
                            <View style={styles.bookIconPlaceholder}>
                              <Book size={20} color={Colors.BluePrimary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.bookTitle}>{bk.title}</Text>
                              <Text style={styles.bookAuthor}>Author: {bk.author}</Text>
                            </View>
                            <StatusChip text={statusText} level={statusLevel} />
                          </View>
                          <View style={styles.divider} />
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <View style={{ flex: 1, gap: 4 }}>
                              <Text style={styles.bookMetaLabel}>Access No: <Text style={styles.bookMetaVal}>{bk.accessNo}</Text></Text>
                              <Text style={styles.bookMetaLabel}>Issue Date: <Text style={styles.bookMetaVal}>{bk.issueDate}</Text></Text>
                              <Text style={styles.bookMetaLabel}>Due Date: <Text style={[styles.bookMetaVal, daysRem < 0 && { color: Colors.RedError, fontWeight: '800' }]}>{bk.dueDate} ({daysRem < 0 ? 'Overdue' : `${daysRem} days left`})</Text></Text>
                              <Text style={styles.bookMetaLabel}>Renewals: <Text style={styles.bookMetaVal}>{bk.renewCount}/3</Text></Text>
                            </View>
                            <View style={{ paddingLeft: 12 }}>
                              {bk.renewCount < 3 && daysRem >= 0 && (
                                <Pressable style={styles.renewBtn} onPress={() => handleRenewBook(bk.id, bk.title)}>
                                  <RotateCw size={12} color="#FFFFFF" />
                                  <Text style={styles.renewBtnText}>Renew</Text>
                                </Pressable>
                              )}
                              {bk.renewCount >= 3 && (
                                <View style={[styles.renewBtn, { backgroundColor: '#CBD5E1' }]}>
                                  <Text style={styles.renewBtnText}>Limit Reached</Text>
                                </View>
                              )}
                              {daysRem < 0 && (
                                <View style={[styles.renewBtn, { backgroundColor: Colors.RedError }]}>
                                  <Text style={styles.renewBtnText}>Overdue Block</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </CampusCard>
                      );
                    });
                  })()
                )}
              </View>
            )}

            {/* 3. Reading History List */}
            {libraryTab === 'HISTORY' && (
              <View style={{ gap: 16 }}>
                {filteredReadingHistory.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Book size={48} color={Colors.AppOutline} />
                    <Text style={styles.emptyStateTitle}>No History Found</Text>
                    <Text style={styles.emptyStateSubtitle}>Try selecting a different filter year or search query.</Text>
                  </View>
                ) : (
                  filteredReadingHistory.map((h) => (
                    <CampusCard key={h.id} style={styles.card} elevation="sm">
                      <View style={styles.bookHeader}>
                        <View style={styles.bookIconPlaceholder}>
                          <Book size={20} color={Colors.TealTertiary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.bookTitle}>{h.title}</Text>
                          <Text style={styles.bookAuthor}>Author: {h.author}</Text>
                        </View>
                        <StatusChip text="RETURNED" level="SAFE" />
                      </View>
                      <View style={styles.divider} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text style={styles.bookMetaLabel}>Issue Date: <Text style={styles.bookMetaVal}>{h.issueDate}</Text></Text>
                        <Text style={styles.bookMetaLabel}>Returned: <Text style={styles.bookMetaVal}>{h.returnDate}</Text></Text>
                        <Text style={styles.bookMetaLabel}>Days Held: <Text style={styles.bookMetaVal}>{h.totalDays}</Text></Text>
                        <Text style={styles.bookMetaLabel}>Renewals: <Text style={styles.bookMetaVal}>{h.renewCount}</Text></Text>
                      </View>
                    </CampusCard>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Leave Application Modal */}
      <Modal visible={showLeaveModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowLeaveModal(false); setEditingLeaveId(null); setLeaveReason(''); }} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {editingLeaveId ? 'Edit Leave Application' : 'Apply For Leave'}
                </Text>
                <Pressable onPress={() => { setShowLeaveModal(false); setEditingLeaveId(null); setLeaveReason(''); }} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              <ScrollView 
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Leave Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipSelectorGroup}>
                    {['Casual Leave', 'Medical Leave', 'Duty Leave', 'Earned Leave', 'Loss of Pay', 'Maternity/Paternity Leave'].map((type) => (
                      <Pressable
                        key={type}
                        style={[styles.selectorChip, leaveType === type && styles.selectorChipActive]}
                        onPress={() => setLeaveType(type)}
                      >
                        <Text style={[styles.selectorChipText, leaveType === type && styles.selectorChipTextActive]}>
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Start Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={leaveStart}
                    onChangeText={setLeaveStart}
                    placeholder="e.g. 08 Jul 2026"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>End Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={leaveEnd}
                    onChangeText={setLeaveEnd}
                    placeholder="e.g. 09 Jul 2026"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                  />
                </View>

                <View style={styles.formRowBetween}>
                  <Text style={styles.formLabel}>Half Day Application</Text>
                  <Pressable 
                    style={[styles.toggleBtn, halfDay && styles.toggleBtnActive]}
                    onPress={() => setHalfDay(!halfDay)}
                  >
                    <Text style={[styles.toggleBtnText, halfDay && styles.toggleBtnTextActive]}>
                      {halfDay ? 'YES' : 'NO'}
                    </Text>
                  </Pressable>
                </View>

                {/* Duration Preview */}
                {(() => {
                  const start = parseDateString(leaveStart);
                  const end = parseDateString(leaveEnd);
                  if (start && end && start <= end) {
                    const days = getDaysCount(start, end, halfDay);
                    return (
                      <View style={styles.durationPreviewBox}>
                        <Text style={styles.durationPreviewTxt}>
                          Calculated Duration: <Text style={{ fontWeight: '900', color: Colors.BluePrimary }}>{days} {days === 1 ? 'Day' : 'Days'}</Text> (excluding weekends & holidays)
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Emergency Contact</Text>
                  <TextInput
                    style={styles.textInput}
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                    placeholder="e.g. +91 98765 00001"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Document Attachment (Mock)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={attachmentName}
                    onChangeText={setAttachmentName}
                    placeholder="e.g. medical_report.pdf (optional)"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Reason / Remarks</Text>
                  <TextInput
                    style={styles.textInputArea}
                    value={leaveReason}
                    onChangeText={setLeaveReason}
                    placeholder="Provide description for applying leave..."
                    placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <CustomButton 
                  text={editingLeaveId ? 'Save Changes' : 'Submit Application'} 
                  onPress={handleApplyLeave} 
                  style={{ marginTop: 12 }} 
                />
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Leave Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowDetailsModal(false); setSelectedLeave(null); }} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Leave Application Details</Text>
              <Pressable onPress={() => { setShowDetailsModal(false); setSelectedLeave(null); }} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            {selectedLeave && (
              <ScrollView 
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Details Section */}
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Leave Type:</Text>
                    <Text style={styles.detailValue}>{selectedLeave.leaveType}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Allocation Year:</Text>
                    <Text style={styles.detailValue}>{selectedLeave.allocationYear}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied Date:</Text>
                    <Text style={styles.detailValue}>{selectedLeave.appliedDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Leave Duration:</Text>
                    <Text style={styles.detailValue}>
                      {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} {selectedLeave.totalDays === 1 ? 'Day' : 'Days'})
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Half Day:</Text>
                    <Text style={styles.detailValue}>{selectedLeave.halfDay ? 'Yes' : 'No'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Emergency Contact:</Text>
                    <Text style={styles.detailValue}>{selectedLeave.emergencyContact || 'None'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Attachment (Mock):</Text>
                    <Text style={[styles.detailValue, { color: Colors.BluePrimary, textDecorationLine: 'underline' }]}>
                      {selectedLeave.attachmentName || 'None'}
                    </Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Reason:</Text>
                    <Text style={styles.detailText}>{selectedLeave.reason}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Approval Timeline */}
                {(() => {
                  const lv = selectedLeave;
                  const isVerified = ['VERIFIED', 'APPROVED', 'COMPLETED', 'REJECTED'].includes(lv.status);
                  const isApproved = ['APPROVED', 'COMPLETED'].includes(lv.status);
                  const isRejected = lv.status === 'REJECTED';
                  const isCancelled = lv.status === 'CANCELLED';

                  return (
                    <View style={styles.timelineContainer}>
                      <Text style={styles.timelineTitle}>Approval Timeline</Text>
                      
                      {/* Step 1: Applied */}
                      <View style={styles.timelineRow}>
                        <View style={styles.timelineIconCol}>
                          <View style={[styles.timelineNode, styles.timelineNodeActive]}>
                            <Check size={10} color="#FFFFFF" />
                          </View>
                          <View style={[styles.timelineLine, (isVerified || isCancelled) && styles.timelineLineActive]} />
                        </View>
                        <View style={styles.timelineContentCol}>
                          <Text style={styles.timelineNodeTitle}>Leave Applied</Text>
                          <Text style={styles.timelineNodeSub}>Submitted to HOD Office</Text>
                          <Text style={styles.timelineNodeTime}>{lv.appliedDate} 09:30 AM</Text>
                        </View>
                      </View>

                      {/* Step 2: Cancelled OR Verified */}
                      {isCancelled ? (
                        <View style={styles.timelineRow}>
                          <View style={styles.timelineIconCol}>
                            <View style={[styles.timelineNode, { backgroundColor: Colors.RedError }]}>
                              <X size={10} color="#FFFFFF" />
                            </View>
                          </View>
                          <View style={styles.timelineContentCol}>
                            <Text style={styles.timelineNodeTitle}>Application Cancelled</Text>
                            <Text style={styles.timelineNodeSub}>Cancelled by Faculty</Text>
                            <Text style={styles.timelineNodeTime}>{lv.appliedDate} 10:15 AM</Text>
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={styles.timelineRow}>
                            <View style={styles.timelineIconCol}>
                              <View style={[styles.timelineNode, isVerified && styles.timelineNodeActive]}>
                                {isVerified && <Check size={10} color="#FFFFFF" />}
                              </View>
                              <View style={[styles.timelineLine, (isApproved || isRejected) && styles.timelineLineActive]} />
                            </View>
                            <View style={styles.timelineContentCol}>
                              <Text style={[styles.timelineNodeTitle, !isVerified && styles.timelineNodeTextPending]}>
                                Verified by Coordinator
                              </Text>
                              <Text style={styles.timelineNodeSub}>
                                {isVerified ? 'Department clearance completed' : 'Awaiting verification'}
                              </Text>
                              {isVerified && <Text style={styles.timelineNodeTime}>{lv.appliedDate} 02:15 PM</Text>}
                            </View>
                          </View>

                          {/* Step 3: Approved / Rejected */}
                          <View style={styles.timelineRow}>
                            <View style={styles.timelineIconCol}>
                              <View style={[
                                styles.timelineNode, 
                                isApproved && styles.timelineNodeActive,
                                isRejected && { backgroundColor: Colors.RedError }
                              ]}>
                                {isApproved && <Check size={10} color="#FFFFFF" />}
                                {isRejected && <X size={10} color="#FFFFFF" />}
                              </View>
                            </View>
                            <View style={styles.timelineContentCol}>
                              <Text style={[
                                styles.timelineNodeTitle, 
                                !isApproved && !isRejected && styles.timelineNodeTextPending,
                                isRejected && { color: Colors.RedError }
                              ]}>
                                {isApproved ? 'Approved by HOD' : isRejected ? 'Rejected by HOD' : 'Final Approval'}
                              </Text>
                              <Text style={styles.timelineNodeSub}>
                                {isApproved ? 'Leave request is active' : isRejected ? 'Request rejected' : 'Awaiting HOD/Principal signoff'}
                              </Text>
                              {(isApproved || isRejected) && <Text style={styles.timelineNodeTime}>{lv.appliedDate} 04:30 PM</Text>}
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  );
                })()}

                {/* Additional actions inside details */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  {(selectedLeave.status === 'APPLIED' || selectedLeave.status === 'PENDING') && (
                    <>
                      <CustomButton 
                        text="Edit Request" 
                        onPress={() => {
                          const lv = selectedLeave;
                          setShowDetailsModal(false);
                          setSelectedLeave(null);
                          handleEditLeavePress(lv);
                        }}
                        style={{ flex: 1 }}
                      />
                      <CustomButton 
                        text="Cancel Request" 
                        onPress={() => {
                          const id = selectedLeave.id;
                          setShowDetailsModal(false);
                          setSelectedLeave(null);
                          handleCancelLeave(id);
                        }}
                        style={{ flex: 1, backgroundColor: Colors.ColorAbsent }}
                      />
                    </>
                  )}
                  {selectedLeave.status === 'REJECTED' && (
                    <CustomButton 
                      text="Duplicate & Re-apply" 
                      onPress={() => {
                        const lv = selectedLeave;
                        setShowDetailsModal(false);
                        setSelectedLeave(null);
                        handleDuplicateLeave(lv);
                      }}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Book Details Modal */}
      <Modal visible={showBookDetailsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowBookDetailsModal(false); setSelectedBook(null); }} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Book Catalog Details</Text>
              <Pressable onPress={() => { setShowBookDetailsModal(false); setSelectedBook(null); }} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            {selectedBook && (
              <ScrollView 
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Book Details section */}
                <View style={styles.bookDetailsSection}>
                  <View style={styles.bookDetailsCoverPlaceholder}>
                    <Book size={48} color={Colors.BluePrimary} />
                  </View>
                  
                  <Text style={styles.bookDetailsTitle}>{selectedBook.title}</Text>
                  <Text style={styles.bookDetailsAuthor}>Author: {selectedBook.author}</Text>
                  
                  <View style={[styles.divider, { marginVertical: 8 }]} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedBook.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Publisher:</Text>
                    <Text style={styles.detailValue}>{selectedBook.publisher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Edition:</Text>
                    <Text style={styles.detailValue}>{selectedBook.edition}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ISBN:</Text>
                    <Text style={styles.detailValue}>{selectedBook.isbn}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Language:</Text>
                    <Text style={styles.detailValue}>{selectedBook.language}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Access Number:</Text>
                    <Text style={styles.detailValue}>{selectedBook.accessNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rack Location:</Text>
                    <Text style={[styles.detailValue, { color: Colors.BluePrimary }]}>{selectedBook.rackNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Available Copies:</Text>
                    <Text style={styles.detailValue}>{selectedBook.availableCopies} of {selectedBook.totalCopies}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Availability Status:</Text>
                    <StatusChip 
                      text={selectedBook.status}
                      level={selectedBook.status === 'AVAILABLE' ? 'SAFE' : selectedBook.status === 'ISSUED' ? 'WARNING' : 'LOW'}
                    />
                  </View>

                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.bookDetailsDesc}>{selectedBook.description}</Text>
                  </View>
                </View>

                {/* Related Books */}
                <View style={[styles.divider, { marginVertical: 12 }]} />
                <Text style={styles.relatedTitle}>Related Books</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
                  {allBooks
                    .filter(b => b.category === selectedBook.category && b.id !== selectedBook.id)
                    .map(rel => (
                      <Pressable 
                        key={rel.id} 
                        style={styles.relatedCard}
                        onPress={() => setSelectedBook(rel)}
                      >
                        <Book size={20} color={Colors.BluePrimary} />
                        <Text style={styles.relatedBookTitle} numberOfLines={1}>{rel.title}</Text>
                        <Text style={styles.relatedBookAuthor} numberOfLines={1}>{rel.author}</Text>
                        <StatusChip text={rel.status} level={rel.status === 'AVAILABLE' ? 'SAFE' : 'WARNING'} />
                      </Pressable>
                    ))}
                  {allBooks.filter(b => b.category === selectedBook.category && b.id !== selectedBook.id).length === 0 && (
                    <Text style={styles.noRelatedText}>No related books in this category.</Text>
                  )}
                </ScrollView>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Placement Drive Details Modal */}
      <Modal visible={showDriveDetailsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowDriveDetailsModal(false); setSelectedDrive(null); }} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Recruitment Drive Details</Text>
              <Pressable onPress={() => { setShowDriveDetailsModal(false); setSelectedDrive(null); }} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            {selectedDrive && (
              <ScrollView 
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header Information */}
                <View style={styles.bookDetailsSection}>
                  <View style={styles.bookDetailsCoverPlaceholder}>
                    <Briefcase size={36} color={Colors.BluePrimary} />
                  </View>
                  <Text style={styles.bookDetailsTitle}>{selectedDrive.companyName}</Text>
                  <Text style={styles.bookDetailsAuthor}>{selectedDrive.role} · {selectedDrive.jobType}</Text>
                  <StatusChip 
                    text={selectedDrive.status.replace('_', ' ')}
                    level={
                      selectedDrive.status === 'REGISTRATION_OPEN' ? 'NOW' :
                      selectedDrive.status === 'ONGOING' ? 'WARNING' :
                      selectedDrive.status === 'COMPLETED' ? 'SAFE' : 'LOW'
                    }
                  />
                </View>

                <View style={[styles.divider, { marginVertical: 8 }]} />

                {/* Job Overview details */}
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Package Offered:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.package}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Drive Date:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.driveDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reg Deadline:</Text>
                    <Text style={[styles.detailValue, { color: Colors.RedError }]}>{selectedDrive.deadline}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>HR Contact:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.hrContact}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Venue:</Text>
                    <Text style={[styles.detailValue, { color: Colors.BluePrimary }]}>{selectedDrive.venue}</Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Selection Rounds:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.selectionProcess.join(' ➔ ')}</Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Job Description:</Text>
                    <Text style={styles.bookDetailsDesc}>{selectedDrive.jobDescription}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { marginVertical: 12 }]} />

                {/* Eligibility Criteria */}
                <Text style={styles.relatedTitle}>Eligibility Criteria</Text>
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Minimum CGPA:</Text>
                    <Text style={[styles.detailValue, { color: Colors.ColorPresent, fontWeight: '800' }]}>
                      {selectedDrive.minCgpa} CGPA
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Passing Year:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.passingYear}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Eligible Departments:</Text>
                    <Text style={styles.detailValue}>{selectedDrive.departments.join(', ')}</Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Required Skills:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {selectedDrive.skills.map((skill, idx) => (
                        <View key={idx} style={styles.smallFilterChipActive}>
                          <Text style={[styles.smallFilterChipTxtActive, { fontSize: 10 }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { marginVertical: 12 }]} />

                {/* Drive Progress Timeline */}
                <Text style={styles.relatedTitle}>Drive Progress Timeline</Text>
                <View style={styles.timelineContainer}>
                  {selectedDrive.timelineSteps.map((step, idx) => {
                    const isCompleted = idx < selectedDrive.currentTimelineStepIndex;
                    const isCurrent = idx === selectedDrive.currentTimelineStepIndex;
                    const isLast = idx === selectedDrive.timelineSteps.length - 1;

                    return (
                      <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineIconCol}>
                          <View style={[
                            styles.timelineNode, 
                            isCompleted && styles.timelineNodeActive,
                            isCurrent && { backgroundColor: Colors.BluePrimary }
                          ]}>
                            {isCompleted ? <Check size={10} color="#FFFFFF" /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isCurrent ? '#FFFFFF' : '#CBD5E1' }} />}
                          </View>
                          {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />}
                        </View>
                        <View style={styles.timelineContentCol}>
                          <Text style={[
                            styles.timelineNodeTitle, 
                            !isCompleted && !isCurrent && styles.timelineNodeTextPending,
                            isCurrent && { color: Colors.BluePrimary }
                          ]}>
                            {step} {isCurrent && '(Active)'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.divider, { marginVertical: 12 }]} />

                {/* Students Lists Tabs */}
                <View style={styles.subTabBar}>
                  {[
                    { key: 'ELIGIBLE', label: 'Eligible' },
                    { key: 'REGISTERED', label: 'Registered' },
                    { key: 'RESULTS', label: 'Results/Offers' },
                  ].map((tab) => {
                    const active = driveModalSubTab === tab.key;
                    return (
                      <Pressable
                        key={tab.key}
                        style={[styles.subTabItem, active && styles.subTabItemActive]}
                        onPress={() => setDriveModalSubTab(tab.key as any)}
                      >
                        <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{tab.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Sub-Tab 1: Eligible Students */}
                {driveModalSubTab === 'ELIGIBLE' && (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    {(() => {
                      const list = placementStudents.filter(
                        s => s.driveId === selectedDrive.id && s.currentStatus === 'ELIGIBLE'
                      );
                      if (list.length === 0) {
                        return <Text style={styles.noRelatedText}>No eligible students found in the roster.</Text>;
                      }
                      return list.map(student => (
                        <View key={student.id} style={styles.studentDetailsRowBox}>
                          <View>
                            <Text style={styles.studentNameTxt}>{student.name}</Text>
                            <Text style={styles.studentRegTxt}>{student.registerNumber} · {student.department}</Text>
                          </View>
                          <Text style={styles.studentCgpaTxt}>{student.cgpa} CGPA</Text>
                        </View>
                      ));
                    })()}
                  </View>
                )}

                {/* Sub-Tab 2: Registered Students */}
                {driveModalSubTab === 'REGISTERED' && (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    {(() => {
                      const list = placementStudents.filter(
                        s => s.driveId === selectedDrive.id && s.currentStatus !== 'ELIGIBLE'
                      );
                      if (list.length === 0) {
                        return <Text style={styles.noRelatedText}>No registrations logged for this drive yet.</Text>;
                      }
                      return list.map(student => (
                        <View key={student.id} style={styles.studentDetailsRowBox}>
                          <View>
                            <Text style={styles.studentNameTxt}>{student.name}</Text>
                            <Text style={styles.studentRegTxt}>{student.registerNumber} · {student.department}</Text>
                          </View>
                          <StatusChip 
                            text={student.currentStatus} 
                            level={
                              student.currentStatus === 'SELECTED' ? 'SAFE' :
                              student.currentStatus === 'REJECTED' ? 'LOW' :
                              'WARNING'
                            }
                          />
                        </View>
                      ));
                    })()}
                  </View>
                )}

                {/* Sub-Tab 3: Final Results */}
                {driveModalSubTab === 'RESULTS' && (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    {(() => {
                      const list = placementStudents.filter(
                        s => s.driveId === selectedDrive.id && s.currentStatus === 'SELECTED'
                      );
                      if (list.length === 0) {
                        return <Text style={styles.noRelatedText}>No selections finalized for this drive yet.</Text>;
                      }
                      return list.map(student => (
                        <View key={student.id} style={styles.studentDetailsRowBox}>
                          <View>
                            <Text style={styles.studentNameTxt}>{student.name}</Text>
                            <Text style={styles.studentRegTxt}>{student.registerNumber} · {student.department}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.studentCgpaTxt, { color: Colors.ColorPresent }]}>OFFER SECURED</Text>
                            <Text style={[styles.studentRegTxt, { fontSize: 10 }]}>{selectedDrive.package}</Text>
                          </View>
                        </View>
                      ));
                    })()}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* College Event Details Modal */}
      <Modal visible={showEventDetailsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowEventDetailsModal(false); setSelectedEvent(null); }} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>College Event Details</Text>
              <Pressable onPress={() => { setShowEventDetailsModal(false); setSelectedEvent(null); }} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            {selectedEvent && (
              <ScrollView 
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Banner Banner / Overview */}
                <View style={styles.bookDetailsSection}>
                  <View style={[styles.bookDetailsCoverPlaceholder, { backgroundColor: Colors.BluePrimaryContainer }]}>
                    <Calendar size={36} color={Colors.BluePrimary} />
                  </View>
                  <Text style={styles.bookDetailsTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.bookDetailsAuthor}>Coordinator: {selectedEvent.coordinator}</Text>
                  <StatusChip 
                    text={selectedEvent.status}
                    level={
                      selectedEvent.status === 'TODAY' || selectedEvent.status === 'ONGOING' ? 'NOW' :
                      selectedEvent.status === 'UPCOMING' ? 'WARNING' :
                      selectedEvent.status === 'COMPLETED' ? 'SAFE' : 'LOW'
                    }
                  />
                </View>

                <View style={[styles.divider, { marginVertical: 8 }]} />

                {/* Duty Assigned Info Box */}
                <CampusCard style={{ backgroundColor: '#F8FAFC', padding: 12, marginVertical: 8 }} elevation="sm">
                  <Text style={[styles.detailLabel, { fontSize: 11, color: Colors.BluePrimary, fontWeight: '800' }]}>YOUR ASSIGNED DUTY</Text>
                  <Text style={[styles.bookDetailsTitle, { fontSize: 16, marginTop: 4 }]}>{selectedEvent.assignedDuty}</Text>
                  
                  <View style={[styles.divider, { marginVertical: 8 }]} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.detailLabel}>Reporting Time</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>{selectedEvent.reportingTime}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Dress Code</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>{selectedEvent.dressCode}</Text>
                    </View>
                  </View>
                </CampusCard>

                {/* Event Details Grid */}
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Venue:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.venue}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.startTime} – {selectedEvent.endTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Committee:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.assignedCommittee}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Emergency Contact:</Text>
                    <Text style={styles.detailValue}>{selectedEvent.emergencyContact}</Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Special Instructions:</Text>
                    <Text style={styles.bookDetailsDesc}>{selectedEvent.specialInstructions}</Text>
                  </View>
                  <View style={styles.detailRowCol}>
                    <Text style={styles.detailLabel}>Required Documents:</Text>
                    <View style={{ gap: 4, marginTop: 4 }}>
                      {selectedEvent.requiredDocuments.map((doc, idx) => (
                        <Text key={idx} style={styles.studentRegTxt}>📄 {doc}</Text>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { marginVertical: 12 }]} />

                {/* Duty Timeline */}
                <Text style={styles.relatedTitle}>Duty Progress Timeline</Text>
                <View style={styles.timelineContainer}>
                  {selectedEvent.timelineSteps.map((step, idx) => {
                    const isCompleted = idx < selectedEvent.currentTimelineStepIndex;
                    const isCurrent = idx === selectedEvent.currentTimelineStepIndex;
                    const isLast = idx === selectedEvent.timelineSteps.length - 1;

                    return (
                      <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineIconCol}>
                          <View style={[
                            styles.timelineNode, 
                            isCompleted && styles.timelineNodeActive,
                            isCurrent && { backgroundColor: Colors.BluePrimary }
                          ]}>
                            {isCompleted ? <Check size={10} color="#FFFFFF" /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isCurrent ? '#FFFFFF' : '#CBD5E1' }} />}
                          </View>
                          {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />}
                        </View>
                        <View style={styles.timelineContentCol}>
                          <Text style={[
                            styles.timelineNodeTitle, 
                            !isCompleted && !isCurrent && styles.timelineNodeTextPending,
                            isCurrent && { color: Colors.BluePrimary }
                          ]}>
                            {step} {isCurrent && '(Active)'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Action Buttons */}
                <View style={{ marginTop: 16 }}>
                  {selectedEvent.dutyStatus === 'ASSIGNED' && selectedEvent.status !== 'COMPLETED' && (
                    <CustomButton 
                      text="Confirm Duty Assignment"
                      onPress={() => handleConfirmDuty(selectedEvent.id)}
                    />
                  )}
                  {selectedEvent.dutyStatus === 'CONFIRMED' && (
                    <View style={styles.confirmedBadgeBox}>
                      <Check size={16} color={Colors.ColorPresent} />
                      <Text style={styles.confirmedBadgeTxt}>Duty Assignment Confirmed</Text>
                    </View>
                  )}
                  {selectedEvent.status === 'COMPLETED' && (
                    <View style={styles.completedBadgeBox}>
                      <Text style={styles.completedBadgeTxt}>Event Completed & Duty Concluded</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  spacer: { width: 40 },
  tabBar: {
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: Colors.BluePrimary,
  },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  tabLabelActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  tabPane: { gap: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginTop: 4 },
  addBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  card: { padding: 16, gap: 12 },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaveType: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  leaveDays: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  leaveReason: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 18, marginTop: 4 },
  eventHeader: { flexDirection: 'row', alignItems: 'center' },
  eventDateBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: Colors.BluePrimaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateDay: { fontSize: 20, fontWeight: '900', color: Colors.BluePrimary },
  eventDateMonth: { fontSize: 10, fontWeight: '800', color: Colors.BluePrimary, marginTop: 2 },
  eventTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  eventMeta: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  eventDuty: { fontSize: 12, fontWeight: '700', color: Colors.BluePrimary, marginTop: 4 },
  placementHeader: { flexDirection: 'row', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  companyRole: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.AppOutline },
  placementDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  placementCol: { gap: 2 },
  placementLabel: { fontSize: 10, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  placementValue: { fontSize: 13, fontWeight: '700', color: Colors.AppOnBackground },
  searchBar: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.AppOnBackground,
  },
  bookHeader: { flexDirection: 'row', alignItems: 'center' },
  bookTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  bookAuthor: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  bookDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bookMetaLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  bookMetaVal: { fontWeight: '700', color: Colors.AppOnBackground },
  renewBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  renewBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 10,
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  formGroup: { gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  chipSelectorGroup: { flexDirection: 'row', gap: 8 },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  selectorChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  selectorChipText: { fontSize: 12, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  selectorChipTextActive: { color: '#FFFFFF' },
  textInput: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.AppOnBackground,
  },
  textInputArea: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 12,
    fontSize: 14,
    color: Colors.AppOnBackground,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  allocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  allocationBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.BluePrimary,
  },
  allocDropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 120,
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  allocDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  allocDropdownItemTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  balanceGrid: {
    paddingVertical: 4,
    gap: 12,
  },
  balanceCard: {
    width: 130,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.AppSurface,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    gap: 6,
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
  },
  balanceCardNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceCardRemaining: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.BluePrimary,
  },
  balanceCardTotal: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    marginLeft: 2,
  },
  balanceCardUsed: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TealTertiary,
  },
  filterChipsRow: {
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  filterChipActive: {
    backgroundColor: Colors.BluePrimaryContainer,
    borderColor: Colors.BluePrimary,
  },
  filterChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  filterChipTxtActive: {
    color: Colors.BluePrimary,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: Colors.AppSurface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  leaveAppliedDate: {
    fontSize: 10,
    color: Colors.AppOnSurfaceVariant,
    marginTop: 4,
    fontWeight: '500',
  },
  leaveCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.AppOutline,
    paddingTop: 10,
  },
  iconActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconActionBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  toggleBtnActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  durationPreviewBox: {
    backgroundColor: Colors.BluePrimaryContainer + '40',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BluePrimaryContainer,
  },
  durationPreviewTxt: {
    fontSize: 12,
    color: Colors.BlueOnPrimaryContainer,
    fontWeight: '600',
  },
  detailSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowCol: {
    gap: 6,
    paddingTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  detailText: {
    fontSize: 13,
    color: Colors.AppOnBackground,
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  timelineContainer: {
    gap: 16,
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 20,
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineNodeActive: {
    backgroundColor: Colors.ColorPresent,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: -2,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: Colors.ColorPresent,
  },
  timelineContentCol: {
    flex: 1,
    gap: 2,
  },
  timelineNodeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  timelineNodeTextPending: {
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
  },
  timelineNodeSub: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
  },
  timelineNodeTime: {
    fontSize: 9,
    color: Colors.TealTertiary,
    fontWeight: '700',
    marginTop: 2,
  },
  formRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    gap: 12,
    paddingVertical: 4,
  },
  statCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.AppSurface,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    gap: 4,
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
    textTransform: 'uppercase',
  },
  statCardVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.BluePrimary,
  },
  statCardDesc: {
    fontSize: 9,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 12,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginTop: 8,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabItemActive: {
    backgroundColor: Colors.AppSurface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subTabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  subTabLabelActive: {
    color: Colors.BluePrimary,
  },
  catalogFiltersCol: {
    gap: 10,
    paddingBottom: 4,
  },
  smallFilterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  smallFilterChipActive: {
    backgroundColor: Colors.BluePrimaryContainer,
    borderColor: Colors.BluePrimary,
  },
  smallFilterChipTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  smallFilterChipTxtActive: {
    color: Colors.BluePrimary,
  },
  dropdownPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterMiniLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    backgroundColor: '#F8FAFC',
  },
  miniChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  miniChipTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  miniChipTxtActive: {
    color: '#FFFFFF',
  },
  bookIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDetailsSection: {
    alignItems: 'center',
    gap: 12,
  },
  bookDetailsCoverPlaceholder: {
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: Colors.BluePrimaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.BluePrimaryContainer,
  },
  bookDetailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    textAlign: 'center',
  },
  bookDetailsAuthor: {
    fontSize: 13,
    color: Colors.AppOnSurfaceVariant,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookDetailsDesc: {
    fontSize: 12,
    color: Colors.AppOnBackground,
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    marginBottom: 8,
  },
  relatedRow: {
    gap: 12,
  },
  relatedCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
    alignItems: 'center',
    gap: 6,
  },
  relatedBookTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    textAlign: 'center',
    width: '100%',
  },
  relatedBookAuthor: {
    fontSize: 9,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
    width: '100%',
  },
  noRelatedText: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
    fontStyle: 'italic',
  },
  filterDropdownsContainer: {
    gap: 8,
    marginVertical: 4,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTitleLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  dropdownsGrid: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 9999,
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
    gap: 4,
  },
  filterDropdownBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
    flex: 1,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    backgroundColor: Colors.AppSurface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  filterDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterDropdownItemActive: {
    backgroundColor: Colors.BluePrimaryContainer,
  },
  filterDropdownItemTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  filterDropdownItemTxtActive: {
    color: Colors.BluePrimary,
    fontWeight: '800',
  },
  studentDetailsRowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
  },
  studentNameTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  studentRegTxt: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
    marginTop: 2,
  },
  studentCgpaTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.BluePrimary,
  },
  todayDutyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayDutyBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: Colors.BluePrimary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  todayDutyTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.RedError,
  },
  todayDutyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    marginBottom: 4,
  },
  todayDutyVenue: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    marginBottom: 10,
  },
  todayDutyRoleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.AppOutline,
  },
  todayDutyRoleLabel: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
  },
  todayDutyRoleVal: {
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  todayDutyBtn: {
    backgroundColor: Colors.BluePrimaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  todayDutyBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
  confirmedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  confirmedBadgeTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ColorPresent,
  },
  completedBadgeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  completedBadgeTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventDateBox: {
    width: 50,
    height: 54,
    borderRadius: 8,
    backgroundColor: Colors.BluePrimaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  eventDateDay: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.BluePrimary,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.BluePrimary,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  eventMeta: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
    marginBottom: 4,
  },
  eventDuty: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
});
