import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../theme";
import { CampusCard } from "../../components";
import { getDefaultExamEntries, mockFacultySubjects } from "../../data/mockFacultyData";
import { ExamMarkEntry } from "../../types";
import { CheckCircle, ClipboardList, SlidersHorizontal, X, ChevronDown, Check, ArrowLeft } from "lucide-react-native";

type ExamType = "CIA 1" | "CIA 2" | "Semester";

const MAX_MARKS: Record<ExamType, number> = {
  "CIA 1": 25,
  "CIA 2": 25,
  "Semester": 75,
};

export const FacultyExamMarksScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ subjectName?: string; subjectId?: string }>();
  const defaultSubject = params.subjectName ?? mockFacultySubjects[0].subject;

  const [examType, setExamType] = React.useState<ExamType>("CIA 1");
  const [selectedSubject, setSelectedSubject] = React.useState(defaultSubject);
  const [entries, setEntries] = React.useState<ExamMarkEntry[]>(() => getDefaultExamEntries(MAX_MARKS["CIA 1"]));
  const [submitted, setSubmitted] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Configuration Modal Sheet Visibility
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = React.useState(false);

  const maxMarks = MAX_MARKS[examType];

  React.useEffect(() => {
    setEntries(getDefaultExamEntries(maxMarks));
  }, [examType]);

  const setMark = (studentId: string, value: string) => {
    const num = parseInt(value, 10);
    setEntries((prev) => prev.map((e) =>
      e.studentId === studentId
        ? { ...e, marks: isNaN(num) ? null : Math.min(num, maxMarks) }
        : e
    ));
  };

  const filledCount = entries.filter((e) => e.marks !== null).length;

  const handleSubmit = () => {
    if (filledCount < entries.length) {
      setShowConfirm(true);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Enter Exam Marks</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{selectedSubject}</Text>
        </View>
        <Pressable style={styles.headerActionBtn} onPress={() => setShowConfigModal(true)}>
          <SlidersHorizontal size={18} color={Colors.BluePrimary} />
        </Pressable>
      </View>

      {/* Selected Config Info Banner */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel} numberOfLines={1}>
          {examType}  ·  {selectedSubject}  ·  Max Marks: {maxMarks}
        </Text>
      </View>

      {/* Progress info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Entered Marks: <Text style={styles.infoValue}>{filledCount}/{entries.length}</Text></Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 0.5, textAlign: "center" }]}>#</Text>
            <Text style={[styles.thCell, { flex: 2 }]}>Student</Text>
            <Text style={[styles.thCell, { flex: 1, textAlign: "center" }]}>Roll</Text>
            <Text style={[styles.thCell, { flex: 1.2, textAlign: "center" }]}>Marks /{maxMarks}</Text>
          </View>

          {entries.map((entry, idx) => {
            const val = entry.marks !== null ? String(entry.marks) : "";
            const isValid = entry.marks !== null && entry.marks <= maxMarks;
            return (
              <View key={entry.studentId} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tdCell, { flex: 0.5, textAlign: "center", color: Colors.AppOnSurfaceVariant }]}>{idx + 1}</Text>
                <Text style={[styles.tdCell, { flex: 2 }]} numberOfLines={1}>{entry.name}</Text>
                <Text style={[styles.tdCell, { flex: 1, textAlign: "center" }]}>{entry.rollNo}</Text>
                <View style={{ flex: 1.2, alignItems: "center" }}>
                  <TextInput
                    style={[styles.marksInput, isValid && { borderColor: Colors.ColorPresent }]}
                    keyboardType="numeric"
                    value={val}
                    onChangeText={(v) => setMark(entry.studentId, v)}
                    placeholder="--"
                    placeholderTextColor={Colors.AppOnSurfaceVariant + "80"}
                    maxLength={3}
                  />
                </View>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit button */}
      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <ClipboardList size={18} color="#fff" />
          <Text style={styles.submitText}>Submit Marks ({filledCount}/{entries.length})</Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Incomplete Marks</Text>
            <Text style={styles.confirmMsg}>
              {entries.length - filledCount} students still have no marks entered for {examType}.
              {"\n\n"}
              Do you want to submit anyway?
            </Text>
            <View style={styles.confirmBtnGroup}>
              <Pressable style={[styles.confirmBtn, styles.confirmBtnCancel]} onPress={() => setShowConfirm(false)}>
                <Text style={styles.confirmBtnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.confirmBtn, styles.confirmBtnSubmit]} onPress={() => {
                setShowConfirm(false);
                setSubmitted(true);
              }}>
                <Text style={styles.confirmBtnTextSubmit}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <CheckCircle size={40} color={Colors.ColorPresent} />
            </View>
            <Text style={styles.successTitle}>Marks Submitted!</Text>
            <Text style={styles.successMsg}>{examType} marks for{"\n"}{selectedSubject}{"\n"}submitted successfully.</Text>
            <Pressable style={styles.doneBtn} onPress={() => { setSubmitted(false); router.back(); }}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Configuration sheet (Bottom Modal) */}
      <Modal visible={showConfigModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowConfigModal(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Subject & Exam</Text>
              <Pressable onPress={() => setShowConfigModal(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <View style={styles.configContent}>
              {/* Subject Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject</Text>
                <Pressable style={styles.fullDropdownTrigger} onPress={() => setShowSubjectPicker(true)}>
                  <Text style={styles.dropdownValue} numberOfLines={1}>{selectedSubject}</Text>
                  <ChevronDown size={18} color={Colors.AppOnSurfaceVariant} />
                </Pressable>
              </View>

              {/* Exam Type Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Exam Type</Text>
                <View style={styles.fullChipGroup}>
                  {(["CIA 1", "CIA 2", "Semester"] as ExamType[]).map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.fullSelectorChip, examType === type && styles.fullSelectorChipActive]}
                      onPress={() => setExamType(type)}
                    >
                      <Text style={[styles.fullSelectorChipText, examType === type && styles.fullSelectorChipTextActive]}>
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Apply settings done button */}
              <Pressable style={styles.applyBtn} onPress={() => setShowConfigModal(false)}>
                <Text style={styles.applyBtnText}>Apply Settings</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subject Picker Sub-Modal */}
      <Modal visible={showSubjectPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowSubjectPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Subject</Text>
              <Pressable onPress={() => setShowSubjectPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {mockFacultySubjects.map((s) => {
                const active = selectedSubject === s.subject;
                return (
                  <Pressable
                    key={s.id}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedSubject(s.subject);
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]} numberOfLines={1}>
                      {s.subject}
                    </Text>
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
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.AppSurface, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline,
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: Colors.AppOnBackground },
  headerSub: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 1 },
  headerActionBtn: {
    width: 38, height: 38, alignItems: "center", justifyContent: "center",
    borderRadius: 19, backgroundColor: Colors.TealTertiary + "0F",
  },
  dateRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.TealTertiary + "0D" },
  dateLabel: { fontSize: 12, fontWeight: "700", color: Colors.TealTertiary, textAlign: "center" },
  infoBar: {
    flexDirection: "row", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: "#F1F5F9", borderBottomWidth: 0.5, borderBottomColor: Colors.AppOutline,
  },
  infoText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: "500" },
  infoValue: { fontWeight: "800", color: Colors.TealTertiary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 0, paddingTop: 0 },
  tableHeader: {
    flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.AppOutline + "60",
  },
  thCell: { fontSize: 12, fontWeight: "700", color: Colors.AppOnSurfaceVariant },
  tableRow: {
    flexDirection: "row", paddingHorizontal: 12, paddingVertical: 12,
    alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: Colors.AppOutline,
  },
  tableRowAlt: { backgroundColor: Colors.AppSurface },
  tdCell: { fontSize: 13, color: Colors.AppOnBackground, fontWeight: "500" },
  marksInput: {
    width: 52, height: 34, borderWidth: 1.5, borderColor: Colors.AppOutline,
    borderRadius: 8, textAlign: "center", fontSize: 14, fontWeight: "800",
    color: Colors.AppOnBackground, backgroundColor: Colors.AppBackground,
    paddingVertical: 0, paddingHorizontal: 0,
    includeFontPadding: false,
  },
  submitContainer: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.AppSurface, borderTopWidth: 1, borderTopColor: Colors.AppOutline,
  },
  submitBtn: {
    backgroundColor: Colors.TealTertiary, borderRadius: 14,
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
  successMsg: { fontSize: 14, color: Colors.AppOnSurfaceVariant, textAlign: "center", lineHeight: 22 },
  doneBtn: {
    marginTop: 20, backgroundColor: Colors.TealTertiary, borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 12,
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  confirmModal: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.AppOnBackground,
    marginBottom: 12,
  },
  confirmMsg: {
    fontSize: 14,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmBtnGroup: {
    flexDirection: "row",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnCancel: {
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
  },
  confirmBtnSubmit: {
    backgroundColor: Colors.TealTertiary,
  },
  confirmBtnTextCancel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  confirmBtnTextSubmit: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  formGroup: {
    gap: 8,
    marginBottom: 16,
    width: "100%",
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  fullDropdownTrigger: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnBackground,
  },
  fullChipGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  fullSelectorChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  fullSelectorChipActive: {
    backgroundColor: Colors.TealTertiary,
    borderColor: Colors.TealTertiary,
  },
  fullSelectorChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  fullSelectorChipTextActive: {
    color: "#FFFFFF",
  },
  applyBtn: {
    backgroundColor: Colors.TealTertiary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.AppOnBackground,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: Colors.TealTertiary + "0D",
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.AppOnSurfaceVariant,
  },
  pickerItemTextActive: {
    fontWeight: "700",
    color: Colors.TealTertiary,
  },
  configContent: {
    padding: 20,
    gap: 16,
  },
});
