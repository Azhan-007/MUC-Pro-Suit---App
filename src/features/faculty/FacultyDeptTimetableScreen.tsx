import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, Modal, Platform, StatusBar, SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, X, SlidersHorizontal, RefreshCw, ChevronDown, Check } from "lucide-react-native";
import { Colors } from "../../theme";
import { getDayOrder } from "../../utils/dayOrder";
import {
  DEPT_TIMETABLE_DATA, DEPARTMENTS,
  FacultyTimetableRow, DeptTimetablePeriod, PeriodKey,
} from "../../data/mockDeptTimetable";

// Only 5 hours as per college schedule
const HOURS: { key: PeriodKey; label: string }[] = [
  { key: "h1", label: "H1" },
  { key: "h2", label: "H2" },
  { key: "h3", label: "H3" },
  { key: "h4", label: "H4" },
  { key: "h5", label: "H5" },
];
const DAY_ORDERS = ["D1", "D2", "D3", "D4", "D5", "D6"];
type ShiftType = "SHIFT_I" | "SHIFT_II" | "GIRLS";

const SHIFT_TABS: { key: ShiftType; label: string }[] = [
  { key: "SHIFT_I",  label: "Shift I"  },
  { key: "SHIFT_II", label: "Shift II" },
  { key: "GIRLS",    label: "Girls"    },
];

type SelectedCell = {
  period: DeptTimetablePeriod;
  faculty: FacultyTimetableRow;
  hour: string;
  dayOrder: string;
};

export function FacultyDeptTimetableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  const today = new Date();
  const todayDayOrder = getDayOrder(today);
  const todayWeekday = today.toLocaleDateString("en-IN", { weekday: "long" });

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeShift, setActiveShift] = React.useState<ShiftType>("SHIFT_I");
  const [selectedDayOrder, setSelectedDayOrder] = React.useState(todayDayOrder);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeDept, setActiveDept] = React.useState("All");
  const [showDeptPicker, setShowDeptPicker] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<SelectedCell | null>(null);
  const [showFilter, setShowFilter] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError] = React.useState(false);

  // Temp filter state inside dialog
  const [tempDept, setTempDept] = React.useState("All");
  const [tempDayOrder, setTempDayOrder] = React.useState(todayDayOrder);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // ── Derived Data ───────────────────────────────────────────────────────────
  const allRows: FacultyTimetableRow[] = DEPT_TIMETABLE_DATA[selectedDayOrder] ?? [];

  const filteredRows = allRows.filter((row) => {
    const matchShift = row.shift === activeShift;
    const matchDept  = activeDept === "All" || row.department === activeDept;
    const matchSearch = row.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchShift && matchDept && matchSearch;
  });

  const hasActiveFilters = activeDept !== "All" || searchQuery.length > 0;

  const getCurrentPeriod = (): string => {
    const h = today.getHours(), m = today.getMinutes();
    const v = h * 100 + m;
    if (v >= 900  && v < 1000) return "h1";
    if (v >= 1000 && v < 1100) return "h2";
    if (v >= 1100 && v < 1200) return "h3";
    if (v >= 1300 && v < 1400) return "h4";
    if (v >= 1400 && v < 1500) return "h5";
    return "";
  };
  const activePeriod = selectedDayOrder === todayDayOrder ? getCurrentPeriod() : "";

  // ── Filter dialog helpers ──────────────────────────────────────────────────
  const openFilter = () => {
    setTempDept(activeDept);
    setTempDayOrder(selectedDayOrder);
    setShowFilter(true);
  };
  const applyFilter = () => {
    setActiveDept(tempDept);
    setSelectedDayOrder(tempDayOrder);
    setShowFilter(false);
  };
  const resetFilter = () => {
    setTempDept("All");
    setTempDayOrder(todayDayOrder);
  };

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (period: DeptTimetablePeriod | null, key: string, row: FacultyTimetableRow) => {
    const isCurrent = activePeriod === key;
    if (!period) {
      return (
        <View style={[styles.cell, styles.cellFree, isCurrent && styles.cellCurrentFree]}>
          <Text style={styles.freeTxt}>Free</Text>
        </View>
      );
    }
    const isLab       = period.type === "Lab";
    const isSuspended = period.status === "Suspended";
    const isRep       = period.status === "Replacement";
    return (
      <Pressable
        style={[
          styles.cell,
          isCurrent  && styles.cellCurrent,
          isSuspended && styles.cellSuspended,
          isRep       && styles.cellReplacement,
        ]}
        onPress={() =>
          setSelectedCell({ period, faculty: row, hour: key.toUpperCase(), dayOrder: selectedDayOrder })
        }
      >
        <Text numberOfLines={2} style={[styles.cellSubj, isSuspended && { textDecorationLine: "line-through", color: "#EF4444" }]}>
          {period.subject}
        </Text>
        <Text numberOfLines={1} style={styles.cellMeta}>{period.classCode} · {period.room}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, isLab ? styles.typeLab : styles.typeTheory]}>
            <Text style={[styles.typeTxt, isLab ? { color: "#7C3AED" } : { color: "#2563EB" }]}>
              {period.type}
            </Text>
          </View>
          {isRep       && <Text style={styles.repBadge}>🔄</Text>}
          {isSuspended && <Text style={styles.suspBadge}>🚫</Text>}
        </View>
      </Pressable>
    );
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <View style={{ padding: 16, gap: 10 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((j) => (
              <View key={j} style={styles.skeletonCell} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>

      {/* ── Header (centered title matching other screens) ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/faculty" as any))}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Department Timetable</Text>
        </View>
        <Pressable style={styles.filterIconBtn} onPress={openFilter}>
          <SlidersHorizontal size={18} color={Colors.BluePrimary} />
          {hasActiveFilters && <View style={styles.filterDot} />}
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

      {/* ── Search Bar ── */}
      <View style={styles.searchWrap}>
        <Search size={15} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search faculty by name..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <X size={14} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {/* ── Active Filter Badges ── */}
      <View style={styles.badgeBanner}>
        <View style={styles.solidBadge}>
          <Text style={styles.solidBadgeLabel}>Dept</Text>
          <Text style={styles.solidBadgeValue}>{activeDept}</Text>
        </View>
        <View style={styles.solidBadge}>
          <Text style={styles.solidBadgeLabel}>Day Order</Text>
          <Text style={styles.solidBadgeValue}>{selectedDayOrder}</Text>
        </View>
      </View>

      {/* ── Timetable Grid ── */}
      {isLoading ? renderSkeleton() : hasError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <Text style={styles.stateTitle}>Failed to Load</Text>
          <Text style={styles.stateSub}>Unable to retrieve timetable data.</Text>
        </View>
      ) : filteredRows.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateIcon}>🔍</Text>
          <Text style={styles.stateTitle}>No Faculty Found</Text>
          <Text style={styles.stateSub}>
            {hasActiveFilters
              ? "Try clearing your filters or search."
              : "No timetable data for this shift and day order."}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Grid Header */}
          <View style={styles.gridHeader}>
            <View style={styles.gridFacultyHdr}>
              <Text style={styles.gridHdrTxt}>Faculty</Text>
            </View>
            {HOURS.map(({ key, label }) => (
              <View key={key} style={[styles.gridHourHdr, activePeriod === key && styles.gridHourHdrActive]}>
                <Text style={[styles.gridHdrTxt, activePeriod === key && { color: "#FFFFFF" }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Grid Rows */}
          {filteredRows.map((row, idx) => (
            <View key={row.id} style={[styles.gridRow, idx % 2 === 1 && styles.gridRowAlt]}>
              {/* Faculty info column */}
              <View style={styles.gridFacultyCell}>
                <Text numberOfLines={2} style={styles.facultyName}>{row.facultyName}</Text>
                <Text style={styles.facultyDept}>{row.department}</Text>
                <Text style={styles.facultyDesig}>{row.designation}</Text>
              </View>
              {/* Period cells */}
              {HOURS.map(({ key }) => (
                <View key={key} style={styles.gridPeriodCell}>
                  {renderCell(row.periods[key], key, row)}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Filter Dialog ── */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.filterOverlay}>
          <Pressable style={styles.filterDismiss} onPress={() => setShowFilter(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHeader}>
              <Text style={styles.filterSheetTitle}>Filter Options</Text>
              <Pressable onPress={() => setShowFilter(false)} style={styles.filterSheetClose}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Day Order picker */}
              <Text style={styles.filterSectionLabel}>Day Order</Text>
              <View style={styles.filterChipRow}>
                {DAY_ORDERS.map((d) => {
                  const isToday = d === todayDayOrder;
                  const sel = tempDayOrder === d;
                  return (
                    <Pressable
                      key={d}
                      style={[styles.filterChip, sel && styles.filterChipActive]}
                      onPress={() => setTempDayOrder(d)}
                    >
                      <Text style={[styles.filterChipTxt, sel && styles.filterChipTxtActive]}>{d}</Text>
                      {isToday && <View style={styles.todayDot} />}
                    </Pressable>
                  );
                })}
              </View>

              {/* Department picker trigger */}
              <Text style={styles.filterSectionLabel}>Department</Text>
              <Pressable style={styles.yearDropdownTrigger} onPress={() => setShowDeptPicker(true)}>
                <Text style={styles.yearDropdownText}>{tempDept}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>
            </ScrollView>

            {/* Actions */}
            <View style={styles.filterActions}>
              <Pressable style={styles.filterResetBtn} onPress={resetFilter}>
                <Text style={styles.filterResetTxt}>Reset</Text>
              </Pressable>
              <Pressable style={styles.filterApplyBtn} onPress={applyFilter}>
                <Text style={styles.filterApplyTxt}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Department Bottom Sheet Picker ── */}
      <Modal visible={showDeptPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowDeptPicker(false)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Department</Text>
              <Pressable onPress={() => setShowDeptPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {DEPARTMENTS.map((dept) => {
                const active = tempDept === dept;
                return (
                  <Pressable
                    key={dept}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setTempDept(dept); setShowDeptPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{dept}</Text>
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
                {([
                  ["Faculty",      selectedCell.faculty.facultyName],
                  ["Department",   selectedCell.faculty.department],
                  ["Designation",  selectedCell.faculty.designation],
                  ["Subject",      selectedCell.period.subject],
                  ["Code",         selectedCell.period.subjectCode],
                  ["Class/Batch",  selectedCell.period.classCode],
                  ["Room / Lab",   selectedCell.period.room],
                  ["Type",         selectedCell.period.type],
                  ["Day Order",    selectedCell.dayOrder],
                  ["Period",       selectedCell.hour],
                ] as [string, string][]).map(([lbl, val]) => (
                  <View key={lbl} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{lbl}</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>{val}</Text>
                  </View>
                ))}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[
                    styles.detailValue, { fontWeight: "800" },
                    selectedCell.period.status === "Suspended" ? { color: "#EF4444" } :
                    selectedCell.period.status === "Replacement" ? { color: "#3B82F6" } :
                    { color: "#10B981" },
                  ]}>
                    {selectedCell.period.status === "Suspended" ? "🚫 Suspended" :
                     selectedCell.period.status === "Replacement" ? "🔄 Replacement" : "✓ Normal"}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const FACULTY_COL = 116;
const PERIOD_COL_FLEX = 1;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header — identical pattern to FacultyExamMarksScreen
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
  headerSub: { fontSize: 11.5, color: "#64748B", fontWeight: "500", marginTop: 1 },
  filterIconBtn: {
    width: 38, height: 38, alignItems: "center", justifyContent: "center",
    borderRadius: 19, backgroundColor: "#EFF6FF",
  },
  filterDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444",
    position: "absolute", top: 7, right: 7,
  },

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

  // Search
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12,
    borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0",
    paddingHorizontal: 12, paddingVertical: 9, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#0F172A", fontWeight: "500" },

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

  // Dropdown trigger button inside filters sheet
  yearDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    width: "100%",
    marginBottom: 20,
  },
  yearDropdownText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

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

  // Grid
  gridHeader: {
    flexDirection: "row", backgroundColor: "#1E293B",
    marginHorizontal: 16, marginTop: 12,
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
  },
  gridFacultyHdr: {
    width: FACULTY_COL, paddingVertical: 10, paddingHorizontal: 8,
    borderRightWidth: 1, borderRightColor: "#334155",
  },
  gridHourHdr: {
    flex: PERIOD_COL_FLEX, paddingVertical: 10, alignItems: "center",
    borderRightWidth: 1, borderRightColor: "#334155",
  },
  gridHourHdrActive: { backgroundColor: Colors.BluePrimary },
  gridHdrTxt: { fontSize: 11, fontWeight: "800", color: "#CBD5E1" },

  gridRow: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#E2E8F0",
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#E2E8F0",
  },
  gridRowAlt: { backgroundColor: "#F8FAFC" },

  gridFacultyCell: {
    width: FACULTY_COL, paddingVertical: 8, paddingHorizontal: 8,
    borderRightWidth: 1, borderRightColor: "#E2E8F0",
    justifyContent: "center",
  },
  gridPeriodCell: {
    flex: PERIOD_COL_FLEX, borderRightWidth: 1, borderRightColor: "#E2E8F0",
  },

  // Faculty label
  facultyName: { fontSize: 10.5, fontWeight: "700", color: "#1E293B", lineHeight: 14, marginBottom: 2 },
  facultyDept: { fontSize: 9, color: "#94A3B8", fontWeight: "500" },
  facultyDesig: { fontSize: 8.5, color: "#CBD5E1", fontWeight: "500", marginTop: 1 },

  // Cells
  cell: {
    flex: 1, minHeight: 82, padding: 5,
    alignItems: "flex-start", justifyContent: "center",
  },
  cellFree: { alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA" },
  cellCurrentFree: { backgroundColor: "#F0FDF4" },
  cellCurrent: { backgroundColor: "#EFF6FF", borderTopWidth: 2, borderTopColor: Colors.BluePrimary },
  cellSuspended: { backgroundColor: "#FEF2F2" },
  cellReplacement: { backgroundColor: "#FFFBEB" },
  freeTxt: { fontSize: 11, color: "#CBD5E1", fontStyle: "italic", fontWeight: "600" },
  cellSubj: { fontSize: 10.5, fontWeight: "700", color: "#1E293B", lineHeight: 14, marginBottom: 3 },
  cellMeta: { fontSize: 9, color: "#64748B", fontWeight: "600", marginBottom: 4 },
  badgeRow: { flexDirection: "row", gap: 3, alignItems: "center", flexWrap: "wrap" },
  typeBadge: { borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1.5 },
  typeTheory: { backgroundColor: "#DBEAFE" },
  typeLab: { backgroundColor: "#EDE9FE" },
  typeTxt: { fontSize: 7.5, fontWeight: "800" },
  repBadge: { fontSize: 8 },
  suspBadge: { fontSize: 8 },

  // Skeleton
  skeletonRow: { flexDirection: "row", gap: 6, marginBottom: 8, paddingHorizontal: 16 },
  skeletonLabel: { width: FACULTY_COL, height: 82, borderRadius: 8, backgroundColor: "#E2E8F0" },
  skeletonCell: { flex: 1, height: 82, borderRadius: 8, backgroundColor: "#E2E8F0" },

  // Empty/Error state
  stateBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingBottom: 60 },
  stateIcon: { fontSize: 44, marginBottom: 12 },
  stateTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A", marginBottom: 6, textAlign: "center" },
  stateSub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },

  // Filter Dialog Sheet
  filterOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  filterDismiss: { flex: 1 },
  filterSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingHorizontal: 20, maxHeight: "72%",
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
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 4,
  },
  filterChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  filterChipActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  filterChipTxt: { fontSize: 12.5, fontWeight: "700", color: "#64748B" },
  filterChipTxtActive: { color: "#FFFFFF" },

  todayDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: "#34D399",
    position: "absolute", top: 4, right: 4,
  },
  filterActions: {
    flexDirection: "row", gap: 12, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  filterResetBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E2E8F0", alignItems: "center",
  },
  filterResetTxt: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  filterApplyBtn: {
    flex: 2, paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.BluePrimary, alignItems: "center",
  },
  filterApplyTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

  // Detail Modal
  detailOverlay: {
    flex: 1, backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  detailBox: {
    width: "100%", maxWidth: 340, backgroundColor: "#FFFFFF",
    borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  detailHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    paddingBottom: 12, marginBottom: 14,
  },
  detailTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  detailCloseBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  detailLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", flex: 1 },
  detailValue: { fontSize: 12.5, color: "#1E293B", fontWeight: "700", flex: 2, textAlign: "right" },
  detailCloseAction: {
    backgroundColor: Colors.BluePrimary, borderRadius: 12,
    paddingVertical: 10, alignItems: "center", marginTop: 18,
  },
  detailCloseActionTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
