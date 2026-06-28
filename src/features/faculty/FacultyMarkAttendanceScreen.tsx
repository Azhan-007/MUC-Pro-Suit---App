import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, Alert, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../theme";
import { CampusCard } from "../../components";
import { getDefaultAttendanceEntries } from "../../data/mockFacultyData";
import { StudentAttendanceEntry } from "../../types";
import { Check, X, Clock, CheckCircle, ChevronLeft } from "lucide-react-native";

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

export const FacultyMarkAttendanceScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ subjectName?: string }>();
  const initialSubject = params.subjectName ?? "Database Management System";

  const [selectedClass, setSelectedClass] = React.useState<"II B.Sc CS" | "III B.Sc CS">("III B.Sc CS");
  const [selectedHour, setSelectedHour] = React.useState<"1" | "2" | "3" | "4" | "5">("1");
  const [selectedSubject, setSelectedSubject] = React.useState<string>(initialSubject);
  const [entries, setEntries] = React.useState<StudentAttendanceEntry[]>(getDefaultAttendanceEntries);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (selectedClass === "III B.Sc CS") {
      setSelectedSubject("Database Management System");
    } else {
      setSelectedSubject("Operating System");
    }
  }, [selectedClass]);

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const setStatus = (studentId: string, status: AttStatus) => {
    setEntries((prev) => prev.map((e) => e.studentId === studentId ? { ...e, status } : e));
  };

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;
  const lateCount = entries.filter((e) => e.status === "LATE").length;

  const getHourLabel = (hr: string) => {
    if (hr === "1") return "1st Hour";
    if (hr === "2") return "2nd Hour";
    if (hr === "3") return "3rd Hour";
    if (hr === "4") return "4th Hour";
    return "5th Hour";
  };

  const handleSubmit = () => {
    Alert.alert(
      "Submit Attendance",
      `Submit attendance for ${selectedClass} (${selectedSubject}) at ${getHourLabel(selectedHour)}?\n\nPresent: ${presentCount}  Absent: ${absentCount}  Late: ${lateCount}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "default", onPress: () => setSubmitted(true) },
      ]
    );
  };

  const StatusBtn = ({ label, status, current, studentId }: { label: string; status: AttStatus; current: AttStatus; studentId: string }) => {
    const active = current === status;
    const COLOR = status === "PRESENT" ? Colors.ColorPresent : status === "ABSENT" ? Colors.ColorAbsent : Colors.ColorPending;
    return (
      <Pressable
        style={[styles.statusBtn, { borderColor: active ? COLOR : Colors.AppOutline, backgroundColor: active ? COLOR + "20" : "transparent" }]}
        onPress={() => setStatus(studentId, status)}
      >
        {status === "PRESENT" ? <Check size={13} color={active ? COLOR : Colors.AppOnSurfaceVariant} /> :
         status === "ABSENT" ? <X size={13} color={active ? COLOR : Colors.AppOnSurfaceVariant} /> :
         <Clock size={13} color={active ? COLOR : Colors.AppOnSurfaceVariant} />}
        <Text style={[styles.statusBtnText, { color: active ? COLOR : Colors.AppOnSurfaceVariant }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>Mark Attendance</Text>
          <Text style={styles.headerSub}>{selectedClass} · {selectedSubject}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Selector panel */}
      <View style={styles.selectorPanel}>
        <View style={styles.selectorRow}>
          <Text style={styles.selectorLabel}>Class:</Text>
          <View style={styles.chipGroup}>
            {(["II B.Sc CS", "III B.Sc CS"] as const).map((cls) => (
              <Pressable
                key={cls}
                style={[styles.selectorChip, selectedClass === cls && styles.selectorChipActive]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[styles.selectorChipText, selectedClass === cls && styles.selectorChipTextActive]}>
                  {cls}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.selectorRow}>
          <Text style={styles.selectorLabel}>Hour:</Text>
          <View style={styles.chipGroup}>
            {(["1", "2", "3", "4", "5"] as const).map((hr) => (
              <Pressable
                key={hr}
                style={[styles.selectorChip, selectedHour === hr && styles.selectorChipActive]}
                onPress={() => setSelectedHour(hr)}
              >
                <Text style={[styles.selectorChipText, selectedHour === hr && styles.selectorChipTextActive]}>
                  {hr === "1" ? "1st Hr" : hr === "2" ? "2nd Hr" : hr === "3" ? "3rd Hr" : hr === "4" ? "4th Hr" : "5th Hr"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.selectorRow}>
          <Text style={styles.selectorLabel}>Subject:</Text>
          <View style={styles.chipGroup}>
            {["Database Management System", "Operating System"].map((sub) => {
              const active = selectedSubject === sub;
              return (
                <Pressable
                  key={sub}
                  style={[styles.selectorChip, active && styles.selectorChipActive]}
                  onPress={() => setSelectedSubject(sub)}
                >
                  <Text style={[styles.selectorChipText, active && styles.selectorChipTextActive]} numberOfLines={1}>
                    {sub === "Database Management System" ? "DBMS" : "OS"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: Colors.ColorPresent }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: Colors.ColorAbsent }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: Colors.ColorPending }]}>{lateCount}</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>{entries.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>Date: {today} · Session: {getHourLabel(selectedHour)}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {entries.map((entry, idx) => (
          <CampusCard key={entry.studentId} style={styles.studentCard} elevation="sm">
            <View style={styles.studentRow}>
              <View style={styles.studentLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{entry.name}</Text>
                  <Text style={styles.studentRoll}>Roll No: {entry.rollNo}</Text>
                </View>
              </View>
              <View style={styles.btnGroup}>
                <StatusBtn label="P" status="PRESENT" current={entry.status} studentId={entry.studentId} />
                <StatusBtn label="A" status="ABSENT" current={entry.status} studentId={entry.studentId} />
                <StatusBtn label="L" status="LATE" current={entry.status} studentId={entry.studentId} />
              </View>
            </View>
          </CampusCard>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit button */}
      <View style={styles.submitContainer}>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <CheckCircle size={18} color="#fff" />
          <Text style={styles.submitText}>Submit Attendance</Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <CheckCircle size={40} color={Colors.ColorPresent} />
            </View>
            <Text style={styles.successTitle}>Attendance Submitted!</Text>
            <Text style={styles.successMsg}>
              {selectedClass} · {getHourLabel(selectedHour)}{"\n"}{selectedSubject}{"\n\n"}Present: {presentCount} · Absent: {absentCount} · Late: {lateCount}
            </Text>
            <Pressable style={styles.doneBtn} onPress={() => { setSubmitted(false); router.back(); }}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.AppSurface, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: Colors.AppOnBackground },
  headerSub: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  selectorPanel: {
    backgroundColor: Colors.AppSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
    gap: 10,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  chipGroup: {
    flexDirection: "row",
    gap: 8,
  },
  selectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  selectorChipActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  selectorChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  selectorChipTextActive: {
    color: "#FFFFFF",
  },
  summaryBar: {
    flexDirection: "row", backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingVertical: 10,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryCount: { fontSize: 20, fontWeight: "900", color: Colors.AppOnBackground },
  summaryLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, fontWeight: "500" },
  summaryDivider: { width: 1, backgroundColor: Colors.AppOutline },
  dateRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.BluePrimary + "0D" },
  dateLabel: { fontSize: 13, fontWeight: "600", color: Colors.BluePrimary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  studentCard: { marginBottom: 8, padding: 10 },
  studentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  studentLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.BluePrimary + "1A", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "800", color: Colors.BluePrimary },
  studentName: { fontSize: 13, fontWeight: "700", color: Colors.AppOnBackground },
  studentRoll: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  btnGroup: { flexDirection: "row", gap: 6 },
  statusBtn: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  statusBtnText: { fontSize: 9, fontWeight: "700", marginTop: 1 },
  submitContainer: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.AppSurface,
    borderTopWidth: 1, borderTopColor: Colors.AppOutline,
  },
  submitBtn: {
    backgroundColor: Colors.BluePrimary, borderRadius: 14,
    paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  successModal: {
    backgroundColor: Colors.AppSurface, borderRadius: 20, padding: 28,
    alignItems: "center", width: "80%",
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.ColorPresent + "1A", alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  successTitle: { fontSize: 20, fontWeight: "900", color: Colors.AppOnBackground, marginBottom: 8 },
  successMsg: { fontSize: 14, color: Colors.AppOnSurfaceVariant, textAlign: "center", lineHeight: 20 },
  doneBtn: {
    marginTop: 20, backgroundColor: Colors.BluePrimary, borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 12,
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
