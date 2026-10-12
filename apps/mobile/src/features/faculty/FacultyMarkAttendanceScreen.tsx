/**
 * FacultyMarkAttendanceScreen
 * 
 * Loads real faculty classes and students from the backend.
 * Submits attendance via POST /attendance/mark.
 * Zero hardcoded data.
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, X, Clock, CheckCircle, ChevronDown } from "lucide-react-native";
import { Colors } from "../../theme";
import { CampusCard, useCampusAlert } from "../../components";
import { AcademicService, FacultyClass, ClassStudent } from "../../services/academicService";
import { getDayOrder } from "../../utils/dayOrder";

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

interface StudentEntry {
  studentId: string;
  enrollmentId: string;
  name: string;
  rollNo: string;
  status: AttStatus;
}

export const FacultyMarkAttendanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();

  const params = useLocalSearchParams<{
    subjectName?: string;
    classCode?: string;
    classId?: string;
    subjectId?: string;
    period?: string;
    date?: string;
  }>();

  // ── Class & Subject selection ──
  const [facultyClasses, setFacultyClasses] = React.useState<FacultyClass[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>(params.classId ?? "");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>(params.subjectId ?? "");
  const [selectedClassName, setSelectedClassName] = React.useState<string>(params.classCode ?? "");
  const [selectedSubjectName, setSelectedSubjectName] = React.useState<string>(params.subjectName ?? "");
  const [showClassPicker, setShowClassPicker] = React.useState(false);

  // ── Period & Date ──
  const initialHour = params.period ? params.period.replace(/[^0-9]/g, "") : "1";
  const [selectedHour, setSelectedHour] = React.useState<string>(
    ["1", "2", "3", "4", "5"].includes(initialHour) ? initialHour : "1"
  );
  const [showHourPicker, setShowHourPicker] = React.useState(false);
  const [attendanceDate] = React.useState<Date>(() => {
    if (params.date) {
      const parsed = new Date(params.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const dayOrderLabel = getDayOrder(attendanceDate) || "D1";
  const formattedDate = attendanceDate.toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).replace(/\//g, "-");

  // ── Student entries ──
  const [entries, setEntries] = React.useState<StudentEntry[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);

  // ── Submission ──
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  // ── Load faculty classes on mount ──
  React.useEffect(() => {
    let active = true;
    AcademicService.getFacultyClasses()
      .then((classes) => {
        if (!active) return;
        setFacultyClasses(classes);
        if (!params.classId && classes.length > 0) {
          const first = classes[0];
          setSelectedClassId(first.classId);
          setSelectedClassName(first.className);
          setSelectedSubjectId(first.subjectId);
          setSelectedSubjectName(first.subjectName);
        } else if (params.classId) {
          const match = classes.find(c => c.classId === params.classId);
          if (match) {
            setSelectedClassName(match.className);
            setSelectedSubjectId(match.subjectId);
            setSelectedSubjectName(match.subjectName);
          }
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // ── Load students when classId changes ──
  React.useEffect(() => {
    if (!selectedClassId) return;
    let active = true;
    setLoadingStudents(true);
    AcademicService.getClassStudents(selectedClassId)
      .then((students) => {
        if (!active) return;
        setEntries(
          students.map((s) => ({
            studentId: s.studentId,
            enrollmentId: s.enrollmentId,
            name: s.name,
            rollNo: s.registrationNumber,
            status: "PRESENT" as AttStatus,
          }))
        );
      })
      .catch(() => { if (active) setEntries([]); })
      .finally(() => { if (active) setLoadingStudents(false); });
    return () => { active = false; };
  }, [selectedClassId]);

  // ── Status toggling ──
  const setStudentStatus = (studentId: string, status: AttStatus) => {
    setEntries((prev) => prev.map((e) => e.studentId === studentId ? { ...e, status } : e));
  };

  const handleMarkAll = () => {
    const allPresent = entries.every((e) => e.status === "PRESENT");
    setEntries((prev) => prev.map((e) => ({ ...e, status: allPresent ? "ABSENT" : "PRESENT" })));
  };

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;
  const lateCount = entries.filter((e) => e.status === "LATE").length;

  // ── Submit ──
  const handleSubmit = () => {
    if (!selectedClassId || !selectedSubjectId) {
      showAlert("Error", "Please select a valid class and subject.");
      return;
    }
    if (entries.length === 0) {
      showAlert("Error", "No students found in this class.");
      return;
    }
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      await AcademicService.markAttendance({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        date: attendanceDate.toISOString().split("T")[0],
        period: `H${selectedHour}`,
        entries: entries.map((e) => ({ studentId: e.studentId, status: e.status as any })),
      });
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err: any) {
      setShowConfirm(false);
      showAlert("Submission Failed", err?.response?.data?.message || "Could not submit attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBtn = ({ label, s, studentId, current }: { label: string; s: AttStatus; studentId: string; current: AttStatus }) => {
    const active = current === s;
    const COLOR = s === "PRESENT" ? Colors.ColorPresent : s === "ABSENT" ? Colors.ColorAbsent : Colors.ColorPending;
    return (
      <Pressable
        style={[st.statusBtn, { borderColor: active ? COLOR : Colors.AppOutline, backgroundColor: active ? COLOR : "transparent" }]}
        onPress={() => setStudentStatus(studentId, s)}
      >
        {s === "PRESENT" ? <Check size={13} color={active ? "#FFF" : Colors.AppOnSurfaceVariant} /> :
         s === "ABSENT" ? <X size={13} color={active ? "#FFF" : Colors.AppOnSurfaceVariant} /> :
         <Clock size={13} color={active ? "#FFF" : Colors.AppOnSurfaceVariant} />}
        <Text style={[st.statusBtnText, { color: active ? "#FFF" : Colors.AppOnSurfaceVariant }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={st.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={st.header}>
        <Pressable style={st.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={st.headerTitle}>Mark Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary Bar */}
      <View style={st.summaryBar}>
        <View style={st.summaryItem}>
          <Text style={[st.summaryCount, { color: Colors.ColorPresent }]}>{presentCount}</Text>
          <Text style={st.summaryLabel}>Present</Text>
        </View>
        <View style={st.summaryDivider} />
        <View style={st.summaryItem}>
          <Text style={[st.summaryCount, { color: Colors.ColorAbsent }]}>{absentCount}</Text>
          <Text style={st.summaryLabel}>Absent</Text>
        </View>
        <View style={st.summaryDivider} />
        <View style={st.summaryItem}>
          <Text style={[st.summaryCount, { color: Colors.ColorPending }]}>{lateCount}</Text>
          <Text style={st.summaryLabel}>Late</Text>
        </View>
        <View style={st.summaryDivider} />
        <View style={st.summaryItem}>
          <Text style={st.summaryCount}>{entries.length}</Text>
          <Text style={st.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* Session Info Row */}
      <View style={st.sessionRow}>
        {/* Class Picker */}
        <Pressable style={st.sessionPill} onPress={() => setShowClassPicker(true)}>
          <Text style={st.sessionPillText} numberOfLines={1}>
            {selectedClassName || "Select Class"}
          </Text>
          <ChevronDown size={12} color={Colors.BluePrimary} />
        </Pressable>

        {/* Hour Picker */}
        <Pressable style={st.sessionPill} onPress={() => setShowHourPicker(true)}>
          <Text style={st.sessionPillText}>Hour {selectedHour}</Text>
          <ChevronDown size={12} color={Colors.BluePrimary} />
        </Pressable>

        {/* Date Display */}
        <View style={[st.sessionPill, { backgroundColor: Colors.AppSurface }]}>
          <Text style={st.sessionPillText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Subject Info */}
      {selectedSubjectName ? (
        <View style={st.subjectBanner}>
          <Text style={st.subjectBannerText}>{selectedSubjectName}  ·  Day Order: {dayOrderLabel}</Text>
        </View>
      ) : null}

      {/* Mark All Button */}
      <View style={st.markAllRow}>
        <Pressable style={st.markAllBtn} onPress={handleMarkAll}>
          <Check size={14} color={Colors.BluePrimary} />
          <Text style={st.markAllText}>Mark All Present/Absent</Text>
        </Pressable>
      </View>

      {/* Student List */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingStudents ? (
          <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginTop: 40 }} />
        ) : entries.length === 0 ? (
          <View style={st.emptyState}>
            <Text style={st.emptyText}>No students enrolled in this class.</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <CampusCard key={entry.studentId} style={st.studentCard} elevation="sm">
              <View style={st.studentRow}>
                <View style={st.studentLeft}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>
                      {entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={st.studentName}>{entry.name}</Text>
                    <Text style={st.studentRoll}>Reg: {entry.rollNo}</Text>
                  </View>
                </View>
                <View style={st.btnGroup}>
                  <StatusBtn label="P" s="PRESENT" current={entry.status} studentId={entry.studentId} />
                  <StatusBtn label="A" s="ABSENT" current={entry.status} studentId={entry.studentId} />
                  <StatusBtn label="L" s="LATE" current={entry.status} studentId={entry.studentId} />
                </View>
              </View>
            </CampusCard>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[st.submitContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={st.submitBtn} onPress={handleSubmit}>
          <CheckCircle size={18} color="#fff" />
          <Text style={st.submitText}>Submit Attendance</Text>
        </Pressable>
      </View>

      {/* Class Picker Modal */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <View style={st.pickerOverlay}>
          <Pressable style={st.pickerDismiss} onPress={() => setShowClassPicker(false)} />
          <View style={[st.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Text style={st.pickerTitle}>Select Class & Subject</Text>
            <ScrollView>
              {facultyClasses.map((cls) => {
                const active = cls.classId === selectedClassId && cls.subjectId === selectedSubjectId;
                return (
                  <Pressable
                    key={`${cls.classId}-${cls.subjectId}`}
                    style={[st.pickerOption, active && st.pickerOptionActive]}
                    onPress={() => {
                      setSelectedClassId(cls.classId);
                      setSelectedClassName(cls.className);
                      setSelectedSubjectId(cls.subjectId);
                      setSelectedSubjectName(cls.subjectName);
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={[st.pickerOptionText, active && { color: Colors.BluePrimary, fontWeight: '700' }]}>
                      {cls.className}
                    </Text>
                    <Text style={st.pickerOptionSub}>{cls.subjectName}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hour Picker Modal */}
      <Modal visible={showHourPicker} transparent animationType="fade">
        <Pressable style={st.pickerOverlay} onPress={() => setShowHourPicker(false)}>
          <View style={st.hourPickerCard}>
            <Text style={st.pickerTitle}>Select Period Hour</Text>
            {["1", "2", "3", "4", "5"].map((h) => {
              const active = selectedHour === h;
              return (
                <Pressable
                  key={h}
                  style={[st.pickerOption, active && st.pickerOptionActive]}
                  onPress={() => { setSelectedHour(h); setShowHourPicker(false); }}
                >
                  <Text style={[st.pickerOptionText, active && { color: Colors.BluePrimary, fontWeight: '700' }]}>
                    Hour {h}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* Confirm Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.confirmModal}>
            <Text style={st.confirmTitle}>Submit Attendance</Text>
            <Text style={st.confirmMsg}>
              {selectedClassName} · Hour {selectedHour} · {formattedDate}{"\n\n"}
              {selectedSubjectName}{"\n\n"}
              Present: {presentCount}  ·  Absent: {absentCount}  ·  Late: {lateCount}
            </Text>
            <View style={st.confirmBtnGroup}>
              <Pressable style={[st.confirmBtn, st.confirmBtnCancel]} onPress={() => setShowConfirm(false)}>
                <Text style={st.confirmBtnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[st.confirmBtn, st.confirmBtnSubmit, submitting && { opacity: 0.6 }]}
                disabled={submitting}
                onPress={doSubmit}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={st.confirmBtnTextSubmit}>Submit</Text>
                }
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={submitted} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.confirmModal}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <CheckCircle size={48} color={Colors.ColorPresent} />
            </View>
            <Text style={st.confirmTitle}>Attendance Submitted!</Text>
            <Text style={st.confirmMsg}>
              {selectedClassName} · Hour {selectedHour}{"\n"}
              {selectedSubjectName}{"\n"}
              Date: {formattedDate}{"\n\n"}
              Present: {presentCount}  ·  Absent: {absentCount}  ·  Late: {lateCount}
            </Text>
            <Pressable
              style={[st.confirmBtn, st.confirmBtnSubmit, { width: '100%' }]}
              onPress={() => { setSubmitted(false); setEntries(prev => prev.map(e => ({ ...e, status: 'PRESENT' }))); }}
            >
              <Text style={st.confirmBtnTextSubmit}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.AppSurface },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: Colors.AppOnBackground },
  summaryBar: { flexDirection: 'row', backgroundColor: Colors.AppSurface, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingVertical: 10 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryCount: { fontSize: 18, fontWeight: '900', color: Colors.AppOnBackground },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.AppOutline },
  sessionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  sessionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 4, borderWidth: 1, borderColor: Colors.BluePrimary + '30', flex: 1 },
  sessionPillText: { fontSize: 11, fontWeight: '700', color: Colors.BluePrimary, flex: 1 },
  subjectBanner: { backgroundColor: Colors.AppSurfaceVariant, paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline },
  subjectBannerText: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  markAllRow: { paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  markAllText: { fontSize: 12, fontWeight: '700', color: Colors.BluePrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.AppOnSurfaceVariant, fontWeight: '500' },
  studentCard: { marginBottom: 8 },
  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  studentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: Colors.BluePrimary },
  studentName: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  studentRoll: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  btnGroup: { flexDirection: 'row', gap: 6 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, borderWidth: 1.5 },
  statusBtnText: { fontSize: 11, fontWeight: '700' },
  submitContainer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.AppBackground, borderTopWidth: 1, borderTopColor: Colors.AppOutline },
  submitBtn: { backgroundColor: Colors.BluePrimary, borderRadius: 14, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  pickerDismiss: { flex: 1 },
  pickerSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 16 },
  pickerOption: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, marginBottom: 4 },
  pickerOptionActive: { backgroundColor: '#EFF6FF' },
  pickerOptionText: { fontSize: 14, fontWeight: '600', color: Colors.AppOnBackground },
  pickerOptionSub: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  hourPickerCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, margin: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: 24 },
  confirmModal: { backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  confirmTitle: { fontSize: 17, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 10 },
  confirmMsg: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 20, marginBottom: 20 },
  confirmBtnGroup: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmBtnCancel: { borderWidth: 1.5, borderColor: Colors.AppOutline },
  confirmBtnSubmit: { backgroundColor: Colors.BluePrimary },
  confirmBtnTextCancel: { fontSize: 14, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  confirmBtnTextSubmit: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
