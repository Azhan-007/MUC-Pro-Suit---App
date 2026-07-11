import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, Modal, Platform, StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, X, ChevronDown, Check, Filter } from "lucide-react-native";
import { Colors } from "../../theme";
import { useCampusAlert } from "../../components";

// Types
interface Substitution {
  id: string;
  date: string; // YYYY-MM-DD
  period: string; // H1 - H5
  classCode: string;
  subject: string;
  originalFaculty: string;
  assignedFaculty: string;
  room: string;
  status: "Pending" | "Approved" | "Rejected" | "Accepted" | "Completed" | "Cancelled";
  shift: "Shift I" | "Shift II" | "Girls";
}

// Mock Faculty list (only CS, English, and Sports faculty)
const SUBSTITUTE_FACULTY_LIST = [
  { name: "Dr. P. Rizwan Ahmed", dept: "Computer Science" },
  { name: "Dr. K. H. Kaleemullah", dept: "Computer Science" },
  { name: "Dr. Ayesha Siddiqua J", dept: "Computer Science" },
  { name: "Ms. R. Jasmine", dept: "Computer Science" },
  { name: "Prof. H. Shabana", dept: "English" },
  { name: "Dr. S. Baskaran (Sports Director)", dept: "Sports" },
];

const CLASSES = ["I B.Sc CS", "II B.Sc CS", "III B.Sc CS", "III BCA"];
const PERIODS = ["1st Hour", "2nd Hour", "3rd Hour", "4th Hour", "5th Hour"];
const STATUSES = ["Pending", "Approved", "Rejected", "Accepted", "Completed", "Cancelled"];
const SUBJECTS = ["Database Management System", "Operating System", "Mathematics II", "English II", "DBMS Laboratory", "Seminar & HOD Class", "Library Reference"];

type TabType = "RECEIVED" | "MY_REQUESTS" | "SCHEDULE" | "HISTORY";

export function FacultySubstitutionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  // Current logged in faculty name for mock context
  const LOGGED_IN_FACULTY = "Dr. P. Rizwan Ahmed";

  // ── States ──
  const [activeTab, setActiveTab] = React.useState<TabType>("RECEIVED");
  const [selectedShift, setSelectedShift] = React.useState<"Shift I" | "Shift II" | "Girls">("Shift I");
  const [showRequestModal, setShowRequestModal] = React.useState(false);

  // Dropdown sheet visibilities
  const [showPeriodPicker, setShowPeriodPicker] = React.useState(false);
  const [showClassPicker, setShowClassPicker] = React.useState(false);
  const [showFacultyPicker, setShowFacultyPicker] = React.useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = React.useState(false);

  // New Request Form States
  const [reqDate, setReqDate] = React.useState("2026-07-06");
  const [reqPeriod, setReqPeriod] = React.useState("1st Hour");
  const [reqClass, setReqClass] = React.useState("III B.Sc CS");
  const [reqFaculty, setReqFaculty] = React.useState("Dr. K. H. Kaleemullah");
  const [reqSubject, setReqSubject] = React.useState("Database Management System");

  // History Filter States
  const [historyFilterClass, setHistoryFilterClass] = React.useState("All");
  const [historyFilterStatus, setHistoryFilterStatus] = React.useState("All");
  const [showHistoryFilters, setShowHistoryFilters] = React.useState(false);

  // Substitution list state
  const [substitutions, setSubstitutions] = React.useState<Substitution[]>([
    // Received (assigned to logged in faculty)
    {
      id: "rec-1",
      date: "2026-07-04",
      period: "2nd Hour",
      classCode: "II B.Sc CS",
      subject: "Operating System",
      originalFaculty: "Dr. K. H. Kaleemullah",
      assignedFaculty: LOGGED_IN_FACULTY,
      room: "LH-02",
      status: "Pending",
      shift: "Shift I",
    },
    {
      id: "rec-2",
      date: "2026-07-04",
      period: "3rd Hour",
      classCode: "III BCA",
      subject: "Web Technology",
      originalFaculty: "Dr. Ayesha Siddiqua J",
      assignedFaculty: LOGGED_IN_FACULTY,
      room: "LH-05",
      status: "Accepted",
      shift: "Shift II",
    },
    // My Requested (created by logged in faculty)
    {
      id: "my-1",
      date: "2026-07-06",
      period: "1st Hour",
      classCode: "III B.Sc CS",
      subject: "Database Management System",
      originalFaculty: LOGGED_IN_FACULTY,
      assignedFaculty: "Ms. R. Jasmine",
      room: "LH-03",
      status: "Pending",
      shift: "Shift I",
    },
    {
      id: "my-2",
      date: "2026-07-05",
      period: "4th Hour",
      classCode: "I B.Sc CS",
      subject: "Python Programming",
      originalFaculty: LOGGED_IN_FACULTY,
      assignedFaculty: "Prof. H. Shabana",
      room: "LH-01",
      status: "Approved",
      shift: "Girls",
    },
    // Past / Completed
    {
      id: "past-1",
      date: "2026-07-02",
      period: "5th Hour",
      classCode: "III B.Sc CS",
      subject: "DBMS Laboratory",
      originalFaculty: LOGGED_IN_FACULTY,
      assignedFaculty: "Dr. K. H. Kaleemullah",
      room: "Lab-A",
      status: "Completed",
      shift: "Shift I",
    },
    {
      id: "past-2",
      date: "2026-07-01",
      period: "2nd Hour",
      classCode: "II B.Sc CS",
      subject: "Operating System",
      originalFaculty: "Prof. H. Shabana",
      assignedFaculty: LOGGED_IN_FACULTY,
      room: "LH-02",
      status: "Completed",
      shift: "Shift I",
    },
  ]);

  // ── Actions ──
  const handleCreateRequest = () => {
    if (!reqDate.trim() || !reqSubject.trim()) {
      showAlert("Input Required", "Please fill in all the details.");
      return;
    }
    const newRequest: Substitution = {
      id: `my-${substitutions.length + 1}`,
      date: reqDate,
      period: reqPeriod,
      classCode: reqClass,
      subject: reqSubject,
      originalFaculty: LOGGED_IN_FACULTY,
      assignedFaculty: reqFaculty,
      room: "LH-01", // Mock room
      status: "Pending",
      shift: selectedShift, // Default to currently selected active shift category
    };
    setSubstitutions([newRequest, ...substitutions]);
    showAlert("Success", `Substitution requested from ${reqFaculty} successfully.`);
    setShowRequestModal(false);
  };

  const handleUpdateStatus = (id: string, newStatus: Substitution["status"]) => {
    setSubstitutions(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    showAlert("Status Updated", `Request has been marked as ${newStatus}.`);
  };

  // ── Derived Categories with Shift Filtering ──
  const todayStr = "2026-07-04"; // Mocked today date based on current records

  // 1. Received (assigned to me)
  const receivedList = substitutions.filter(item =>
    item.assignedFaculty === LOGGED_IN_FACULTY &&
    item.status !== "Completed" &&
    item.status !== "Cancelled" &&
    item.status !== "Rejected" &&
    item.shift === selectedShift
  );

  // 2. My Requested (created by me)
  const myRequestedList = substitutions.filter(item =>
    item.originalFaculty === LOGGED_IN_FACULTY &&
    item.shift === selectedShift
  );

  // 3. Today's accepted
  const todaysList = substitutions.filter(item =>
    item.date === todayStr &&
    item.status === "Accepted" &&
    item.shift === selectedShift
  );

  // 4. Upcoming accepted
  const upcomingList = substitutions
    .filter(item =>
      item.date > todayStr &&
      (item.status === "Accepted" || item.status === "Approved") &&
      item.shift === selectedShift
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  // 5. Past History
  const historyList = substitutions.filter(item => {
    const isPast = item.status === "Completed" || item.status === "Cancelled" || item.status === "Rejected";
    const matchesClass = historyFilterClass === "All" || item.classCode === historyFilterClass;
    const matchesStatus = historyFilterStatus === "All" || item.status === historyFilterStatus;
    const matchesShift = item.shift === selectedShift;
    return isPast && matchesClass && matchesStatus && matchesShift;
  });

  // Badge Color Helper
  const getBadgeStyles = (status: Substitution["status"]) => {
    switch (status) {
      case "Pending": return { bg: "#FFFBEB", txt: "#D97706" };
      case "Approved": return { bg: "#EFF6FF", txt: "#2563EB" };
      case "Rejected": return { bg: "#FEF2F2", txt: "#EF4444" };
      case "Accepted": return { bg: "#F0FDF4", txt: "#10B981" };
      case "Completed": return { bg: "#ECFDF5", txt: "#059669" };
      case "Cancelled": return { bg: "#F3F4F6", txt: "#6B7280" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Substitution Manager</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setShowRequestModal(true)}>
          <Plus size={22} color={Colors.BluePrimary} />
        </Pressable>
      </View>

      {/* ── Subtitle Context Bar ── */}
      <View style={styles.contextBar}>
        <Text style={styles.contextBarText}>Faculty Profile: {LOGGED_IN_FACULTY}</Text>
      </View>

      {/* ── Top Tabs ── */}
      <View style={styles.tabsRow}>
        {(["RECEIVED", "MY_REQUESTS", "SCHEDULE", "HISTORY"] as TabType[]).map((tab) => {
          const labels = { RECEIVED: "Received", MY_REQUESTS: "My Requests", SCHEDULE: "Schedule", HISTORY: "History" };
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{labels[tab]}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Shift Category Tabs ── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={styles.shiftTabs}>
          {["Shift I", "Shift II", "Girls"].map((shift) => {
            const active = selectedShift === shift;
            return (
              <Pressable
                key={shift}
                style={[styles.shiftTab, active && styles.shiftTabActive]}
                onPress={() => setSelectedShift(shift as any)}
              >
                <Text style={[styles.shiftTabText, active && styles.shiftTabTextActive]}>
                  {shift}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* ── TAB 1: RECEIVED SUBSTITUTIONS ── */}
        {activeTab === "RECEIVED" && (
          <View style={styles.sectionWrap}>
            {receivedList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pending received substitutions for {selectedShift}.</Text>
              </View>
            ) : (
              receivedList.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardClass}>{item.classCode}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardLabel}>Date: <Text style={styles.cardVal}>{item.date}</Text></Text>
                      <Text style={styles.cardLabel}>Period: <Text style={styles.cardVal}>{item.period}</Text></Text>
                      <Text style={styles.cardLabel}>Subject: <Text style={styles.cardVal}>{item.subject}</Text></Text>
                      <Text style={styles.cardLabel}>Original Faculty: <Text style={styles.cardVal}>{item.originalFaculty}</Text></Text>
                      <Text style={styles.cardLabel}>Room: <Text style={styles.cardVal}>{item.room}</Text></Text>
                    </View>
                    {item.status === "Pending" && (
                      <View style={styles.cardActions}>
                        <Pressable style={styles.declineBtn} onPress={() => handleUpdateStatus(item.id, "Rejected")}>
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </Pressable>
                        <Pressable style={styles.acceptBtn} onPress={() => handleUpdateStatus(item.id, "Accepted")}>
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── TAB 2: MY REQUESTS ── */}
        {activeTab === "MY_REQUESTS" && (
          <View style={styles.sectionWrap}>
            {myRequestedList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No requested substitutions found for {selectedShift}.</Text>
              </View>
            ) : (
              myRequestedList.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardClass}>{item.classCode}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardLabel}>Date: <Text style={styles.cardVal}>{item.date}</Text></Text>
                      <Text style={styles.cardLabel}>Period: <Text style={styles.cardVal}>{item.period}</Text></Text>
                      <Text style={styles.cardLabel}>Assigned Faculty: <Text style={styles.cardVal}>{item.assignedFaculty}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── TAB 3: SCHEDULE (Today + Upcoming) ── */}
        {activeTab === "SCHEDULE" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Today's Substitutions ({selectedShift})</Text>
            {todaysList.length === 0 ? (
              <Text style={styles.helperText}>No substitute classes assigned for today.</Text>
            ) : (
              todaysList.map((item) => (
                <View key={item.id} style={styles.schedCard}>
                  <Text style={styles.schedClass}>{item.classCode} · {item.period}</Text>
                  <Text style={styles.schedSub}>Subject: {item.subject} · Room: {item.room}</Text>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Upcoming Substitutions ({selectedShift})</Text>
            {upcomingList.length === 0 ? (
              <Text style={styles.helperText}>No upcoming substitute classes scheduled.</Text>
            ) : (
              upcomingList.map((item) => (
                <View key={item.id} style={styles.schedCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.schedClass}>{item.classCode} · {item.period}</Text>
                    <Text style={styles.schedDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.schedSub}>Subject: {item.subject} · Room: {item.room}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── TAB 4: HISTORY (Past / Filtering) ── */}
        {activeTab === "HISTORY" && (
          <View style={styles.sectionWrap}>
            <View style={styles.filterBarHeader}>
              <Text style={styles.sectionTitle}>History Log ({selectedShift})</Text>
              <Pressable style={styles.filterBtn} onPress={() => setShowHistoryFilters(!showHistoryFilters)}>
                <Filter size={15} color={Colors.BluePrimary} />
                <Text style={styles.filterBtnText}>Filters</Text>
              </Pressable>
            </View>

            {showHistoryFilters && (
              <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>Filter by Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                  {["All", ...CLASSES].map(c => (
                    <Pressable
                      key={c}
                      style={[styles.filterChip, historyFilterClass === c && styles.filterChipActive]}
                      onPress={() => setHistoryFilterClass(c)}
                    >
                      <Text style={[styles.filterChipText, historyFilterClass === c && styles.filterChipTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={[styles.filterLabel, { marginTop: 10 }]}>Filter by Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
                  {["All", "Completed", "Cancelled", "Rejected"].map(s => (
                    <Pressable
                      key={s}
                      style={[styles.filterChip, historyFilterStatus === s && styles.filterChipActive]}
                      onPress={() => setHistoryFilterStatus(s)}
                    >
                      <Text style={[styles.filterChipText, historyFilterStatus === s && styles.filterChipTextActive]}>{s}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {historyList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No historical records matching the filter.</Text>
              </View>
            ) : (
              historyList.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardClass}>{item.classCode}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardLabel}>Date: <Text style={styles.cardVal}>{item.date}</Text></Text>
                      <Text style={styles.cardLabel}>Period: <Text style={styles.cardVal}>{item.period}</Text></Text>
                      <Text style={styles.cardLabel}>Faculty: <Text style={styles.cardVal}>{item.assignedFaculty}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Modal: Request Substitution Form ── */}
      <Modal visible={showRequestModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowRequestModal(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Substitution ({selectedShift})</Text>
              <Pressable onPress={() => setShowRequestModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={reqDate}
                onChangeText={setReqDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.formLabel}>Select Hour / Period</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowPeriodPicker(true)}>
                <Text style={styles.dropdownText}>{reqPeriod}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Select Class</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowClassPicker(true)}>
                <Text style={styles.dropdownText}>{reqClass}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Select Substitute Faculty (CS, English, Sports only)</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowFacultyPicker(true)}>
                <Text style={styles.dropdownText}>{reqFaculty}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Subject Name</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowSubjectPicker(true)}>
                <Text style={styles.dropdownText}>{reqSubject}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Pressable style={styles.submitBtn} onPress={handleCreateRequest}>
                <Text style={styles.submitBtnTxt}>Submit Request</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bottom Sheet: Subject Selector ── */}
      <Modal visible={showSubjectPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowSubjectPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Subject</Text>
              <Pressable onPress={() => setShowSubjectPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {SUBJECTS.map((s) => {
                const active = reqSubject === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setReqSubject(s); setShowSubjectPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{s}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bottom Sheet: Period Selector ── */}
      <Modal visible={showPeriodPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowPeriodPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Period</Text>
              <Pressable onPress={() => setShowPeriodPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {PERIODS.map((p) => {
                const active = reqPeriod === p;
                return (
                  <Pressable
                    key={p}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setReqPeriod(p); setShowPeriodPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{p}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bottom Sheet: Class Selector ── */}
      <Modal visible={showClassPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowClassPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Class</Text>
              <Pressable onPress={() => setShowClassPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {CLASSES.map((c) => {
                const active = reqClass === c;
                return (
                  <Pressable
                    key={c}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setReqClass(c); setShowClassPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{c}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bottom Sheet: Substitute Faculty Selector (CS, English, Sports only) ── */}
      <Modal visible={showFacultyPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFacultyPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Substitute Faculty</Text>
              <Pressable onPress={() => setShowFacultyPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {SUBSTITUTE_FACULTY_LIST.map((fac) => {
                const active = reqFaculty === fac.name;
                return (
                  <Pressable
                    key={fac.name}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setReqFaculty(fac.name); setShowFacultyPicker(false); }}
                  >
                    <View>
                      <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{fac.name}</Text>
                      <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{fac.dept}</Text>
                    </View>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  addBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  // Context bar
  contextBar: {
    backgroundColor: Colors.BluePrimary + "12",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BluePrimary + "20",
  },
  contextBarText: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary, textAlign: "center" },

  // Tabs Row
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: Colors.BluePrimary },
  tabText: { fontSize: 12.5, fontWeight: "600", color: "#94A3B8" },
  tabTextActive: { color: Colors.BluePrimary, fontWeight: "800" },

  // Shift Segmented Tabs
  shiftTabs: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4, marginBottom: 8 },
  shiftTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  shiftTabActive: { backgroundColor: "#FFFFFF", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  shiftTabText: { fontSize: 12.5, fontWeight: "600", color: "#64748B" },
  shiftTabTextActive: { color: Colors.BluePrimary, fontWeight: "800" },

  // Content
  scrollContent: { padding: 16 },
  sectionWrap: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B", marginBottom: 6 },
  helperText: { fontSize: 12.5, color: "#94A3B8", fontStyle: "italic", marginBottom: 12 },

  // Card items
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardClass: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10.5, fontWeight: "800" },
  cardBody: { gap: 6 },
  cardLabel: { fontSize: 12.5, color: "#64748B", fontWeight: "600" },
  cardVal: { color: "#1E293B", fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  declineBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center" },
  declineBtnText: { fontSize: 12.5, fontWeight: "700", color: "#EF4444" },
  acceptBtn: { flex: 2, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.BluePrimary, alignItems: "center" },
  acceptBtnText: { fontSize: 12.5, fontWeight: "800", color: "#FFFFFF" },

  // Schedule Card
  schedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.BluePrimary,
  },
  schedClass: { fontSize: 13, fontWeight: "800", color: "#1E293B" },
  schedSub: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  schedDate: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },

  // History Filter UI
  filterBarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#EFF6FF" },
  filterBtnText: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary },
  filterBox: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, marginBottom: 12 },
  filterLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 },
  filterChipRow: { gap: 6, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  filterChipActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  filterChipText: { fontSize: 11.5, fontWeight: "600", color: "#475569" },
  filterChipTextActive: { color: "#FFFFFF" },

  // Modals & Forms
  modalOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  modalSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingHorizontal: 20, paddingBottom: 30, maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  modalCloseBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  modalScroll: { gap: 12 },

  formLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, width: "100%", marginBottom: 12,
  },
  dropdownText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  textInput: {
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 12,
  },
  submitBtn: {
    width: "100%", paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.BluePrimary, alignItems: "center", marginTop: 8,
  },
  submitBtnTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

  // Picker bottom sheet
  pickerOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", zIndex: 9999 },
  pickerDismiss: { flex: 1 },
  pickerSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 30, maxHeight: "60%" },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  pickerTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  pickerCloseBtn: { padding: 4 },
  pickerList: { paddingHorizontal: 16, paddingTop: 8 },
  pickerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  pickerItemActive: { backgroundColor: Colors.BluePrimary + "0D" },
  pickerItemText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  pickerItemTextActive: { fontWeight: "700", color: Colors.BluePrimary },

  emptyContainer: { flex: 1, paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" },
});
