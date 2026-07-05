import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  BookOpen,
  FileText,
  Wallet,
  Briefcase,
  Megaphone,
  Bell,
  Users,
  User,
  Settings,
  X,
  Download,
  Plus,
  XCircle,
  Upload,
  ChevronDown,
  Check,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { getDayOrder, DAY_ORDER_MAP } from "../../../src/utils/dayOrder";
import { Colors } from "../../../src/theme";

interface MenuItem {
  title: string;
  subtitle: string;
  route?: string;
  icon: React.ReactNode;
  isMockAction?: "PAYROLL" | "CERTIFICATES";
  isSubModal?: "SUSPENSION" | "AUDIT" | "BATCH_TT" | "DEPT_TT";
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface TimetablePeriod {
  subject: string;
  code: string;
  faculty: string;
  room: string;
  credits: number;
  type: 'Theory' | 'Lab';
  status: 'Normal' | 'Replacement' | 'Suspended';
}

interface TimetableDayOrderRow {
  dayOrder: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';
  h1: TimetablePeriod;
  h2: TimetablePeriod;
  h3: TimetablePeriod;
  h4: TimetablePeriod;
  h5: TimetablePeriod;
}

const DEFAULT_PERIODS: Record<string, Omit<TimetablePeriod, 'status'>> = {
  DBMS: { subject: "Database Management System", code: "CS301", faculty: "Dr P Rizwan Ahmed", room: "LH-01", credits: 4, type: "Theory" },
  OS: { subject: "Operating System", code: "CS201", faculty: "Dr. K H KALEEMULLAH", room: "LH-01", credits: 4, type: "Theory" },
  MAT: { subject: "Mathematics II", code: "MA102", faculty: "Prof. S. Tamilselvan", room: "LH-01", credits: 3, type: "Theory" },
  ENG: { subject: "English II", code: "EN101", faculty: "Prof. H. Shabana", room: "LH-01", credits: 3, type: "Theory" },
  LAB: { subject: "DBMS Laboratory", code: "CS301P", faculty: "Dr P Rizwan Ahmed", room: "Lab-A", credits: 2, type: "Lab" },
  SEM: { subject: "Seminar & HOD Class", code: "CS105", faculty: "Dr. AYESHA SIDDIQUA J", room: "LH-01", credits: 1, type: "Theory" },
  LIB: { subject: "Library Reference", code: "LB101", faculty: "Librarian", room: "Library", credits: 1, type: "Theory" },
};

const BATCH_YEARS = ['2026-27', '2025-26', '2024-25', '2023-24'];

const generateMockTimetable = (shift: string, batch: string, year: string): TimetableDayOrderRow[] => {
  const isShiftII = shift === 'SHIFT_II';
  const isGirls = shift === 'GIRLS';
  // Vary subject codes by year so data feels dynamic
  const yearSuffix = year === '2026-27' ? '' : year === '2025-26' ? '-E' : year === '2024-25' ? '-D' : '-C';

  const getPeriod = (name: string, status: 'Normal' | 'Replacement' | 'Suspended' = 'Normal'): TimetablePeriod => {
    const base = DEFAULT_PERIODS[name] || DEFAULT_PERIODS.DBMS;
    let room = base.room;
    let faculty = base.faculty;
    const code = base.code ? base.code + yearSuffix : undefined;
    if (batch.includes("II")) {
      room = room.replace("LH-01", "LH-02").replace("Lab-A", "Lab-B");
      faculty = faculty === "Dr P Rizwan Ahmed" ? "Dr. AYESHA SIDDIQUA J" : faculty;
    } else if (batch.includes("III")) {
      room = room.replace("LH-01", "LH-03").replace("Lab-A", "Lab-C");
      faculty = faculty === "Dr. K H KALEEMULLAH" ? "Dr. AYESHA SIDDIQUA J" : faculty;
    }
    if (isShiftII) {
      room += " (Shift II)";
    } else if (isGirls) {
      room += " (Girls)";
    }
    return { ...base, room, faculty, status };
  };

  return [
    {
      dayOrder: "D1",
      h1: getPeriod("DBMS"),
      h2: getPeriod("OS"),
      h3: getPeriod("MAT"),
      h4: getPeriod("ENG"),
      h5: getPeriod("LAB"),
    },
    {
      dayOrder: "D2",
      h1: getPeriod("OS"),
      h2: getPeriod("DBMS"),
      h3: getPeriod("ENG"),
      h4: getPeriod("MAT", "Replacement"),
      h5: getPeriod("SEM"),
    },
    {
      dayOrder: "D3",
      h1: getPeriod("MAT"),
      h2: getPeriod("ENG"),
      h3: getPeriod("DBMS", "Suspended"),
      h4: getPeriod("OS"),
      h5: getPeriod("LAB"),
    },
    {
      dayOrder: "D4",
      h1: getPeriod("DBMS"),
      h2: getPeriod("OS"),
      h3: getPeriod("MAT"),
      h4: getPeriod("LAB"),
      h5: getPeriod("LAB"),
    },
    {
      dayOrder: "D5",
      h1: getPeriod("OS"),
      h2: getPeriod("DBMS"),
      h3: getPeriod("ENG"),
      h4: getPeriod("MAT"),
      h5: getPeriod("LIB"),
    },
    {
      dayOrder: "D6",
      h1: getPeriod("OS"),
      h2: getPeriod("MAT"),
      h3: getPeriod("DBMS"),
      h4: getPeriod("SEM"),
      h5: getPeriod("LAB", "Replacement"),
    },
  ];
};

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  // Mock State for Modals
  const [showPayrollModal, setShowPayrollModal] = React.useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = React.useState(false);
  const [activeSubModal, setActiveSubModal] = React.useState<"SUSPENSION" | "AUDIT" | "BATCH_TT" | "DEPT_TT" | null>(null);

  // Certificate Requests State
  const [certType, setCertType] = React.useState("Service Certificate");
  const [certPurpose, setCertPurpose] = React.useState("");
  const [showCertDropdown, setShowCertDropdown] = React.useState(false);
  const [certRequests, setCertRequests] = React.useState([
    { id: "1", type: "NOC for Passport", date: "15 Jun 2026", status: "APPROVED" },
    { id: "2", type: "Service Certificate", date: "02 Jan 2026", status: "COMPLETED" },
  ]);

  // Relocated states
  // 1. Suspension
  const [suspDate, setSuspDate] = React.useState("07 Jul 2026");
  const [suspHours, setSuspHours] = React.useState("1st & 2nd Hour");
  const [suspReason, setSuspReason] = React.useState("");
  const [suspShift, setSuspShift] = React.useState<'SHIFT_I' | 'SHIFT_II' | 'GIRLS'>('SHIFT_I');
  const [activeSuspFilterTab, setActiveSuspFilterTab] = React.useState<'SHIFT_I' | 'SHIFT_II' | 'GIRLS'>('SHIFT_I');
  const [suspensions, setSuspensions] = React.useState([
    { id: "1", date: "30 Jun 2026", hours: "All Day", reason: "Annual Sports Day Meet", status: "SUSPENDED", shift: "SHIFT_I" },
    { id: "2", date: "07 Jul 2026", hours: "1st & 2nd Hour", reason: "Cia exam", status: "SUBMITTED", shift: "SHIFT_I" },
  ]);

  // 2. Work Audit
  const [auditMonth, setAuditMonth] = React.useState("June 2026");
  const [uploadedFile, setUploadedFile] = React.useState<string | null>(null);



  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/faculty" as any);
    }
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.isMockAction === "PAYROLL") {
      setShowPayrollModal(true);
    } else if (item.isMockAction === "CERTIFICATES") {
      setShowCertificatesModal(true);
    } else if (item.isSubModal) {
      setActiveSubModal(item.isSubModal);
    }
  };

  const handleRequestCertificate = () => {
    if (!certPurpose.trim()) {
      Alert.alert("Error", "Please provide a purpose for the certificate request.");
      return;
    }

    const newRequest = {
      id: String(certRequests.length + 1),
      type: certType,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "PENDING",
    };

    setCertRequests([newRequest, ...certRequests]);
    setCertPurpose("");
    Alert.alert("Success", `${certType} request submitted to the admin office.`);
  };

  const handleAddSuspension = () => {
    if (!suspReason.trim()) {
      Alert.alert("Error", "Please provide a reason for the timetable suspension.");
      return;
    }
    const newSusp = {
      id: String(suspensions.length + 1),
      date: suspDate,
      hours: suspHours,
      reason: suspReason,
      status: "SUBMITTED",
      shift: suspShift,
    };
    setSuspensions([newSusp, ...suspensions]);
    setSuspReason("");
    setSuspShift("SHIFT_I");
    Alert.alert("Success", "Timetable suspension request submitted to HOD.");
    setActiveSubModal(null);
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setUploadedFile(file.name);
      }
    } catch (err) {
      console.log("Document picking error: ", err);
      Alert.alert("Error", "Failed to select document from device.");
    }
  };

  const handleUploadAudit = () => {
    if (!uploadedFile) {
      Alert.alert("Error", "Please select a work audit document first.");
      return;
    }
    Alert.alert("Success", `Work Audit Report for ${auditMonth} submitted successfully.`);
    setActiveSubModal(null);
  };

  const categories: MenuCategory[] = [
    {
      title: "ACADEMIC",
      items: [
        {
          title: "Timetable",
          subtitle: "Daily class schedule & labs",
          route: "/faculty/schedule",
          icon: <Calendar size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Mark Attendance",
          subtitle: "Class periods & student presence",
          route: "/faculty/classes",
          icon: <CheckCircle size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Attendance View",
          subtitle: "Subject percentages & statistics",
          route: "/faculty/attendance-hub",
          icon: <CheckCircle size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Exams & Marks Entry",
          subtitle: "Enter CIA 1, CIA 2 and Semester marks",
          route: "/faculty/exam-marks",
          icon: <ClipboardList size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Academic Management",
          subtitle: "Manage courses, syllabus, and study materials",
          route: "/faculty/academic-hub",
          icon: <BookOpen size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Assessments & Assignments",
          subtitle: "Assign tasks and evaluate submissions",
          route: "/faculty/assessments",
          icon: <FileText size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Timetable Suspension",
          subtitle: "Manage Timetable Suspensions",
          isSubModal: "SUSPENSION",
          icon: <XCircle size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Work Audit",
          subtitle: "Monthly Work Audit",
          isSubModal: "AUDIT",
          icon: <Calendar size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Batch Timetable",
          subtitle: "View Batch Wise Timetable",
          route: "/faculty/batch-timetable",
          icon: <ClipboardList size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Department Timetable",
          subtitle: "View Department Wise & Batch Wise",
          route: "/faculty/dept-timetable",
          icon: <ClipboardList size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Other Attendance",
          subtitle: "OD, Event, Substitution & cancellations",
          route: "/faculty/other-attendance",
          icon: <CheckCircle size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Easy Leave",
          subtitle: "Apply for leaves & track status",
          route: "/faculty/admin-hub?tab=LEAVE",
          icon: <FileText size={20} color={Colors.BluePrimary} />,
        },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          title: "Payroll & Salary Slips",
          subtitle: "View payslips, tax sheets & allowances",
          isMockAction: "PAYROLL",
          icon: <Wallet size={20} color={Colors.BluePrimary} />,
        },
      ],
    },
    {
      title: "CAMPUS SERVICES",
      items: [
        {
          title: "Digital Library",
          subtitle: "Borrowed books & search catalog",
          route: "/faculty/admin-hub?tab=LIBRARY",
          icon: <BookOpen size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Placement Cell",
          subtitle: "Job drives, internships & status",
          route: "/faculty/admin-hub?tab=PLACEMENTS",
          icon: <Briefcase size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "College Events",
          subtitle: "Campus events duties and schedules",
          route: "/faculty/admin-hub?tab=EVENTS",
          icon: <Megaphone size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Certificates & Requests",
          subtitle: "Request bonafide & service certificates",
          isMockAction: "CERTIFICATES",
          icon: <FileText size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Circulars & Alerts",
          subtitle: "Official announcements & notices",
          route: "/faculty/alerts",
          icon: <Bell size={20} color={Colors.BluePrimary} />,
        },
      ],
    },
    {
      title: "STUDENT MANAGEMENT",
      items: [
        {
          title: "Student Hub Directory",
          subtitle: "View class lists and student profiles",
          route: "/faculty/student-hub?tab=STUDENTS",
          icon: <Users size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "Mentor & Tutor Panel",
          subtitle: "Record counseling sessions for mentees",
          route: "/faculty/student-hub?tab=MENTOR",
          icon: <User size={20} color={Colors.BluePrimary} />,
        },
      ],
    },
    {
      title: "OTHERS",
      items: [
        {
          title: "My Profile",
          subtitle: "Faculty ID card & details",
          route: "/faculty/profile",
          icon: <User size={20} color={Colors.BluePrimary} />,
        },
        {
          title: "App Settings",
          subtitle: "Change password & preferences",
          route: "/faculty/settings",
          icon: <Settings size={20} color={Colors.BluePrimary} />,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 8 }]}>
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat, catIdx) => (
          <View key={catIdx} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
            <View style={styles.cardContainer}>
              {cat.items.map((item, itemIdx) => (
                <View key={itemIdx}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.listItem,
                      pressed && styles.listItemPressed,
                    ]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.iconBox}>
                      {item.icon}
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Pressable>
                  {itemIdx < cat.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ──── PAYROLL MODAL ──── */}
      <Modal visible={showPayrollModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowPayrollModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payroll & Salary slips</Text>
              <Pressable onPress={() => setShowPayrollModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>Faculty Member</Text>
                <Text style={styles.infoCardValue}>Dr. Azhar Ahmed</Text>
                <Text style={styles.infoCardSub}>Employee ID: FAC001  ·  Dept: Computer Science</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoSubCard}>
                  <Text style={styles.infoCardLabel}>PAN Number</Text>
                  <Text style={styles.infoCardValueMini}>XXXXXX887F</Text>
                </View>
                <View style={styles.infoSubCard}>
                  <Text style={styles.infoCardLabel}>Bank Account</Text>
                  <Text style={styles.infoCardValueMini}>SBI - XXXX3492</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Available Payslips</Text>

              {["June 2026", "May 2026", "April 2026"].map((month, idx) => (
                <View key={idx} style={styles.payslipRow}>
                  <View>
                    <Text style={styles.payslipMonth}>{month}</Text>
                    <Text style={styles.payslipSub}>Salary Credited on 30th</Text>
                  </View>
                  <Pressable
                    style={styles.downloadBtn}
                    onPress={() => Alert.alert("Download Complete", `${month} payslip has been successfully downloaded.`)}
                  >
                    <Download size={16} color={Colors.BluePrimary} />
                    <Text style={styles.downloadText}>PDF</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ──── CERTIFICATES MODAL ──── */}
      <Modal visible={showCertificatesModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalDismiss} onPress={() => setShowCertificatesModal(false)} />
            <View style={[styles.modalSheet, { maxHeight: "85%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Certificates Portal</Text>
                <Pressable onPress={() => setShowCertificatesModal(false)} style={styles.modalCloseBtn}>
                  <X size={20} color="#0F172A" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Dropdown for Certificate Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Request Certificate Type</Text>
                  <Pressable style={styles.dropdownTrigger} onPress={() => setShowCertDropdown(!showCertDropdown)}>
                    <Text style={styles.dropdownText}>{certType}</Text>
                    <ChevronRight size={16} color="#64748B" style={{ transform: [{ rotate: showCertDropdown ? "90deg" : "0deg" }] }} />
                  </Pressable>
                  {showCertDropdown && (
                    <View style={styles.dropdownMenu}>
                      {["Service Certificate", "Salary Certificate", "No Objection Certificate (NOC)", "Bonafide Certificate"].map((t) => (
                        <Pressable
                          key={t}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCertType(t);
                            setShowCertDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, certType === t && { color: Colors.BluePrimary, fontWeight: "700" }]}>{t}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Purpose Textbox */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Purpose / Reason</Text>
                  <TextInput
                    style={styles.textInputArea}
                    value={certPurpose}
                    onChangeText={setCertPurpose}
                    placeholder="Enter reason for requesting this certificate (e.g. Visa application, Bank loan...)"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <Pressable style={styles.submitRequestBtn} onPress={handleRequestCertificate}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.submitRequestBtnText}>Submit Certificate Request</Text>
                </Pressable>

                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Previous Requests</Text>

                {certRequests.map((req) => (
                  <View key={req.id} style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyType}>{req.type}</Text>
                      <Text style={styles.historyDate}>Requested on {req.date}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: req.status === "PENDING" ? "#FEF3C7" : req.status === "APPROVED" ? "#D1FAE5" : req.status === "COMPLETED" ? "#DBEAFE" : "#E2E8F0" }
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        { color: req.status === "PENDING" ? "#D97706" : req.status === "APPROVED" ? "#059669" : req.status === "COMPLETED" ? Colors.BluePrimary : "#475569" }
                      ]}>
                        {req.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ──── TIMETABLE SUSPENSION MODAL ──── */}
      <Modal visible={activeSubModal === "SUSPENSION"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveSubModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Timetable Suspension</Text>
              <Pressable onPress={() => setActiveSubModal(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput style={styles.textInput} value={suspDate} onChangeText={setSuspDate} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hours Affected</Text>
                <TextInput style={styles.textInput} value={suspHours} onChangeText={setSuspHours} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Shift for Suspension</Text>
                <View style={styles.chipSelectorGroup}>
                  {['SHIFT_I', 'SHIFT_II', 'GIRLS'].map((sh) => {
                    const active = suspShift === sh;
                    const label = sh === 'SHIFT_I' ? 'Shift I' : sh === 'SHIFT_II' ? 'Shift II' : 'Girls';
                    return (
                      <Pressable
                        key={sh}
                        style={[styles.selectorChip, active && styles.selectorChipActive]}
                        onPress={() => setSuspShift(sh as any)}
                      >
                        <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason / Event Details</Text>
                <TextInput
                  style={styles.textInputArea}
                  value={suspReason}
                  onChangeText={setSuspReason}
                  placeholder="Enter reason (e.g. Guest Lecture, Lab Renovation...)"
                  multiline
                />
              </View>
              <Pressable style={styles.submitBtn} onPress={handleAddSuspension}>
                <Text style={styles.submitBtnText}>Request Suspension</Text>
              </Pressable>

              <Text style={styles.historyHeading}>Current Suspensions</Text>
              
              <View style={styles.tabSelector}>
                {['SHIFT_I', 'SHIFT_II', 'GIRLS'].map((sh) => {
                  const active = activeSuspFilterTab === sh;
                  const label = sh === 'SHIFT_I' ? 'Shift I' : sh === 'SHIFT_II' ? 'Shift II' : 'Girls';
                  return (
                    <Pressable
                      key={sh}
                      style={[styles.tabButton, active && styles.tabButtonActive]}
                      onPress={() => setActiveSuspFilterTab(sh as any)}
                    >
                      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {suspionsListRenderer(suspensions.filter(s => s.shift === activeSuspFilterTab))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ──── WORK AUDIT MODAL ──── */}
      <Modal visible={activeSubModal === "AUDIT"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveSubModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Work Audit Uploader</Text>
              <Pressable onPress={() => setActiveSubModal(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Audit Month</Text>
                <TextInput style={styles.textInput} value={auditMonth} onChangeText={setAuditMonth} />
              </View>

              <Text style={styles.formLabel}>Upload Document</Text>
              <Pressable style={styles.uploadContainer} onPress={handlePickDocument}>
                <Upload size={24} color="#64748B" />
                <Text style={styles.uploadText}>Select Work Audit Sheet (.xlsx, .pdf)</Text>
              </Pressable>

              {uploadedFile && (
                <View style={styles.fileCard}>
                  <Text style={styles.fileName}>{uploadedFile}</Text>
                  <Text style={styles.fileStatus}>Uploaded & Verified</Text>
                </View>
              )}

              <Pressable style={styles.submitBtn} onPress={handleUploadAudit}>
                <Text style={styles.submitBtnText}>Submit Monthly Audit</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>


    </View>
  );

  function suspionsListRenderer(list: any[]) {
    if (list.length === 0) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500' }}>No suspensions requested for this shift.</Text>
        </View>
      );
    }
    return list.map((susp) => (
      <View key={susp.id} style={styles.historyCard}>
        <View style={styles.historyRow}>
          <Text style={styles.historyTextBold}>{susp.hours}</Text>
          <Text style={[
            styles.statusTextActive,
            susp.status === 'SUSPENDED' ? { color: '#059669' } : { color: '#2563EB' }
          ]}>{susp.status}</Text>
        </View>
        <Text style={styles.historySub}>
          Reason: {susp.reason} · Date: {susp.date} {susp.shift ? `(${susp.shift === 'SHIFT_I' ? 'Shift I' : susp.shift === 'SHIFT_II' ? 'Shift II' : 'Girls'})` : ''}
        </Text>
      </View>
    ));
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Sleek, light gray background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  categoryBlock: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  listItemPressed: {
    backgroundColor: "#F1F5F9",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF", // Light-blue tint background
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 68, // aligns perfectly with text start (40 iconBox + 14 padding + 14 right offset)
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // sleek translucent overlay
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  infoCardValueMini: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  infoCardSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoSubCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },
  payslipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  payslipMonth: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  payslipSub: {
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.BluePrimary,
  },

  // Certificates Form
  formGroup: {
    gap: 6,
    position: "relative",
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: 4,
    padding: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 99,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#475569",
  },
  textInputArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#1E293B",
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitRequestBtn: {
    backgroundColor: Colors.BluePrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  submitRequestBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  historyType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  historyDate: {
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  // Timetable Suspension Styles
  submitBtn: {
    backgroundColor: Colors.BluePrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#1E293B",
  },
  historyHeading: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  historyTextBold: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  historySub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  statusTextActive: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.BluePrimary,
  },

  // Work Audit Styles
  uploadContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  fileCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  fileName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#166534",
  },
  fileStatus: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#15803d",
  },

  // ── Timetable grid styles ──────────────────────────────────────────────
  timetableTable: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    overflow: "hidden",
    marginBottom: 8,
  },
  ttHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  ttHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ttDayCell: {
    width: 32,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ttHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F1F5F9",
    textAlign: "center",
  },
  ttRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  ttRowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  ttCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  ttDayText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
  },
  ttCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  ttCellActive: {
    backgroundColor: "#DBEAFE",
  },
  ttCellSuspended: {
    backgroundColor: "#FEE2E2",
  },
  ttCellText: {
    fontSize: 9.5,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
  },
  ttCellTextActive: {
    color: Colors.BluePrimary,
    fontWeight: "800",
  },
  ttBadge: {
    fontSize: 8,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  badgeBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeBtnActive: {
    backgroundColor: "#EFF6FF",
    borderColor: Colors.BluePrimary,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
  },
  badgeTextActive: {
    color: Colors.BluePrimary,
    fontWeight: "700",
  },
  timetableHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },

  chipSelectorGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
  },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  selectorChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  selectorChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  selectorChipTextActive: {
    color: "#FFFFFF",
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.BluePrimary,
  },
  tabButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: Colors.BluePrimary,
    fontWeight: '700',
  },
  timetableSubHeader: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  tableCellPressable: {
    width: '90%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tableCellActive: {
    backgroundColor: '#DBEAFE',
    borderColor: Colors.BluePrimary,
  },
  tableCellText: {
    fontSize: 10.5,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
  tableCellTextActive: {
    color: Colors.BluePrimary,
    fontWeight: "800",
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10000,
  },
  detailsAlertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 14,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContent: {
    gap: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailsValue: {
    fontSize: 12.5,
    color: '#1E293B',
    fontWeight: '700',
  },
  detailsOkBtn: {
    backgroundColor: Colors.BluePrimary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  detailsOkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  yearTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
  },
  yearTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: Colors.BluePrimary + '0D',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: Colors.BluePrimary,
  },
});
