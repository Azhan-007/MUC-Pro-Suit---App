import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Modal, Platform, StatusBar, SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react-native";
import { Colors } from "../../theme";
import { getDayOrder, DAY_ORDER_MAP } from "../../utils/dayOrder";

interface TimetablePeriod {
  subject: string;
  code: string;
  faculty: string;
  room: string;
  credits: number;
  type: "Theory" | "Lab";
  status: "Normal" | "Replacement" | "Suspended";
}

interface TimetableDayOrderRow {
  dayOrder: "D1" | "D2" | "D3" | "D4" | "D5" | "D6";
  h1: TimetablePeriod;
  h2: TimetablePeriod;
  h3: TimetablePeriod;
  h4: TimetablePeriod;
  h5: TimetablePeriod;
}

const DEFAULT_PERIODS: Record<string, Omit<TimetablePeriod, "status">> = {
  DBMS: { subject: "Database Management System", code: "CS301", faculty: "Dr P Rizwan Ahmed", room: "LH-01", credits: 4, type: "Theory" },
  OS: { subject: "Operating System", code: "CS201", faculty: "Dr. K H KALEEMULLAH", room: "LH-01", credits: 4, type: "Theory" },
  MAT: { subject: "Mathematics II", code: "MA102", faculty: "Prof. S. Tamilselvan", room: "LH-01", credits: 3, type: "Theory" },
  ENG: { subject: "English II", code: "EN101", faculty: "Prof. H. Shabana", room: "LH-01", credits: 3, type: "Theory" },
  LAB: { subject: "DBMS Laboratory", code: "CS301P", faculty: "Dr P Rizwan Ahmed", room: "Lab-A", credits: 2, type: "Lab" },
  SEM: { subject: "Seminar & HOD Class", code: "CS105", faculty: "Dr. AYESHA SIDDIQUA J", room: "LH-01", credits: 1, type: "Theory" },
  LIB: { subject: "Library Reference", code: "LB101", faculty: "Librarian", room: "Library", credits: 1, type: "Theory" },
};

const BATCH_YEARS = ["2026-27", "2025-26", "2024-25", "2023-24"];
const BATCHES = ["I B.Sc CS", "II B.Sc CS", "III B.Sc CS", "III BCA"];
const DAY_ORDERS = ["D1", "D2", "D3", "D4", "D5", "D6"];
type ShiftType = "SHIFT_I" | "SHIFT_II" | "GIRLS";

const SHIFT_TABS: { key: ShiftType; label: string }[] = [
  { key: "SHIFT_I",  label: "Shift I"  },
  { key: "SHIFT_II", label: "Shift II" },
  { key: "GIRLS",    label: "Girls"    },
];

const generateMockTimetable = (shift: string, batch: string, year: string): TimetableDayOrderRow[] => {
  const isShiftII = shift === "SHIFT_II";
  const isGirls = shift === "GIRLS";
  const yearSuffix = year === "2026-27" ? "" : year === "2025-26" ? "-E" : year === "2024-25" ? "-D" : "-C";

  const getPeriod = (name: string, status: "Normal" | "Replacement" | "Suspended" = "Normal"): TimetablePeriod => {
    const base = DEFAULT_PERIODS[name] || DEFAULT_PERIODS.DBMS;
    let room = base.room;
    let faculty = base.faculty;
    const code = base.code + yearSuffix;
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
    return { ...base, code, room, faculty, status };
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

export function FacultyBatchTimetableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  const today = new Date();
  const todayDayOrder = getDayOrder(today);
  const todayWeekday = today.toLocaleDateString("en-IN", { weekday: "long" });

  // ── State ──
  const [activeShift, setActiveShift] = React.useState<ShiftType>("SHIFT_I");
  const [batchSelected, setBatchSelected] = React.useState("III B.Sc CS");
  const [batchYear, setBatchYear] = React.useState("2026-27");
  const [showYearPicker, setShowYearPicker] = React.useState(false);
  const [showBatchPicker, setShowBatchPicker] = React.useState(false);
  const [showFilter, setShowFilter] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<any | null>(null);

  // Temp filter states
  const [tempYear, setTempYear] = React.useState(batchYear);
  const [tempBatch, setTempBatch] = React.useState(batchSelected);

  const timetableData = generateMockTimetable(activeShift, batchSelected, batchYear);

  const getCurrentHourPeriod = (): string => {
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const timeVal = hours * 100 + minutes;
    if (timeVal >= 930 && timeVal < 1030) return "h1";
    if (timeVal >= 1030 && timeVal < 1130) return "h2";
    if (timeVal >= 1145 && timeVal < 1245) return "h3";
    if (timeVal >= 1345 && timeVal < 1445) return "h4";
    if (timeVal >= 1445 && timeVal < 1545) return "h5";
    return "";
  };
  const activePeriod = getCurrentHourPeriod();

  const abbrev = (subject: string): string => {
    const map: Record<string, string> = {
      "Database Management System": "DBMS",
      "Operating System": "OS",
      "Mathematics II": "Maths II",
      "English II": "English II",
      "DBMS Laboratory": "DBMS Lab",
      "Seminar & HOD Class": "Seminar",
      "Library Reference": "Library",
    };
    return map[subject] ?? subject.slice(0, 10);
  };

  const renderCell = (
    period: any,
    periodKey: string,
    isRowActive: boolean,
    dayOrder: string,
    isLast: boolean
  ) => {
    const isCellActive = isRowActive && periodKey === activePeriod;
    const isSuspended = period.status === "Suspended";
    const isReplacement = period.status === "Replacement";

    return (
      <Pressable
        style={[
          styles.ttCell,
          !isLast && styles.ttCellBorderRight,
          isCellActive && styles.ttCellActive,
          isSuspended && styles.ttCellSuspended,
        ]}
        onPress={() => {
          setSelectedCell({
            ...period,
            periodName: periodKey.toUpperCase(),
            dayOrder: dayOrder,
          });
        }}
      >
        <Text
          numberOfLines={2}
          style={[
            styles.ttCellText,
            isCellActive && styles.ttCellTextActive,
            isSuspended && { color: "#EF4444", textDecorationLine: "line-through" },
          ]}
        >
          {abbrev(period.subject)}
        </Text>
        {isReplacement && <Text style={styles.ttBadge}>🔄</Text>}
        {isSuspended && <Text style={styles.ttBadge}>🚫</Text>}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/faculty" as any))}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Batch Timetable</Text>
        </View>
        <Pressable style={styles.filterIconBtn} onPress={() => { setTempYear(batchYear); setShowFilter(true); }}>
          <SlidersHorizontal size={18} color={Colors.BluePrimary} />
        </Pressable>
      </View>

      {/* ── Shift Tabs ── */}
      <View style={styles.shiftTabBar}>
        <View style={styles.shiftTabsContainer}>
          {SHIFT_TABS.map(({ key, label }) => {
            const active = activeShift === key;
            return (
              <Pressable
                key={key}
                style={[styles.shiftTab, active && styles.shiftTabActive]}
                onPress={() => setActiveShift(key)}
              >
                <Text style={[styles.shiftTabTxt, active && styles.shiftTabTxtActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Info Banner (Today + Day Order) ── */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTxt}>Today: {todayWeekday} • Day Order: {todayDayOrder}</Text>
      </View>

      {/* ── Active Filter Badges ── */}
      <View style={styles.badgeBanner}>
        <View style={styles.solidBadge}>
          <Text style={styles.solidBadgeLabel}>Batch</Text>
          <Text style={styles.solidBadgeValue}>{batchSelected}</Text>
        </View>
        <View style={styles.solidBadge}>
          <Text style={styles.solidBadgeLabel}>Year</Text>
          <Text style={styles.solidBadgeValue}>{batchYear}</Text>
        </View>
      </View>

      {/* ── Timetable Table Grid ── */}
      <View style={styles.gridContainer}>
        <View style={styles.timetableTable}>
          {/* Header row */}
          <View style={styles.ttHeaderRow}>
            <View style={[styles.ttDayCell, styles.ttCellBorderRight]}>
              <Text style={styles.ttHeaderText}>D#</Text>
            </View>
            {["H1", "H2", "H3", "H4", "H5"].map((h, i) => (
              <View key={h} style={[styles.ttHeaderCell, i < 4 && styles.ttCellBorderRight]}>
                <Text style={styles.ttHeaderText}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {timetableData.map((row, idx) => {
            const isRowActive = row.dayOrder === todayDayOrder;
            const isLastRow = idx === timetableData.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.ttRow,
                  !isLastRow && styles.ttRowBorderBottom,
                  isRowActive && { backgroundColor: "#F0F9FF" },
                ]}
              >
                <View style={[styles.ttDayCell, styles.ttCellBorderRight]}>
                  <Text style={[
                    styles.ttDayText,
                    isRowActive && { color: Colors.BluePrimary, fontWeight: "800" }
                  ]}>
                    {row.dayOrder}
                  </Text>
                </View>
                {renderCell(row.h1, "h1", isRowActive, row.dayOrder, false)}
                {renderCell(row.h2, "h2", isRowActive, row.dayOrder, false)}
                {renderCell(row.h3, "h3", isRowActive, row.dayOrder, false)}
                {renderCell(row.h4, "h4", isRowActive, row.dayOrder, false)}
                {renderCell(row.h5, "h5", isRowActive, row.dayOrder, true)}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Filter Modal (Academic Year & Batch Selection) ── */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.filterOverlay}>
          <Pressable style={styles.filterDismiss} onPress={() => setShowFilter(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHeader}>
              <Text style={styles.filterSheetTitle}>Academic Management</Text>
              <Pressable onPress={() => setShowFilter(false)} style={styles.filterSheetClose}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionLabel}>Academic Year</Text>
              <Pressable style={styles.yearDropdownTrigger} onPress={() => setShowYearPicker(true)}>
                <Text style={styles.yearDropdownText}>{tempYear}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.filterSectionLabel}>Select Batch</Text>
              <Pressable style={styles.yearDropdownTrigger} onPress={() => setShowBatchPicker(true)}>
                <Text style={styles.yearDropdownText}>{tempBatch}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>
            </ScrollView>

            <View style={styles.filterActions}>
              <Pressable style={styles.filterApplyBtn} onPress={() => { setBatchYear(tempYear); setBatchSelected(tempBatch); setShowFilter(false); }}>
                <Text style={styles.filterApplyTxt}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Year Bottom Sheet Picker ── */}
      <Modal visible={showYearPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowYearPicker(false)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Academic Year</Text>
              <Pressable onPress={() => setShowYearPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {BATCH_YEARS.map((yr) => {
                const active = tempYear === yr;
                return (
                  <Pressable
                    key={yr}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempYear(yr); setShowYearPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{yr}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Batch Bottom Sheet Picker ── */}
      <Modal visible={showBatchPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowBatchPicker(false)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Batch</Text>
              <Pressable onPress={() => setShowBatchPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {BATCHES.map((b) => {
                const active = tempBatch === b;
                return (
                  <Pressable
                    key={b}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempBatch(b); setShowBatchPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{b}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Cell Detail Modal ── */}
      <Modal visible={selectedCell !== null} transparent animationType="fade">
        <View style={styles.detailOverlay}>
          <View style={styles.detailBox}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Period Details</Text>
              <Pressable onPress={() => setSelectedCell(null)} style={styles.detailCloseBtn}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>
            {selectedCell && (
              <View style={{ gap: 9 }}>
                {[
                  ["Subject", selectedCell.subject],
                  ["Subject Code", selectedCell.code],
                  ["Assigned Faculty", selectedCell.faculty],
                  ["Classroom / Lab", selectedCell.room],
                  ["Credits", `${selectedCell.credits} Credits`],
                  ["Batch / Section", batchSelected],
                  ["Day Order", selectedCell.dayOrder],
                  ["Hour / Period", selectedCell.periodName],
                  ["Class Type", selectedCell.type],
                ].map(([lbl, val]) => (
                  <View key={lbl} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{lbl}</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>{val}</Text>
                  </View>
                ))}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[
                    styles.detailValue, { fontWeight: "800" },
                    selectedCell.status === "Suspended" ? { color: "#EF4444" } :
                    selectedCell.status === "Replacement" ? { color: "#3B82F6" } :
                    { color: "#10B981" },
                  ]}>
                    {selectedCell.status === "Suspended" ? "🚫 Suspended" :
                     selectedCell.status === "Replacement" ? "🔄 Replacement" : "✓ Normal"}
                  </Text>
                </View>
              </View>
            )}
            <Pressable style={styles.detailCloseAction} onPress={() => setSelectedCell(null)}>
              <Text style={styles.detailCloseActionTxt}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  filterIconBtn: {
    width: 38, height: 38, alignItems: "center", justifyContent: "center",
    borderRadius: 19, backgroundColor: "#EFF6FF",
  },

  // Shift Tabs
  // Shift Tabs — segmented capsule control
  shiftTabBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  shiftTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
  },
  shiftTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  shiftTabActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  shiftTabTxt: { fontSize: 12.5, fontWeight: "600", color: "#64748B" },
  shiftTabTxtActive: { color: Colors.BluePrimary, fontWeight: "800" },

  // Info banner
  infoBanner: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.BluePrimary + "12",
    borderBottomWidth: 1, borderBottomColor: Colors.BluePrimary + "25",
  },
  infoBannerTxt: {
    fontSize: 12.5, fontWeight: "700", color: Colors.BluePrimary, textAlign: "center",
  },

  // Active filter badges (premium tags style)
  badgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  solidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB15",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  solidBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  solidBadgeValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  // Table styling
  gridContainer: { padding: 16 },
  timetableTable: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    overflow: "hidden",
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
    width: 38,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ttHeaderText: {
    fontSize: 11,
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
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
  },
  ttCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  ttCellActive: {
    backgroundColor: "#DBEAFE",
  },
  ttCellSuspended: {
    backgroundColor: "#FEE2E2",
  },
  ttCellText: {
    fontSize: 10,
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
    fontSize: 8.5,
    marginTop: 2,
  },

  // Filter Sheet Dialog
  filterOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  filterDismiss: { flex: 1 },
  filterSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24,
  },
  filterSheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", marginBottom: 16,
  },
  filterSheetTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  filterSheetClose: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  filterSectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
  },
  yearDropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, height: 44, width: "100%", marginBottom: 20,
  },
  yearDropdownText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  filterActions: {
    borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16,
  },
  filterApplyBtn: {
    width: "100%", paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.BluePrimary, alignItems: "center",
  },
  filterApplyTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

  // Picker bottom sheet
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", zIndex: 9999 },
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

  // Detail Dialog Modal
  detailOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", alignItems: "center", justifyContent: "center", padding: 24 },
  detailBox: { width: "100%", maxWidth: 340, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, elevation: 8 },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", paddingBottom: 12, marginBottom: 14 },
  detailTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  detailCloseBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  detailLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", flex: 1 },
  detailValue: { fontSize: 12.5, color: "#1E293B", fontWeight: "700", flex: 2, textAlign: "right" },
  detailCloseAction: { backgroundColor: Colors.BluePrimary, borderRadius: 12, paddingVertical: 10, alignItems: "center", marginTop: 18 },
  detailCloseActionTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
