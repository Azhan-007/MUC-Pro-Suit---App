import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../theme";
import { CampusCard, CustomButton, useCampusAlert } from "../../components";
import { getDefaultAttendanceEntries } from "../../data/mockFacultyData";
import { StudentAttendanceEntry } from "../../types";
import { 
  Check, X, Clock, CheckCircle, ChevronDown, SlidersHorizontal, List, Grid, ArrowLeft, Pencil, Trash2 
} from "lucide-react-native";
import { getDayOrder } from "../../utils/dayOrder";

const ModalKeyboardAvoidingView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ width: "100%" }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <>{children}</>;
};

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

export const FacultyClassesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const params = useLocalSearchParams<{
    subjectName?: string;
    classCode?: string;
    period?: string;
    date?: string;
    originalFaculty?: string;
    shift?: string;
  }>();

  const [selectedClass, setSelectedClass] = React.useState<string>(params.classCode ?? "III B.Sc CS");
  const [showClassPicker, setShowClassPicker] = React.useState(false);
  
  const [selectedShift, setSelectedShift] = React.useState<"Shift I" | "Shift II" | "Girls">(
    (params.shift as any) ?? "Shift I"
  );

  const initialHour = params.period ? params.period.replace(/[^0-9]/g, "") : "1";
  const [selectedHour, setSelectedHour] = React.useState<"1" | "2" | "3" | "4" | "5">(
    (initialHour === "1" || initialHour === "2" || initialHour === "3" || initialHour === "4" || initialHour === "5"
      ? initialHour
      : "1") as any
  );
  const [selectedSubject, setSelectedSubject] = React.useState<string>(params.subjectName ?? "Database Management System");
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    if (params.date) {
      const parsed = new Date(params.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  // Configuration Sheet Visibility
  const [showConfigModal, setShowConfigModal] = React.useState(false);

  // Layout View Mode state (List vs. Grid Box format)
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  // Lesson Topic & Description State
  const defaultTopic = params.subjectName
    ? `${params.subjectName} - Lecture (Engaged)`
    : "Database Normalization";
  const [lessonTopic, setLessonTopic] = React.useState(defaultTopic);
  const [lessonDesc, setLessonDesc] = React.useState(
    params.subjectName
      ? `Engaged attendance for ${params.originalFaculty ?? "original teacher"}.`
      : "Covered first normal form and second normal form examples."
  );
  const [showLessonModal, setShowLessonModal] = React.useState(false);
  const [tempTopic, setTempTopic] = React.useState(lessonTopic);
  const [tempDesc, setTempDesc] = React.useState(lessonDesc);

  // Student Entries (uses MUC default mock students for selected class)
  const [entries, setEntries] = React.useState<StudentAttendanceEntry[]>(getDefaultAttendanceEntries);

  React.useEffect(() => {
    if (params.classCode) {
      setSelectedClass(params.classCode);
    }
    if (params.shift) {
      setSelectedShift(params.shift as any);
    }
    if (params.subjectName) {
      setSelectedSubject(params.subjectName);
      setSelectedHour(prev => {
        const initialHour = params.period ? params.period.replace(/[^0-9]/g, "") : "1";
        return (initialHour === "1" || initialHour === "2" || initialHour === "3" || initialHour === "4" || initialHour === "5"
          ? initialHour
          : prev) as any;
      });
      if (params.date) {
        const parsed = new Date(params.date);
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
        }
      }
      const newTopic = `${params.subjectName} - Lecture (Engaged)`;
      setLessonTopic(newTopic);
      setTempTopic(newTopic);
      const newDesc = `Engaged attendance for ${params.originalFaculty ?? "original teacher"}.`;
      setLessonDesc(newDesc);
      setTempDesc(newDesc);
    }
  }, [params.classCode, params.subjectName, params.period, params.date, params.originalFaculty, params.shift]);

  React.useEffect(() => {
    // Only run default logic if we did not come from routing params
    if (!params.subjectName) {
      if (selectedClass.includes("III")) {
        setSelectedSubject("Database Management System");
      } else {
        setSelectedSubject("Operating System");
      }
    }
  }, [selectedClass, params.subjectName]);

  React.useEffect(() => {
    // Dynamically update student roll number prefix to match Shift:
    // Shift I: 12xx, Shift II: 14xx, Girls: 15xx
    let prefix = "12";
    if (selectedShift === "Shift II") prefix = "14";
    if (selectedShift === "Girls") prefix = "15";

    setEntries(
      getDefaultAttendanceEntries().map((student, idx) => ({
        ...student,
        rollNo: `${prefix}${(idx + 1).toString().padStart(2, "0")}`,
      }))
    );
  }, [selectedShift, selectedClass]);

  const formatDate = (date: Date) => {
    const dtStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const doStr = getDayOrder(date) || "D1";
    return `${dtStr} (${doStr})`;
  };

  const getPastDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const setStatus = (studentId: string, status: AttStatus) => {
    setEntries((prev) => prev.map((e) => e.studentId === studentId ? { ...e, status } : e));
  };

  const toggleStudentStatus = (studentId: string, currentStatus: AttStatus) => {
    let nextStatus: AttStatus = "PRESENT";
    if (currentStatus === "PRESENT") nextStatus = "ABSENT";
    else if (currentStatus === "ABSENT") nextStatus = "LATE";
    else nextStatus = "PRESENT";
    setStatus(studentId, nextStatus);
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
    setShowConfirm(true);
  };

  const resetAttendance = () => {
    setEntries(getDefaultAttendanceEntries());
  };

  // Action Tools handlers
  const handleCopyAttendance = (sourceHour: string) => {
    showAlert(
      "Copy Attendance",
      `Copy attendance markings from period Hour ${sourceHour}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy",
          onPress: () => {
            setEntries((prev) =>
              prev.map((e, idx) => ({
                ...e,
                status: idx % 6 === 0 ? "ABSENT" : idx % 11 === 0 ? "LATE" : "PRESENT",
              }))
            );
            showAlert("Success", `Attendance copied from Hour ${sourceHour} successfully.`);
          },
        },
      ]
    );
  };

  const handleMarkAllToggle = () => {
    const allPresent = entries.every((e) => e.status === "PRESENT");
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        status: allPresent ? "ABSENT" : "PRESENT",
      }))
    );
  };

  const handleSortPress = () => {
    showAlert(
      "Sort Students",
      "Select sorting order:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sort by Roll Number (Asc)",
          onPress: () => {
            setEntries((prev) =>
              [...prev].sort((a, b) => parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10))
            );
          },
        },
        {
          text: "Sort by Name (A-Z)",
          onPress: () => {
            setEntries((prev) =>
              [...prev].sort((a, b) => a.name.localeCompare(b.name))
            );
          },
        },
      ]
    );
  };

  const handleResetPress = () => {
    showAlert(
      "Reset Attendance",
      "Are you sure you want to clear and reset all student markings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetAttendance();
            showAlert("Reset Completed", "All student markings reset to PRESENT.");
          },
        },
      ]
    );
  };

  const handleOpenEditTopic = () => {
    setTempTopic(lessonTopic);
    setTempDesc(lessonDesc);
    setShowLessonModal(true);
  };

  const handleSaveLessonInfo = () => {
    setLessonTopic(tempTopic);
    setLessonDesc(tempDesc);
    setShowLessonModal(false);
    showAlert("Saved", "Lesson topic and description updated.");
  };

  const StatusBtn = ({ label, status, current, studentId }: { label: string; status: AttStatus; current: AttStatus; studentId: string }) => {
    const active = current === status;
    const COLOR = status === "PRESENT" ? Colors.ColorPresent : status === "ABSENT" ? Colors.ColorAbsent : Colors.ColorPending;
    return (
      <Pressable
        style={[styles.statusBtn, { borderColor: active ? COLOR : Colors.AppOutline, backgroundColor: active ? COLOR : "transparent" }]}
        onPress={() => setStatus(studentId, status)}
      >
        {status === "PRESENT" ? <Check size={13} color={active ? "#FFFFFF" : Colors.AppOnSurfaceVariant} /> :
         status === "ABSENT" ? <X size={13} color={active ? "#FFFFFF" : Colors.AppOnSurfaceVariant} /> :
         <Clock size={13} color={active ? "#FFFFFF" : Colors.AppOnSurfaceVariant} />}
        <Text style={[styles.statusBtnText, { color: active ? "#FFFFFF" : Colors.AppOnSurfaceVariant }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
        </View>
        <Pressable style={styles.headerActionBtn} onPress={() => setShowConfigModal(true)}>
          <SlidersHorizontal size={18} color={Colors.BluePrimary} />
        </Pressable>
      </View>

      {/* Summary bar (Restored to top) */}
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

      {/* ── Shift Tabs ── */}
      <View style={styles.shiftTabBar}>
        <View style={styles.shiftTabsContainer}>
          {["Shift I", "Shift II", "Girls"].map((shift) => {
            const active = selectedShift === shift;
            return (
              <Pressable
                key={shift}
                style={[styles.shiftTab, active && styles.shiftTabActive]}
                onPress={() => setSelectedShift(shift as any)}
              >
                <Text style={[styles.shiftTabTxt, active && styles.shiftTabTxtActive]}>{shift}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected Session Information Banner + View Mode Toggle */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel} numberOfLines={1}>
          {selectedClass}  ·  {selectedSubject === "Database Management System" ? "DBMS" : "OS"}  ·  {getHourLabel(selectedHour)}  ·  {formatDate(selectedDate)}
        </Text>
        <View style={styles.toggleGroup}>
          <Pressable
            style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
            onPress={() => setViewMode("list")}
          >
            <List size={14} color={viewMode === "list" ? Colors.BluePrimary : "#64748B"} />
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
            onPress={() => setViewMode("grid")}
          >
            <Grid size={14} color={viewMode === "grid" ? Colors.BluePrimary : "#64748B"} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Tools Row */}
        <View style={styles.toolsRow}>
          {/* Copy Att. */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Copy Att.</Text>
            <Pressable 
              style={styles.dropdownTriggerSmall} 
              onPress={() => {
                showAlert("Copy Source", "Select period to copy from:", [
                  { text: "1st Hour", onPress: () => handleCopyAttendance("1") },
                  { text: "2nd Hour", onPress: () => handleCopyAttendance("2") },
                  { text: "3rd Hour", onPress: () => handleCopyAttendance("3") },
                  { text: "4th Hour", onPress: () => handleCopyAttendance("4") },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <Text style={styles.dropdownValueText}>{selectedHour}</Text>
              <ChevronDown size={12} color="#64748B" />
            </Pressable>
          </View>

          {/* Mark All */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Mark All</Text>
            <Pressable style={styles.checkboxTrigger} onPress={handleMarkAllToggle}>
              <View style={[styles.checkboxBox, entries.every(e => e.status === "PRESENT") && styles.checkboxActive]} />
            </Pressable>
          </View>

          {/* Sort By */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Sort by</Text>
            <Pressable style={styles.dropdownTriggerSmall} onPress={handleSortPress}>
              <Text style={styles.dropdownValueText} numberOfLines={1}>Sort...</Text>
              <ChevronDown size={12} color="#64748B" />
            </Pressable>
          </View>

          {/* Delete (Reset) */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Delete</Text>
            <Pressable style={styles.deleteBtn} onPress={handleResetPress}>
              <Trash2 size={15} color={Colors.ColorAbsent} />
            </Pressable>
          </View>
        </View>

        {/* Student list render */}
        {viewMode === "list" ? (
          entries.map((entry) => (
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
          ))
        ) : (
          <View style={styles.gridContainer}>
            {entries.map((entry) => {
              const isPresent = entry.status === "PRESENT";
              const isAbsent = entry.status === "ABSENT";

              const boxBg = isPresent ? Colors.ColorPresent : isAbsent ? Colors.ColorAbsent : Colors.ColorPending;
              const textPrimary = "#FFFFFF";
              const labelBg = "rgba(255, 255, 255, 0.22)";

              return (
                <Pressable
                  key={entry.studentId}
                  style={[
                    styles.gridBox,
                    {
                      backgroundColor: boxBg,
                      borderColor: boxBg,
                    },
                  ]}
                  onPress={() => toggleStudentStatus(entry.studentId, entry.status)}
                >
                  <Text style={[styles.gridBoxRoll, { color: textPrimary }]}>{entry.rollNo}</Text>
                  <View style={[styles.gridStatusLabel, { backgroundColor: labelBg }]}>
                    <Text style={styles.gridStatusText}>
                      {entry.status === "PRESENT" ? "PRES" : entry.status === "ABSENT" ? "ABS" : "LATE"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Lesson Topic Card */}
        <CampusCard style={styles.infoCard} elevation="sm">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardInfoLabel}>Lesson Topic</Text>
            <Pressable onPress={handleOpenEditTopic} hitSlop={8}>
              <Pencil size={15} color={Colors.BluePrimary} />
            </Pressable>
          </View>
          <Text style={styles.cardInfoValue}>{lessonTopic}</Text>
          
          <Text style={[styles.cardInfoLabel, { marginTop: 12 }]}>Description</Text>
          <Text style={styles.cardInfoValue}>{lessonDesc}</Text>
        </CampusCard>

        {/* Marked By Signature Box */}
        <CampusCard style={styles.markedByCard} elevation="sm">
          <Text style={styles.markedByLabel}>Marked by</Text>
          <View style={styles.markedByContent}>
            <View style={styles.markedByLeft}>
              <View style={styles.facultyAvatar}>
                <Text style={styles.facultyAvatarText}>PR</Text>
              </View>
              <View>
                <Text style={styles.facultyName}>Dr P Rizwan Ahmed</Text>
                <Text style={styles.facultyDept}>Department of Computer Science (S1)</Text>
              </View>
            </View>
            <Pressable onPress={() => showAlert("Report View", "Navigating to marked history logs...")}>
              <Text style={styles.viewReportText}>View Report &gt;</Text>
            </Pressable>
          </View>
        </CampusCard>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <CheckCircle size={18} color="#fff" />
          <Text style={styles.submitText}>Submit Attendance</Text>
        </Pressable>
      </View>

      {/* Lesson Edit Modal Sheet */}
      <Modal visible={showLessonModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowLessonModal(false)} />
          <ModalKeyboardAvoidingView>
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Edit Lesson Details</Text>
                <Pressable onPress={() => setShowLessonModal(false)} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Lesson Topic</Text>
                  <TextInput
                    style={styles.textInputArea}
                    value={tempTopic}
                    onChangeText={setTempTopic}
                    placeholder="Enter lesson topic..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={styles.textInputArea}
                    value={tempDesc}
                    onChangeText={setTempDesc}
                    placeholder="Enter description..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <CustomButton text="Save Changes" onPress={handleSaveLessonInfo} style={{ marginTop: 12 }} />
              </ScrollView>
            </View>
          </ModalKeyboardAvoidingView>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Submit Attendance</Text>
            <Text style={styles.confirmMsg}>
              Submit attendance for {selectedClass} ({selectedSubject}) at {getHourLabel(selectedHour)} on {formatDate(selectedDate)}?
              {"\n\n"}
              Present: {presentCount}  ·  Absent: {absentCount}  ·  Late: {lateCount}
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
            <Text style={styles.successTitle}>Attendance Submitted!</Text>
            <Text style={styles.successMsg}>
              {selectedClass} · {getHourLabel(selectedHour)}{"\n"}{selectedSubject}{"\n"}Date: {formatDate(selectedDate)}{"\n\n"}Present: {presentCount} · Absent: {absentCount} · Late: {lateCount}
            </Text>
            <Pressable style={styles.doneBtn} onPress={() => { setSubmitted(false); resetAttendance(); }}>
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
              <Text style={styles.pickerTitle}>Class & Session Settings</Text>
              <Pressable onPress={() => setShowConfigModal(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView 
              contentContainerStyle={styles.configContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <Pressable style={styles.fullDropdownTrigger} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dropdownValue}>{formatDate(selectedDate)}</Text>
                  <ChevronDown size={18} color={Colors.AppOnSurfaceVariant} />
                </Pressable>
              </View>

              {/* Class Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Class / Section</Text>
                <Pressable style={styles.fullDropdownTrigger} onPress={() => setShowClassPicker(true)}>
                  <Text style={styles.dropdownValue}>{selectedClass}</Text>
                  <ChevronDown size={18} color={Colors.AppOnSurfaceVariant} />
                </Pressable>
              </View>

              {/* Subject Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject</Text>
                <View style={styles.fullChipGroup}>
                  {["Database Management System", "Operating System"].map((sub) => {
                    const active = selectedSubject === sub;
                    return (
                      <Pressable
                        key={sub}
                        style={[styles.fullSelectorChip, active && styles.fullSelectorChipActive]}
                        onPress={() => setSelectedSubject(sub)}
                      >
                        <Text style={[styles.fullSelectorChipText, active && styles.fullSelectorChipTextActive]} numberOfLines={1}>
                          {sub === "Database Management System" ? "DBMS" : "OS"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Hour Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Period / Hour</Text>
                <View style={styles.hourSelectorRow}>
                  {(["1", "2", "3", "4", "5"] as const).map((hr) => {
                    const active = selectedHour === hr;
                    return (
                      <Pressable
                        key={hr}
                        style={[styles.hourCircle, active && styles.hourCircleActive]}
                        onPress={() => setSelectedHour(hr)}
                      >
                        <Text style={[styles.hourCircleText, active && styles.hourCircleTextActive]}>{hr}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable style={styles.applyBtn} onPress={() => setShowConfigModal(false)}>
                <Text style={styles.applyBtnText}>Apply Settings</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Sub-Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowDatePicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {getPastDates().map((d) => {
                const active = selectedDate.toDateString() === d.toDateString();
                return (
                  <Pressable
                    key={d.toISOString()}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedDate(d);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>
                      {formatDate(d)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class Picker Sub-Modal */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowClassPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Class</Text>
              <Pressable onPress={() => setShowClassPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {CLASSES.map((cls) => {
                const active = selectedClass === cls;
                return (
                  <Pressable
                    key={cls}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedClass(cls);
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>
                      {cls}
                    </Text>
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

const CLASSES = [
  "I B.Sc CS",
  "II B.Sc CS",
  "III B.Sc CS",
  "I BCA",
  "II BCA",
  "III BCA",
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.AppSurface, borderBottomWidth: 1, borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: Colors.AppOnBackground },
  headerActionBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  
  summaryBar: {
    flexDirection: "row", backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingVertical: 10,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryCount: { fontSize: 20, fontWeight: "900", color: Colors.AppOnBackground },
  summaryLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, fontWeight: "500" },
  summaryDivider: { width: 1, backgroundColor: Colors.AppOutline },
  dateRow: {
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.BluePrimary + "0D",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  dateLabel: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary, flex: 1 },
  toggleGroup: {
    flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 8, padding: 2, gap: 2, alignItems: "center",
  },
  toggleBtn: {
    width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 9999, elevation: 10 },
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
    marginTop: 20, backgroundColor: Colors.BluePrimary, borderRadius: 12,
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
    backgroundColor: Colors.BluePrimary,
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
  dropdownTrigger: {
    width: 190,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hourCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    backgroundColor: Colors.AppSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  hourCircleActive: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  hourCircleText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  hourCircleTextActive: {
    color: "#FFFFFF",
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnBackground,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
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
    paddingBottom: 32,
    maxHeight: "85%",
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
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
    backgroundColor: Colors.BluePrimary + "0D",
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.AppOnSurfaceVariant,
  },
  pickerItemTextActive: {
    fontWeight: "700",
    color: Colors.BluePrimary,
  },
  configContent: {
    padding: 20,
    gap: 16,
  },
  applyBtn: {
    backgroundColor: Colors.BluePrimary,
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 10,
  },
  gridBox: {
    width: "22%",
    aspectRatio: 1, // Perfectly square!
    borderRadius: 16, // Highly rounded, premium look
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  gridBoxRoll: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  gridStatusLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridStatusText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  hourSelectorRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginVertical: 10,
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
  formGroup: {
    width: "100%",
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
    marginBottom: 6,
  },

  // ── NEW CUSTOM STYLES ADDED ──
  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    width: "100%",
  },
  toolCol: {
    alignItems: "center",
    gap: 4,
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  dropdownTriggerSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 54,
    justifyContent: "center",
  },
  dropdownValueText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.BluePrimary,
  },
  checkboxTrigger: {
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  checkboxActive: {
    backgroundColor: Colors.ColorPresent,
    borderColor: Colors.ColorPresent,
  },
  deleteBtn: {
    backgroundColor: "#FFF5F5",
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    width: "100%",
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
  },
  infoCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
    width: "100%",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardInfoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  cardInfoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnBackground,
    lineHeight: 18,
  },
  markedByCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
    width: "100%",
  },
  markedByLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
  },
  markedByContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  markedByLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  facultyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  facultyAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  facultyName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.AppOnBackground,
  },
  facultyDept: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  viewReportText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.BluePrimary,
  },
  modalScrollContent: {
    padding: 20,
    gap: 16,
  },
  textInputArea: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnBackground,
    textAlignVertical: "top",
  },
  fullChipGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginTop: 4,
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
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
  },
  fullSelectorChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.AppOnSurfaceVariant,
  },
  fullSelectorChipTextActive: {
    color: "#FFFFFF",
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
});
