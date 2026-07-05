import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, Modal, Platform, StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Check, Filter, X } from "lucide-react-native";
import { Colors } from "../../theme";
import { useCampusAlert } from "../../components";
import { getDayOrder } from "../../utils/dayOrder";

// Types
interface EngageRecord {
  id: string;
  date: string;
  subject: string;
  classCode: string;
  period: string;
  originalFaculty: string;
  engagedFaculty: string;
  room: string;
  dayOrder: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  markedTime?: string;
  shift: "Shift I" | "Shift II" | "Girls";
}

const FACULTY_LIST = ["Dr. K. H. Kaleemullah", "Dr. Ayesha Siddiqua J", "Prof. H. Shabana"];
const CLASSES = ["I B.Sc CS", "II B.Sc CS", "III B.Sc CS", "III BCA"];
const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];
const SHIFTS = ["Shift I", "Shift II", "Girls"];

// Mock schedules for available classes
const FACULTY_SCHEDULES: Record<string, Record<string, any[]>> = {
  "Dr. K. H. Kaleemullah": {
    "D1": [
      { subject: "Operating System", classCode: "II B.Sc CS", period: "1st Hour", room: "LH-02" },
      { subject: "Operating System", classCode: "III B.Sc CS", period: "3rd Hour", room: "LH-03" }
    ],
    "D2": [
      { subject: "Operating System", classCode: "II B.Sc CS", period: "2nd Hour", room: "LH-02" }
    ],
    "D3": [
      { subject: "Operating System", classCode: "III B.Sc CS", period: "4th Hour", room: "LH-03" }
    ],
    "D4": [
      { subject: "Operating System", classCode: "II B.Sc CS", period: "1st Hour", room: "LH-02" }
    ],
    "D5": [
      { subject: "Operating System", classCode: "II B.Sc CS", period: "2nd Hour", room: "LH-02" }
    ],
    "D6": [
      { subject: "Operating System", classCode: "III B.Sc CS", period: "1st Hour", room: "LH-03" }
    ]
  },
  "Dr. Ayesha Siddiqua J": {
    "D1": [
      { subject: "Web Technology", classCode: "III BCA", period: "2nd Hour", room: "LH-05" }
    ],
    "D2": [
      { subject: "Seminar & HOD Class", classCode: "I B.Sc CS", period: "5th Hour", room: "LH-01" }
    ],
    "D6": [
      { subject: "Seminar & HOD Class", classCode: "I B.Sc CS", period: "4th Hour", room: "LH-01" }
    ]
  },
  "Prof. H. Shabana": {
    "D1": [
      { subject: "English II", classCode: "I B.Sc CS", period: "4th Hour", room: "LH-01" }
    ],
    "D3": [
      { subject: "English II", classCode: "I B.Sc CS", period: "2nd Hour", room: "LH-01" }
    ],
    "D5": [
      { subject: "English II", classCode: "I B.Sc CS", period: "3rd Hour", room: "LH-01" }
    ]
  }
};

export function FacultyEngageAttendanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  const LOGGED_IN_FACULTY = "Dr. P. Rizwan Ahmed";

  // ── States ──
  const [selectedFaculty, setSelectedFaculty] = React.useState("Dr. K. H. Kaleemullah");
  const [dateStr, setDateStr] = React.useState("2026-07-06"); // Defaults to mock future day
  const [selectedClassIndex, setSelectedClassIndex] = React.useState<number | null>(null);

  // Dropdown sheet visibilities
  const [showFacultyPicker, setShowFacultyPicker] = React.useState(false);

  // History Shift Category
  const [selectedHistoryShift, setSelectedHistoryShift] = React.useState<"Shift I" | "Shift II" | "Girls">("Shift I");

  // History Filter States (Applied)
  const [filterDate, setFilterDate] = React.useState("");
  const [filterFaculty, setFilterFaculty] = React.useState("All");
  const [filterClass, setFilterClass] = React.useState("All");
  const [filterStatus, setFilterStatus] = React.useState("All");

  // History Filter Temp States (for Dialog Box Form)
  const [tempFilterDate, setTempFilterDate] = React.useState("");
  const [tempFilterFaculty, setTempFilterFaculty] = React.useState("All");
  const [tempFilterClass, setTempFilterClass] = React.useState("All");
  const [tempFilterStatus, setTempFilterStatus] = React.useState("All");

  // Filter Sub-picker sheets visibility
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [showFilterFacultyPicker, setShowFilterFacultyPicker] = React.useState(false);
  const [showFilterClassPicker, setShowFilterClassPicker] = React.useState(false);
  const [showFilterStatusPicker, setShowFilterStatusPicker] = React.useState(false);

  // Engage history state
  const [history, setHistory] = React.useState<EngageRecord[]>([
    {
      id: "hist-1",
      date: "2026-07-04",
      subject: "Operating System",
      classCode: "II B.Sc CS",
      period: "2nd Hour",
      originalFaculty: "Dr. K. H. Kaleemullah",
      engagedFaculty: LOGGED_IN_FACULTY,
      room: "LH-02",
      dayOrder: "D2",
      status: "Completed",
      markedTime: "10:45 AM",
      shift: "Shift I"
    },
    {
      id: "hist-2",
      date: "2026-07-03",
      subject: "English II",
      classCode: "I B.Sc CS",
      period: "2nd Hour",
      originalFaculty: "Prof. H. Shabana",
      engagedFaculty: LOGGED_IN_FACULTY,
      room: "LH-01",
      dayOrder: "D3",
      status: "Completed",
      markedTime: "11:15 AM",
      shift: "Shift I"
    },
    {
      id: "hist-3",
      date: "2026-07-04",
      subject: "Web Technology",
      classCode: "III BCA",
      period: "4th Hour",
      originalFaculty: "Dr. Ayesha Siddiqua J",
      engagedFaculty: LOGGED_IN_FACULTY,
      room: "LH-05",
      dayOrder: "D2",
      status: "Pending",
      markedTime: "02:30 PM",
      shift: "Shift II"
    }
  ]);

  // Derived Day Order
  const getDayOrderForDate = (dateString: string): string => {
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) return "D1";
      return getDayOrder(parsedDate);
    } catch {
      return "D1";
    }
  };
  const activeDayOrder = getDayOrderForDate(dateStr);

  // Available Classes
  const availableClasses = React.useMemo(() => {
    const facultySched = FACULTY_SCHEDULES[selectedFaculty] || {};
    return facultySched[activeDayOrder] || [];
  }, [selectedFaculty, activeDayOrder]);

  // Reset selected class index when faculty or date changes
  React.useEffect(() => {
    setSelectedClassIndex(null);
  }, [selectedFaculty, dateStr]);

  const selectedClass = selectedClassIndex !== null ? availableClasses[selectedClassIndex] : null;

  // Actions
  const handleGoToMarkAttendance = () => {
    if (!selectedClass) return;

    // Check duplicate
    const isDuplicate = history.some(item =>
      item.date === dateStr &&
      item.classCode === selectedClass.classCode &&
      item.period === selectedClass.period &&
      item.status === "Completed"
    );

    if (isDuplicate) {
      showAlert(
        "Duplicate Entry",
        "Attendance has already been marked for this class at this period."
      );
      return;
    }

    // Add to history state as In Progress
    const newRecord: EngageRecord = {
      id: `hist-${history.length + 1}`,
      date: dateStr,
      subject: selectedClass.subject,
      classCode: selectedClass.classCode,
      period: selectedClass.period,
      originalFaculty: selectedFaculty,
      engagedFaculty: LOGGED_IN_FACULTY,
      room: selectedClass.room,
      dayOrder: activeDayOrder,
      status: "In Progress",
      shift: "Shift I" // Defaults to Shift I
    };

    setHistory([newRecord, ...history]);

    // Navigate to mark attendance screen (Classes tab)
    router.push({
      pathname: "/faculty/(faculty-tabs)/classes",
      params: {
        subjectName: selectedClass.subject,
        classCode: selectedClass.classCode,
        period: selectedClass.period,
        date: dateStr,
        originalFaculty: selectedFaculty,
        attendanceType: "ENGAGED",
      }
    });
  };

  // Filter Actions
  const openFilterDialog = () => {
    setTempFilterDate(filterDate);
    setTempFilterFaculty(filterFaculty);
    setTempFilterClass(filterClass);
    setTempFilterStatus(filterStatus);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilterDate(tempFilterDate);
    setFilterFaculty(tempFilterFaculty);
    setFilterClass(tempFilterClass);
    setFilterStatus(tempFilterStatus);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilterDate("");
    setFilterFaculty("All");
    setFilterClass("All");
    setFilterStatus("All");
    setShowFilterModal(false);
  };

  // Filtered History List
  const filteredHistory = history.filter(item => {
    // 1. Shift Category Filter
    if (item.shift !== selectedHistoryShift) return false;

    // 2. Dialog Box Filters
    const matchesDate = !filterDate.trim() || item.date.includes(filterDate.trim());
    const matchesFaculty = filterFaculty === "All" || item.originalFaculty === filterFaculty;
    const matchesClass = filterClass === "All" || item.classCode === filterClass;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesDate && matchesFaculty && matchesClass && matchesStatus;
  });

  // Badge styles helper
  const getBadgeStyles = (status: EngageRecord["status"]) => {
    switch (status) {
      case "Pending": return { bg: "#FFFBEB", txt: "#D97706" };
      case "In Progress": return { bg: "#EFF6FF", txt: "#2563EB" };
      case "Completed": return { bg: "#ECFDF5", txt: "#059669" };
      case "Cancelled": return { bg: "#F3F4F6", txt: "#6B7280" };
    }
  };

  const hasActiveFilters = filterDate !== "" || filterFaculty !== "All" || filterClass !== "All" || filterStatus !== "All";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Engage Attendance</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        
        {/* ── Section: Engage Class Form ── */}
        <View style={styles.card}>
          <Text style={styles.formLabel}>Original Teacher Assigned</Text>
          <Pressable style={styles.dropdownTrigger} onPress={() => setShowFacultyPicker(true)}>
            <Text style={styles.dropdownText}>{selectedFaculty}</Text>
            <ChevronDown size={14} color={Colors.BluePrimary} />
          </Pressable>

          <Text style={styles.formLabel}>Date</Text>
          <TextInput
            style={styles.textInput}
            value={dateStr}
            onChangeText={setDateStr}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.dayOrderBadge}>
            <Text style={styles.dayOrderBadgeTxt}>Calculated Day Order: {activeDayOrder}</Text>
          </View>

          <Text style={[styles.formLabel, { marginTop: 12 }]}>Available Classes</Text>
          {availableClasses.length === 0 ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>No available classes found for this faculty and date.</Text>
            </View>
          ) : (
            <View style={styles.classesList}>
              {availableClasses.map((item, idx) => {
                const isSelected = selectedClassIndex === idx;
                return (
                  <Pressable
                    key={idx}
                    style={[styles.classItemCard, isSelected && styles.classItemCardActive]}
                    onPress={() => setSelectedClassIndex(idx)}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={[styles.classItemTitle, isSelected && { color: Colors.BluePrimary }]}>
                        {item.subject}
                      </Text>
                      {isSelected && <Check size={16} color={Colors.BluePrimary} />}
                    </View>
                    <Text style={styles.classItemMeta}>
                      Class: {item.classCode}  ·  Period: {item.period}  ·  Room: {item.room}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Hour display */}
          <Text style={[styles.formLabel, { marginTop: 12 }]}>Hour / Period to Engage</Text>
          <View style={styles.textInputDisabled}>
            <Text style={styles.disabledValText}>{selectedClass ? selectedClass.period : "Auto-filled on class selection"}</Text>
          </View>

          <Pressable
            style={[styles.submitBtn, !selectedClass && styles.submitBtnDisabled]}
            disabled={!selectedClass}
            onPress={handleGoToMarkAttendance}
          >
            <Text style={styles.submitBtnTxt}>Go to Mark Attendance</Text>
          </Pressable>
        </View>

        {/* ── Section: History ── */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeading}>Engage Attendance History</Text>
            <Pressable style={styles.filterBtn} onPress={openFilterDialog}>
              <Filter size={15} color={Colors.BluePrimary} />
              <Text style={styles.filterBtnTxt}>Filters</Text>
            </Pressable>
          </View>

          {/* Shift Segmented Tabs */}
          <View style={styles.shiftTabs}>
            {SHIFTS.map((shift) => {
              const active = selectedHistoryShift === shift;
              return (
                <Pressable
                  key={shift}
                  style={[styles.shiftTab, active && styles.shiftTabActive]}
                  onPress={() => setSelectedHistoryShift(shift as any)}
                >
                  <Text style={[styles.shiftTabText, active && styles.shiftTabTextActive]}>
                    {shift}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersRow}>
              {filterDate !== "" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipTxt}>Date: {filterDate}</Text>
                  <Pressable onPress={() => setFilterDate("")}>
                    <X size={12} color="#64748B" />
                  </Pressable>
                </View>
              )}
              {filterFaculty !== "All" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipTxt}>{filterFaculty}</Text>
                  <Pressable onPress={() => setFilterFaculty("All")}>
                    <X size={12} color="#64748B" />
                  </Pressable>
                </View>
              )}
              {filterClass !== "All" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipTxt}>{filterClass}</Text>
                  <Pressable onPress={() => setFilterClass("All")}>
                    <X size={12} color="#64748B" />
                  </Pressable>
                </View>
              )}
              {filterStatus !== "All" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipTxt}>{filterStatus}</Text>
                  <Pressable onPress={() => setFilterStatus("All")}>
                    <X size={12} color="#64748B" />
                  </Pressable>
                </View>
              )}
              <Pressable style={styles.clearAllBtn} onPress={() => { setFilterDate(""); setFilterFaculty("All"); setFilterClass("All"); setFilterStatus("All"); }}>
                <Text style={styles.clearAllBtnTxt}>Reset</Text>
              </Pressable>
            </View>
          )}

          {filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTxt}>No historical records found for {selectedHistoryShift}.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.historyCardClass}>{item.classCode} · {item.period}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeTxt, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.historyCardBody}>
                      <Text style={styles.historyLabel}>Subject: <Text style={styles.historyVal}>{item.subject}</Text></Text>
                      <Text style={styles.historyLabel}>Original Faculty: <Text style={styles.historyVal}>{item.originalFaculty}</Text></Text>
                      <Text style={styles.historyLabel}>Room: <Text style={styles.historyVal}>{item.room}  ·  Day Order: {item.dayOrder}</Text></Text>
                      <Text style={styles.historyLabel}>Date: <Text style={styles.historyVal}>{item.date}</Text></Text>
                      {item.markedTime && (
                        <Text style={styles.historyLabel}>Marked Time: <Text style={styles.historyVal}>{item.markedTime}</Text></Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Bottom Sheet: Original Faculty Picker ── */}
      <Modal visible={showFacultyPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFacultyPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Original Faculty</Text>
              <Pressable onPress={() => setShowFacultyPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {FACULTY_LIST.map((fac) => {
                const active = selectedFaculty === fac;
                return (
                  <Pressable
                    key={fac}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedFaculty(fac); setShowFacultyPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{fac}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Filter Dialog Box bottom sheet ── */}
      <Modal visible={showFilterModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFilterModal(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 24, maxHeight: "80%" }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Filter History</Text>
              <Pressable onPress={() => setShowFilterModal(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Date Search</Text>
              <TextInput
                style={styles.textInput}
                value={tempFilterDate}
                onChangeText={setTempFilterDate}
                placeholder="e.g. 2026-07-04"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.formLabel}>Original Faculty</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowFilterFacultyPicker(true)}>
                <Text style={styles.dropdownText}>{tempFilterFaculty}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Class</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowFilterClassPicker(true)}>
                <Text style={styles.dropdownText}>{tempFilterClass}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Status</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowFilterStatusPicker(true)}>
                <Text style={styles.dropdownText}>{tempFilterStatus}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <View style={styles.filterActionGroup}>
                <Pressable style={styles.resetBtn} onPress={resetFilters}>
                  <Text style={styles.resetBtnTxt}>Reset</Text>
                </Pressable>
                <Pressable style={styles.applyBtn} onPress={applyFilters}>
                  <Text style={styles.applyBtnTxt}>Apply Filters</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Sub-picker: Filter Original Faculty ── */}
      <Modal visible={showFilterFacultyPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFilterFacultyPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16, zIndex: 10000 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Faculty</Text>
              <Pressable onPress={() => setShowFilterFacultyPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {["All", ...FACULTY_LIST].map((fac) => {
                const active = tempFilterFaculty === fac;
                return (
                  <Pressable
                    key={fac}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempFilterFaculty(fac); setShowFilterFacultyPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{fac}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Sub-picker: Filter Class ── */}
      <Modal visible={showFilterClassPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFilterClassPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16, zIndex: 10000 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Class</Text>
              <Pressable onPress={() => setShowFilterClassPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {["All", ...CLASSES].map((c) => {
                const active = tempFilterClass === c;
                return (
                  <Pressable
                    key={c}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempFilterClass(c); setShowFilterClassPicker(false); }}
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

      {/* ── Sub-picker: Filter Status ── */}
      <Modal visible={showFilterStatusPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowFilterStatusPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16, zIndex: 10000 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Status</Text>
              <Pressable onPress={() => setShowFilterStatusPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {["All", ...STATUSES].map((s) => {
                const active = tempFilterStatus === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempFilterStatus(s); setShowFilterStatusPicker(false); }}
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

  // Content
  scrollContent: { padding: 16 },

  // Form Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  formLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, width: "100%", marginBottom: 12,
    justifyContent: "space-between",
  },
  dropdownText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  textInput: {
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 12,
  },
  dayOrderBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.BluePrimary + "15",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12,
  },
  dayOrderBadgeTxt: { fontSize: 11.5, fontWeight: "700", color: Colors.BluePrimary },

  // Available class choices
  classesList: { gap: 8, marginBottom: 12 },
  classItemCard: {
    backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, padding: 12,
  },
  classItemCardActive: {
    borderColor: Colors.BluePrimary, backgroundColor: Colors.BluePrimary + "05",
  },
  classItemTitle: { fontSize: 12.5, fontWeight: "700", color: "#1E293B" },
  classItemMeta: { fontSize: 11.5, color: "#64748B", fontWeight: "600", marginTop: 4 },
  errorBox: {
    backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D",
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  errorTxt: { fontSize: 12, color: "#D97706", fontWeight: "600", fontStyle: "italic" },

  textInputDisabled: {
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: "center", marginBottom: 16,
  },
  disabledValText: { fontSize: 13, color: "#64748B", fontWeight: "600" },

  submitBtn: {
    width: "100%", paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.BluePrimary, alignItems: "center", marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitBtnTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

  // History UI
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyHeading: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#EFF6FF" },
  filterBtnTxt: { fontSize: 11.5, fontWeight: "700", color: Colors.BluePrimary },

  // Shift tabs segmented control
  shiftTabs: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4, marginBottom: 12, marginTop: 4 },
  shiftTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  shiftTabActive: { backgroundColor: "#FFFFFF", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  shiftTabText: { fontSize: 12.5, fontWeight: "600", color: "#64748B" },
  shiftTabTextActive: { color: Colors.BluePrimary, fontWeight: "800" },

  // Active Filters Badges Row
  activeFiltersRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14, alignItems: "center" },
  activeFilterChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  activeFilterChipTxt: { fontSize: 11, fontWeight: "700", color: "#475569" },
  clearAllBtn: { paddingHorizontal: 6 },
  clearAllBtnTxt: { fontSize: 11.5, fontWeight: "800", color: "#EF4444" },

  // Filter actions inside modal
  filterActionGroup: { flexDirection: "row", gap: 10, marginTop: 16 },
  resetBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center" },
  resetBtnTxt: { fontSize: 12.5, fontWeight: "700", color: "#475569" },
  applyBtn: { flex: 2, paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.BluePrimary, alignItems: "center" },
  applyBtnTxt: { fontSize: 12.5, fontWeight: "800", color: "#FFFFFF" },

  emptyContainer: { paddingVertical: 32, alignItems: "center", justifyContent: "center" },
  emptyTxt: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" },

  historyList: { gap: 10 },
  historyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 14 },
  historyCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  historyCardClass: { fontSize: 13.5, fontWeight: "800", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeTxt: { fontSize: 9.5, fontWeight: "800" },
  historyCardBody: { gap: 4 },
  historyLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  historyVal: { color: "#1E293B", fontWeight: "700" },

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
});
