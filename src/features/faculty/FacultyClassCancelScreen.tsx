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
import { mockFacultyTimetable } from "../../data/mockFacultyData";
import { getDayOrder } from "../../utils/dayOrder";

// Types
interface CancelRequest {
  id: string;
  date: string;
  dayOrder: string;
  subject: string;
  classCode: string;
  section: string;
  period: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";
  createdTime: string;
  shift: "Shift I" | "Shift II" | "Girls";
}

const CLASSES = ["I B.Sc CS", "II B.Sc CS", "III B.Sc CS", "III BCA"];
const STATUSES = ["Pending", "Approved", "Rejected", "Cancelled", "Completed"];
const SHIFTS = ["Shift I", "Shift II", "Girls"];

export function FacultyClassCancelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  const LOGGED_IN_FACULTY = "Dr. P. Rizwan Ahmed";

  // ── States ──
  const [dateStr, setDateStr] = React.useState("2026-07-06"); // Mon (D2)
  const [selectedSessionIdx, setSelectedSessionIdx] = React.useState<number | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");

  // Sub-picker sheets visibility
  const [showSessionPicker, setShowSessionPicker] = React.useState(false);
  const [showHistoryFilterModal, setShowHistoryFilterModal] = React.useState(false);

  // Tab View
  const [activeTab, setActiveTab] = React.useState<"REQUESTS" | "HISTORY">("REQUESTS");
  const [selectedShift, setSelectedShift] = React.useState<"Shift I" | "Shift II" | "Girls">("Shift I");

  // History Filter States (Applied)
  const [filterDate, setFilterDate] = React.useState("");
  const [filterClass, setFilterClass] = React.useState("All");
  const [filterStatus, setFilterStatus] = React.useState("All");

  // History Filter Temp States (for Dialog Box Form)
  const [tempFilterDate, setTempFilterDate] = React.useState("");
  const [tempFilterClass, setTempFilterClass] = React.useState("All");
  const [tempFilterStatus, setTempFilterStatus] = React.useState("All");

  // Sub-pickers inside History filters
  const [showFilterClassPicker, setShowFilterClassPicker] = React.useState(false);
  const [showFilterStatusPicker, setShowFilterStatusPicker] = React.useState(false);

  // Mock Cancellation Requests State
  const [cancellationRequests, setCancellationRequests] = React.useState<CancelRequest[]>([
    {
      id: "can-1",
      date: "2026-07-04",
      dayOrder: "D2",
      subject: "Operating System",
      classCode: "II B.Sc CS",
      section: "A",
      period: "10:00 - 11:00",
      reason: "Official HOD meeting with Principal regarding admissions",
      status: "Approved",
      createdTime: "04-07-2026 08:30 AM",
      shift: "Shift I"
    },
    {
      id: "can-2",
      date: "2026-07-04",
      dayOrder: "D2",
      subject: "Database Management System",
      classCode: "III B.Sc CS",
      section: "A",
      period: "02:30 - 03:30",
      reason: "Urgent health checkup appointment",
      status: "Pending",
      createdTime: "04-07-2026 11:15 AM",
      shift: "Shift I"
    },
    {
      id: "can-3",
      date: "2026-07-03",
      dayOrder: "D1",
      subject: "DBMS Laboratory",
      classCode: "III B.Sc CS",
      section: "A",
      period: "02:30 - 04:30",
      reason: "Power outage in campus CS Lab-A",
      status: "Completed",
      createdTime: "03-07-2026 01:45 PM",
      shift: "Shift I"
    }
  ]);

  // Derive day of the week
  const getDayOfWeek = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Mon";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[d.getDay()];
      return dayName === "Sun" ? "Mon" : dayName;
    } catch {
      return "Mon";
    }
  };

  const dayOfWeek = getDayOfWeek(dateStr);
  const activeDayOrder = getDayOrder(new Date(dateStr)) || "D1";

  // Load classes assigned to logged-in faculty on the selected date
  const availableSessions = React.useMemo(() => {
    return mockFacultyTimetable[dayOfWeek] || [];
  }, [dayOfWeek]);

  // Reset selected class index when date changes
  React.useEffect(() => {
    setSelectedSessionIdx(null);
  }, [dateStr]);

  const selectedSession = selectedSessionIdx !== null ? availableSessions[selectedSessionIdx] : null;

  // Actions
  const handleCancelPeriodSubmit = () => {
    if (!selectedSession) {
      showAlert("Selection Required", "Please select a period to cancel.");
      return;
    }
    if (!cancelReason.trim()) {
      showAlert("Input Required", "Please provide a reason for cancellation.");
      return;
    }
    if (cancelReason.trim().length < 5) {
      showAlert("Invalid Reason", "Reason must be at least 5 characters long.");
      return;
    }

    // Check duplicate
    const isDuplicate = cancellationRequests.some(item =>
      item.date === dateStr &&
      item.period === selectedSession.time &&
      item.status !== "Rejected" &&
      item.status !== "Cancelled"
    );

    if (isDuplicate) {
      showAlert("Duplicate Request", "A cancellation request for this period already exists.");
      return;
    }

    // Create cancel request
    const now = new Date();
    const createdTimeStr = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    const newRequest: CancelRequest = {
      id: `can-${cancellationRequests.length + 1}`,
      date: dateStr,
      dayOrder: activeDayOrder,
      subject: selectedSession.subject,
      classCode: selectedSession.section,
      section: "A",
      period: selectedSession.time,
      reason: cancelReason.trim(),
      status: "Pending",
      createdTime: createdTimeStr,
      shift: selectedShift
    };

    setCancellationRequests([newRequest, ...cancellationRequests]);

    showAlert(
      "Success",
      `Cancellation requested. Students of ${selectedSession.section} will be notified about the cancelled class.`,
      [
        {
          text: "OK",
          onPress: () => {
            setCancelReason("");
            setSelectedSessionIdx(null);
          }
        }
      ]
    );
  };

  // Filter Actions
  const openHistoryFilters = () => {
    setTempFilterDate(filterDate);
    setTempFilterClass(filterClass);
    setTempFilterStatus(filterStatus);
    setShowHistoryFilterModal(true);
  };

  const applyFilters = () => {
    setFilterDate(tempFilterDate);
    setFilterClass(tempFilterClass);
    setFilterStatus(tempFilterStatus);
    setShowHistoryFilterModal(false);
  };

  const resetFilters = () => {
    setFilterDate("");
    setFilterClass("All");
    setFilterStatus("All");
    setShowHistoryFilterModal(false);
  };

  // Derived filtered requests lists
  const activeRequestsList = cancellationRequests.filter(item =>
    item.shift === selectedShift &&
    item.status !== "Completed" &&
    item.status !== "Cancelled" &&
    item.status !== "Rejected"
  );

  const historyRequestsList = cancellationRequests.filter(item => {
    const matchesShift = item.shift === selectedShift;
    const isPast = item.status === "Completed" || item.status === "Cancelled" || item.status === "Rejected" || item.status === "Approved";
    const matchesDate = !filterDate.trim() || item.date.includes(filterDate.trim());
    const matchesClass = filterClass === "All" || item.classCode === filterClass;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesShift && isPast && matchesDate && matchesClass && matchesStatus;
  });

  const getBadgeStyles = (status: CancelRequest["status"]) => {
    switch (status) {
      case "Pending": return { bg: "#FFFBEB", txt: "#D97706" };
      case "Approved": return { bg: "#EFF6FF", txt: "#2563EB" };
      case "Rejected": return { bg: "#FEF2F2", txt: "#EF4444" };
      case "Cancelled": return { bg: "#F3F4F6", txt: "#6B7280" };
      case "Completed": return { bg: "#ECFDF5", txt: "#059669" };
    }
  };

  const hasActiveFilters = filterDate !== "" || filterClass !== "All" || filterStatus !== "All";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Let Off / Class Cancel</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Sub-navigation Tabs ── */}
      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tab, activeTab === "REQUESTS" && styles.tabActive]}
          onPress={() => setActiveTab("REQUESTS")}
        >
          <Text style={[styles.tabText, activeTab === "REQUESTS" && styles.tabTextActive]}>Active Requests</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "HISTORY" && styles.tabActive]}
          onPress={() => setActiveTab("HISTORY")}
        >
          <Text style={[styles.tabText, activeTab === "HISTORY" && styles.tabTextActive]}>History Log</Text>
        </Pressable>
      </View>

      {/* ── Shift segmented tab bar ── */}
      <View style={styles.shiftTabsWrapper}>
        <View style={styles.shiftTabs}>
          {SHIFTS.map((shift) => {
            const active = selectedShift === shift;
            return (
              <Pressable
                key={shift}
                style={[styles.shiftTab, active && styles.shiftTabActive]}
                onPress={() => setSelectedShift(shift as any)}
              >
                <Text style={[styles.shiftTabText, active && styles.shiftTabTextActive]}>{shift}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        
        {/* ── Cancellation Request Form ── */}
        {activeTab === "REQUESTS" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Submit Class Cancellation</Text>

            <Text style={styles.formLabel}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.dayOrderBadge}>
              <Text style={styles.dayOrderBadgeTxt}>Day Order: {activeDayOrder} ({dayOfWeek})</Text>
            </View>

            <Text style={styles.formLabel}>Select Period to Cancel</Text>
            <Pressable style={styles.dropdownTrigger} onPress={() => setShowSessionPicker(true)}>
              <Text style={styles.dropdownText}>
                {selectedSession ? `${selectedSession.time} - ${selectedSession.subject}` : "Select assigned period..."}
              </Text>
              <ChevronDown size={14} color={Colors.BluePrimary} />
            </Pressable>

            {/* Read-Only Class Summary Card */}
            {selectedSession && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardHeading}>Selected Class Details</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subject:</Text>
                    <Text style={styles.summaryVal}>{selectedSession.subject}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Class:</Text>
                    <Text style={styles.summaryVal}>{selectedSession.section} - A</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Room:</Text>
                    <Text style={styles.summaryVal}>{selectedSession.room}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Period:</Text>
                    <Text style={styles.summaryVal}>{selectedSession.time}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Day Order:</Text>
                    <Text style={styles.summaryVal}>{activeDayOrder}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Students:</Text>
                    <Text style={styles.summaryVal}>{selectedSession.totalStudents ?? 58}</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.formLabel, { marginTop: 12 }]}>Reason for Cancellation</Text>
            <TextInput
              style={styles.textInputArea}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Reason to broadcast to students..."
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={[styles.submitBtn, (!selectedSession || !cancelReason.trim()) && styles.submitBtnDisabled]}
              disabled={!selectedSession || !cancelReason.trim()}
              onPress={handleCancelPeriodSubmit}
            >
              <Text style={styles.submitBtnTxt}>Cancel Period & Notify Students</Text>
            </Pressable>
          </View>
        )}

        {/* ── Active Requests list ── */}
        {activeTab === "REQUESTS" && (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionHeading}>My Cancellation Requests ({selectedShift})</Text>
            {activeRequestsList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTxt}>No active cancellation requests found for this shift.</Text>
              </View>
            ) : (
              activeRequestsList.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.requestCard}>
                    <View style={styles.requestCardHeader}>
                      <Text style={styles.requestCardClass}>{item.classCode}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeTxt, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.requestCardBody}>
                      <Text style={styles.requestLabel}>Date: <Text style={styles.requestVal}>{item.date} ({item.dayOrder})</Text></Text>
                      <Text style={styles.requestLabel}>Period: <Text style={styles.requestVal}>{item.period}</Text></Text>
                      <Text style={styles.requestLabel}>Subject: <Text style={styles.requestVal}>{item.subject}</Text></Text>
                      <Text style={styles.requestLabel}>Reason: <Text style={[styles.requestVal, { fontWeight: "600", fontStyle: "italic" }]}>{item.reason}</Text></Text>
                      <Text style={styles.requestLabel}>Submitted: <Text style={styles.requestVal}>{item.createdTime}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── History log list ── */}
        {activeTab === "HISTORY" && (
          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionHeading}>Cancellation Log ({selectedShift})</Text>
              <Pressable style={styles.filterBtn} onPress={openHistoryFilters}>
                <Filter size={15} color={Colors.BluePrimary} />
                <Text style={styles.filterBtnTxt}>Filters</Text>
              </Pressable>
            </View>

            {/* Active filter badges */}
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
                <Pressable style={styles.clearAllBtn} onPress={() => { setFilterDate(""); setFilterClass("All"); setFilterStatus("All"); }}>
                  <Text style={styles.clearAllBtnTxt}>Reset</Text>
                </Pressable>
              </View>
            )}

            {historyRequestsList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTxt}>No historical cancellation logs found matching current filters.</Text>
              </View>
            ) : (
              historyRequestsList.map((item) => {
                const badge = getBadgeStyles(item.status);
                return (
                  <View key={item.id} style={styles.requestCard}>
                    <View style={styles.requestCardHeader}>
                      <Text style={styles.requestCardClass}>{item.classCode}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeTxt, { color: badge.txt }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.requestCardBody}>
                      <Text style={styles.requestLabel}>Date: <Text style={styles.requestVal}>{item.date} ({item.dayOrder})</Text></Text>
                      <Text style={styles.requestLabel}>Period: <Text style={styles.requestVal}>{item.period}</Text></Text>
                      <Text style={styles.requestLabel}>Subject: <Text style={styles.requestVal}>{item.subject}</Text></Text>
                      <Text style={styles.requestLabel}>Reason: <Text style={[styles.requestVal, { fontWeight: "600", fontStyle: "italic" }]}>{item.reason}</Text></Text>
                      <Text style={styles.requestLabel}>Submitted: <Text style={styles.requestVal}>{item.createdTime}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      {/* ── Bottom Sheet Picker: Period Selector ── */}
      <Modal visible={showSessionPicker} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowSessionPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Assigned Period ({activeDayOrder})</Text>
              <Pressable onPress={() => setShowSessionPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {availableSessions.length === 0 ? (
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No periods scheduled for this day.</Text>
                </View>
              ) : (
                availableSessions.map((item, idx) => {
                  const active = selectedSessionIdx === idx;
                  return (
                    <Pressable
                      key={idx}
                      style={[styles.pickerItem, active && styles.pickerItemActive]}
                      onPress={() => { setSelectedSessionIdx(idx); setShowSessionPicker(false); }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{item.subject}</Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          Class: {item.section}  ·  Period: {item.time}  ·  Room: {item.room}
                        </Text>
                      </View>
                      {active && <Check size={16} color={Colors.BluePrimary} />}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Filter Dialog Box bottom sheet ── */}
      <Modal visible={showHistoryFilterModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowHistoryFilterModal(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 24, maxHeight: "80%" }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Filter Cancellation Log</Text>
              <Pressable onPress={() => setShowHistoryFilterModal(false)} style={styles.pickerCloseBtn}>
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

      {/* ── Sub-picker: Filter Class Selector ── */}
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

      {/* ── Sub-picker: Filter Status Selector ── */}
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

  // Sub Tabs navigation
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

  // Shift segmented tabs
  shiftTabsWrapper: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  shiftTabs: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4, marginBottom: 8 },
  shiftTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  shiftTabActive: { backgroundColor: "#FFFFFF", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  shiftTabText: { fontSize: 12.5, fontWeight: "600", color: "#64748B" },
  shiftTabTextActive: { color: Colors.BluePrimary, fontWeight: "800" },

  // Content
  scrollContent: { padding: 16 },

  // Card styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B", marginBottom: 14 },
  formLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  textInput: {
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 12,
  },
  textInputArea: {
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 16,
    textAlignVertical: "top", minHeight: 70,
  },
  dayOrderBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.BluePrimary + "15",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12,
  },
  dayOrderBadgeTxt: { fontSize: 11.5, fontWeight: "700", color: Colors.BluePrimary },
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, width: "100%", marginBottom: 12,
  },
  dropdownText: { fontSize: 13, fontWeight: "700", color: "#475569" },

  // Read-only summary card
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12,
    padding: 12, marginBottom: 14,
  },
  summaryCardHeading: { fontSize: 12, fontWeight: "800", color: Colors.BluePrimary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  summaryGrid: { gap: 6 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  summaryVal: { fontSize: 12, fontWeight: "800", color: "#1E293B" },

  submitBtn: {
    width: "100%", paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.ColorAbsent, alignItems: "center", marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitBtnTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

  // Section heading inside scroll content
  section: { gap: 10 },
  sectionHeading: { fontSize: 14, fontWeight: "800", color: "#1E293B" },

  // Request list card
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  requestCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  requestCardClass: { fontSize: 13.5, fontWeight: "800", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeTxt: { fontSize: 9.5, fontWeight: "800" },
  requestCardBody: { gap: 4 },
  requestLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  requestVal: { color: "#1E293B", fontWeight: "700" },

  // History list section
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#EFF6FF" },
  filterBtnTxt: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary },

  // Active filters badges row
  activeFiltersRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14, alignItems: "center", marginTop: 4 },
  activeFilterChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  activeFilterChipTxt: { fontSize: 11, fontWeight: "700", color: "#475569" },
  clearAllBtn: { paddingHorizontal: 6 },
  clearAllBtnTxt: { fontSize: 11.5, fontWeight: "800", color: "#EF4444" },

  // Modal overlays
  pickerOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", zIndex: 9999 },
  pickerDismiss: { flex: 1 },
  pickerSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 30, maxHeight: "60%" },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  pickerTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  pickerCloseBtn: { padding: 4 },
  pickerList: { paddingHorizontal: 16, paddingTop: 8 },
  pickerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  pickerItemActive: { backgroundColor: Colors.BluePrimary + "0D" },
  pickerItemText: { fontSize: 13.5, fontWeight: "600", color: "#475569" },
  pickerItemTextActive: { fontWeight: "700", color: Colors.BluePrimary },

  filterActionGroup: { flexDirection: "row", gap: 10, marginTop: 16 },
  resetBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center" },
  resetBtnTxt: { fontSize: 12.5, fontWeight: "700", color: "#475569" },
  applyBtn: { flex: 2, paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.BluePrimary, alignItems: "center" },
  applyBtnTxt: { fontSize: 12.5, fontWeight: "800", color: "#FFFFFF" },

  emptyContainer: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  emptyTxt: { fontSize: 12.5, color: "#94A3B8", fontStyle: "italic", textAlign: "center" },
});
