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
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, Check, X, Clock, CheckCircle, LayoutGrid, List, Pencil, Trash2, ChevronDown 
} from "lucide-react-native";
import { Colors } from "../../theme";
import { CampusCard, CustomButton, useCampusAlert } from "../../components";
import { getDayOrder } from "../../utils/dayOrder";

type AttStatus = "PRESENT" | "ABSENT" | "LATE";

interface AttendanceStudent {
  studentId: string;
  name: string;
  rollNo: string;
  section: string;
  status: AttStatus;
}

const { width: screenWidth } = Dimensions.get("window");
const GRID_COLS = 6;
const GRID_GAP = 10;
const GRID_ITEM_SIZE = (screenWidth - 32 - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;

export const FacultyMarkAttendanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const params = useLocalSearchParams<{
    subjectName?: string;
    period?: string;
    date?: string;
  }>();
  const initialSubject = params.subjectName ?? "URDU III";

  // State
  const initialHour = params.period ? params.period.replace(/[^0-9]/g, "") : "3";
  const [selectedHour, setSelectedHour] = React.useState<string>(initialHour || "3");
  const [selectedSubject] = React.useState<string>(initialSubject);
  const [viewType, setViewType] = React.useState<"GRID" | "LIST">("GRID");
  const [submitted, setSubmitted] = React.useState(false);
  const [showHourPicker, setShowHourPicker] = React.useState(false);

  // Lesson Topic & Description State
  const defaultTopic = initialSubject.includes("URDU") ? "اردو زبان کی ابتداء و ارتقاء" : `${initialSubject} - Lecture`;
  const [lessonTopic, setLessonTopic] = React.useState(defaultTopic);
  const [lessonDesc, setLessonDesc] = React.useState(defaultTopic);
  const [showLessonModal, setShowLessonModal] = React.useState(false);
  const [tempTopic, setTempTopic] = React.useState(lessonTopic);
  const [tempDesc, setTempDesc] = React.useState(lessonDesc);

  // Attendance Date (Dynamic real-time sync)
  const [attendanceDate] = React.useState<Date>(() => {
    if (params.date) {
      const parsed = new Date(params.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const dayOrderLabel = getDayOrder(attendanceDate) || "D1";
  const formattedDateString = attendanceDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).replace(/\//g, "-");

  // Student Entries
  const [entries, setEntries] = React.useState<AttendanceStudent[]>([
    // B.Com (General)-2025-26
    { studentId: 'bc01', name: 'Zaid Khan', rollNo: '1401', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc02', name: 'Saad Ahmed', rollNo: '1402', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc03', name: 'Hamza Farooqi', rollNo: '1403', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc04', name: 'Suhail Ahmed', rollNo: '1404', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc05', name: 'Mohamed Anas', rollNo: '1405', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc06', name: 'Syed Moosa', rollNo: '1407', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc07', name: 'Adnan Sami', rollNo: '1408', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc08', name: 'Salman Ahmed', rollNo: '1409', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc09', name: 'Faizan Ahmed', rollNo: '1410', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc10', name: 'Javed Akhtar', rollNo: '1411', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc11', name: 'Usman Ghani', rollNo: '1412', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc12', name: 'Aqueel Ahmed', rollNo: '1413', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc13', name: 'Imran Khan', rollNo: '1414', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc14', name: 'Shabir Ali', rollNo: '1415', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc15', name: 'Waseem Akram', rollNo: '1416', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc16', name: 'Mustafa Kamal', rollNo: '1417', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc17', name: 'Bilal Ahmed', rollNo: '1419', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc18', name: 'Sajid Mahmood', rollNo: '1421', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc19', name: 'Tariq Anwar', rollNo: '1422', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc20', name: 'Khalid Mahmood', rollNo: '1423', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc21', name: 'Mohamed Riaz', rollNo: '1424', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc22', name: 'Faisal Karim', rollNo: '1425', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc23', name: 'Nasir Jamshed', rollNo: '1426', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc24', name: 'Shoaib Malik', rollNo: '1427', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc25', name: 'Kamran Akmal', rollNo: '1428', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc26', name: 'Younis Khan', rollNo: '1429', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc27', name: 'Misbah Ul Haq', rollNo: '1430', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc28', name: 'Saeed Ajmal', rollNo: '1431', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc29', name: 'Umer Gul', rollNo: '1432', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc30', name: 'Abdur Razzaq', rollNo: '1433', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc31', name: 'Mohammad Hafeez', rollNo: '1434', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc32', name: 'Wahab Riaz', rollNo: '1435', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc33', name: 'Azhar Ali', rollNo: '1436', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc34', name: 'Asad Shafiq', rollNo: '1438', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    { studentId: 'bc35', name: 'Sarfraz Ahmed', rollNo: '1439', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc36', name: 'Babar Azam', rollNo: '1441', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc37', name: 'Fakhar Zaman', rollNo: '1444', section: 'B.Com (General)-2025-26', status: 'ABSENT' },
    { studentId: 'bc38', name: 'Imam Ul Haq', rollNo: '1446', section: 'B.Com (General)-2025-26', status: 'PRESENT' },
    
    // B.Sc (Computer Science)-2025-26
    { studentId: 'cs01', name: 'Mohammed Azhan T', rollNo: '1201', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs02', name: 'Abdul Rahman K', rollNo: '1205', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs03', name: 'Fathima Zahra M', rollNo: '1209', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs04', name: 'Ibrahim Siddiq P', rollNo: '1210', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs05', name: 'Ayesha Banu R', rollNo: '1211', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs06', name: 'Umar Farooq S', rollNo: '1213', section: 'B.Sc (Computer Science)-2025-26', status: 'ABSENT' },
    { studentId: 'cs07', name: 'Zainab Nasreen A', rollNo: '1214', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
    { studentId: 'cs08', name: 'Hassan Ali M', rollNo: '1215', section: 'B.Sc (Computer Science)-2025-26', status: 'PRESENT' },
  ]);

  // Unique sections list
  const sectionList = Array.from(new Set(entries.map((e) => e.section)));

  // Toggle single student status (cycles PRESENT -> ABSENT -> LATE -> PRESENT)
  const toggleStudentStatus = (studentId: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.studentId === studentId) {
          let next: AttStatus = "PRESENT";
          if (e.status === "PRESENT") next = "ABSENT";
          else if (e.status === "ABSENT") next = "LATE";
          return { ...e, status: next };
        }
        return e;
      })
    );
  };

  // Actions
  const handleCopyAttendance = (sourceHour: string) => {
    showAlert(
      "Copy Attendance",
      `Copy attendance markings from Period Hour ${sourceHour}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy",
          onPress: () => {
            // Simulated copy
            setEntries((prev) =>
              prev.map((e, idx) => ({
                ...e,
                status: idx % 7 === 0 ? "ABSENT" : idx % 13 === 0 ? "LATE" : "PRESENT",
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
            setEntries((prev) => prev.map((e) => ({ ...e, status: "PRESENT" })));
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

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;
  const lateCount = entries.filter((e) => e.status === "LATE").length;

  const getStatusColor = (status: AttStatus) => {
    if (status === "PRESENT") return "#22C55E";
    if (status === "ABSENT") return "#EF4444";
    return "#F59E0B";
  };

  const handleSubmit = () => {
    showAlert(
      "Submit Attendance",
      `Submit attendance for Hour ${selectedHour}?\n\nPresent: ${presentCount} · Absent: ${absentCount} · Late: ${lateCount}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: () => setSubmitted(true) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hour, Day Order and Date row */}
        <View style={styles.metaRow}>
          <View style={styles.hourBadgeRow}>
            <Text style={styles.metaTitle}>Hour :</Text>
            <Pressable style={styles.hourBadge} onPress={() => setShowHourPicker(true)}>
              <Text style={styles.hourBadgeText}>{selectedHour}</Text>
            </Pressable>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.dayOrderText}>Day order : {dayOrderLabel}</Text>
            <Text style={styles.dateText}>{formattedDateString}</Text>
          </View>
        </View>

        {/* Subject Heading */}
        <Text style={styles.subjectHeading}>{selectedSubject}</Text>

        {/* Action Tools Row */}
        <View style={styles.toolsRow}>
          {/* Copy Att. */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Copy Att.</Text>
            <Pressable 
              style={styles.dropdownTrigger} 
              onPress={() => {
                showAlert("Copy Source", "Select period to copy from:", [
                  { text: "Hour 1", onPress: () => handleCopyAttendance("1") },
                  { text: "Hour 2", onPress: () => handleCopyAttendance("2") },
                  { text: "Hour 4", onPress: () => handleCopyAttendance("4") },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <Text style={styles.dropdownValue}>{selectedHour}</Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Mark All */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Mark All</Text>
            <Pressable style={styles.checkboxTrigger} onPress={handleMarkAllToggle}>
              <View style={[styles.checkboxBox, entries.every(e => e.status === "PRESENT") && styles.checkboxActive]} />
            </Pressable>
          </View>

          {/* Grid/List View Toggle */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Grid View</Text>
            <View style={styles.toggleGroup}>
              <Pressable 
                style={[styles.toggleBtn, viewType === "GRID" && styles.toggleBtnActive]} 
                onPress={() => setViewType("GRID")}
              >
                <LayoutGrid size={15} color={viewType === "GRID" ? "#FFFFFF" : "#64748B"} />
              </Pressable>
              <Pressable 
                style={[styles.toggleBtn, viewType === "LIST" && styles.toggleBtnActive]} 
                onPress={() => setViewType("LIST")}
              >
                <List size={15} color={viewType === "LIST" ? "#FFFFFF" : "#64748B"} />
              </Pressable>
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Sort by</Text>
            <Pressable style={styles.dropdownTrigger} onPress={handleSortPress}>
              <Text style={styles.dropdownValue} numberOfLines={1}>Sort...</Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Delete (Reset) */}
          <View style={styles.toolCol}>
            <Text style={styles.toolLabel}>Delete</Text>
            <Pressable style={styles.deleteBtn} onPress={handleResetPress}>
              <Trash2 size={16} color={Colors.ColorAbsent} />
            </Pressable>
          </View>
        </View>

        {/* Student List or Grid per Section Group */}
        {sectionList.map((secName) => {
          const sectionStudents = entries.filter((e) => e.section === secName);
          return (
            <View key={secName} style={styles.sectionContainer}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{secName}</Text>
              </View>

              {/* Grid Layout */}
              {viewType === "GRID" ? (
                <View style={styles.gridContainer}>
                  {sectionStudents.map((st) => (
                    <Pressable
                      key={st.studentId}
                      style={[styles.gridItem, { backgroundColor: getStatusColor(st.status) }]}
                      onPress={() => toggleStudentStatus(st.studentId)}
                    >
                      <Text style={styles.gridItemText}>{st.rollNo}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                /* List Layout */
                <View style={styles.listContainer}>
                  {sectionStudents.map((st) => (
                    <CampusCard key={st.studentId} style={styles.studentListCard} elevation="none" borderColor={Colors.AppOutline}>
                      <View style={styles.studentListRow}>
                        <View style={styles.studentListLeft}>
                          <View style={[styles.listAvatar, { backgroundColor: getStatusColor(st.status) + "15" }]}>
                            <Text style={[styles.listAvatarText, { color: getStatusColor(st.status) }]}>
                              {st.rollNo.slice(-2)}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.studentListName}>{st.name}</Text>
                            <Text style={styles.studentListRoll}>Roll No: {st.rollNo}</Text>
                          </View>
                        </View>
                        <View style={styles.listBtnGroup}>
                          {(["PRESENT", "ABSENT", "LATE"] as const).map((stat) => {
                            const active = st.status === stat;
                            const statLabel = stat === "PRESENT" ? "P" : stat === "ABSENT" ? "A" : "L";
                            const color = getStatusColor(stat);
                            return (
                              <Pressable
                                key={stat}
                                style={[
                                  styles.listStatBtn,
                                  { 
                                    borderColor: active ? color : Colors.AppOutline,
                                    backgroundColor: active ? color + "1A" : "transparent"
                                  }
                                ]}
                                onPress={() => {
                                  setEntries(prev => prev.map(e => e.studentId === st.studentId ? { ...e, status: stat } : e));
                                }}
                              >
                                <Text style={[styles.listStatBtnText, { color: active ? color : "#64748B" }]}>
                                  {statLabel}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </CampusCard>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Stats Row Counters */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: "#22C55E" }]}>
            <Text style={styles.statLabelText}>Present</Text>
            <Text style={[styles.statNumber, { color: "#22C55E" }]}>{presentCount}</Text>
          </View>
          <View style={[styles.statBox, { borderColor: "#EF4444" }]}>
            <Text style={styles.statLabelText}>Absent</Text>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>{absentCount}</Text>
          </View>
          <View style={[styles.statBox, { borderColor: "#94A3B8" }]}>
            <Text style={styles.statLabelText}>Late</Text>
            <Text style={[styles.statNumber, { color: "#64748B" }]}>{lateCount}</Text>
          </View>
        </View>

        {/* Lesson Topic Box */}
        <CampusCard style={styles.infoCard} elevation="sm">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardInfoLabel}>Lesson Topic</Text>
            <Pressable onPress={handleOpenEditTopic} hitSlop={8}>
              <Pencil size={16} color={Colors.BluePrimary} />
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
                <Text style={styles.facultyAvatarText}>AS</Text>
              </View>
              <View>
                <Text style={styles.facultyName}>Dr. AYESHA SIDDIQUA J</Text>
                <Text style={styles.facultyDept}>Department of Urdu (S1)</Text>
              </View>
            </View>
            <Pressable onPress={() => showAlert("Report View", "Navigating to marked history logs...")}>
              <Text style={styles.viewReportText}>View Report &gt;</Text>
            </Pressable>
          </View>
        </CampusCard>

        {/* Submit Action */}
        <CustomButton text="Submit" onPress={handleSubmit} style={{ marginVertical: 20 }} />
      </ScrollView>

      {/* Lesson Edit Modal Sheet */}
      <Modal visible={showLessonModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.pickerOverlay}>
            <Pressable style={styles.pickerDismiss} onPress={() => setShowLessonModal(false)} />
            <View style={styles.pickerSheet}>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Hour Selector Modal */}
      <Modal visible={showHourPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowHourPicker(false)} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Hour</Text>
              <Pressable onPress={() => setShowHourPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
              {["1", "2", "3", "4", "5", "6"].map((hr) => {
                const active = selectedHour === hr;
                return (
                  <Pressable
                    key={hr}
                    style={[styles.hourItem, active && styles.hourItemActive]}
                    onPress={() => {
                      setSelectedHour(hr);
                      setShowHourPicker(false);
                    }}
                  >
                    <Text style={[styles.hourItemText, active && styles.hourItemTextActive]}>
                      Hour {hr}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <CheckCircle size={40} color="#22C55E" />
            </View>
            <Text style={styles.successTitle}>Attendance Submitted!</Text>
            <Text style={styles.successMsg}>
              Hour {selectedHour} · {selectedSubject}{"\n"}
              Present: {presentCount} · Absent: {absentCount} · Late: {lateCount}
            </Text>
            <Pressable 
              style={styles.doneBtn} 
              onPress={() => { 
                setSubmitted(false); 
                router.back(); 
              }}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.AppOnBackground },
  spacer: { width: 30 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Meta Info Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hourBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaTitle: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  hourBadge: {
    backgroundColor: Colors.BluePrimary,
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  hourBadgeText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  metaRight: {
    flexDirection: "row",
    gap: 16,
  },
  dayOrderText: { fontSize: 14, fontWeight: "700", color: Colors.AppOnBackground },
  dateText: { fontSize: 14, fontWeight: "700", color: Colors.AppOnBackground },

  subjectHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.AppOnBackground,
    marginBottom: 16,
  },

  // Actions Bar
  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  toolCol: {
    alignItems: "center",
    gap: 4,
  },
  toolLabel: { fontSize: 10, fontWeight: "600", color: "#64748B" },
  dropdownTrigger: {
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
  dropdownValue: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary },
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
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  toggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: Colors.BluePrimary,
  },
  deleteBtn: {
    backgroundColor: "#FFF5F5",
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  // Student Section Listing
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  sectionHeaderText: { fontSize: 13, fontWeight: "800", color: "#475569" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  gridItemText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },

  listContainer: { gap: 8 },
  studentListCard: { padding: 10 },
  studentListRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  studentListLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listAvatarText: { fontSize: 12, fontWeight: "800" },
  studentListName: { fontSize: 13, fontWeight: "700", color: Colors.AppOnBackground },
  studentListRoll: { fontSize: 11, color: "#64748B", marginTop: 1 },
  listBtnGroup: { flexDirection: "row", gap: 5 },
  listStatBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  listStatBtnText: { fontSize: 10, fontWeight: "800" },

  // Summary Counters Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 16,
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
  statLabelText: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 2 },
  statNumber: { fontSize: 20, fontWeight: "900" },

  // Lesson Topic Card
  infoCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardInfoLabel: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  cardInfoValue: { fontSize: 13, fontWeight: "700", color: Colors.AppOnBackground, lineHeight: 18 },

  // Marked By Card
  markedByCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  markedByLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 10 },
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
  facultyAvatarText: { fontSize: 12, fontWeight: "800", color: "#64748B" },
  facultyName: { fontSize: 13, fontWeight: "800", color: Colors.AppOnBackground },
  facultyDept: { fontSize: 11, color: "#64748B", marginTop: 1 },
  viewReportText: { fontSize: 12, fontWeight: "700", color: Colors.BluePrimary },

  // Modals Styles
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  pickerDismiss: { flex: 1 },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "85%",
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
  pickerTitle: { fontSize: 16, fontWeight: "800", color: Colors.AppOnBackground },
  pickerCloseBtn: { padding: 4 },
  modalScrollContent: { padding: 20, gap: 16 },

  formGroup: { gap: 6, width: "100%" },
  formLabel: { fontSize: 13, fontWeight: "700", color: Colors.AppOnSurfaceVariant },
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

  hourItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  hourItemActive: { backgroundColor: Colors.BluePrimary + "0D" },
  hourItemText: { fontSize: 14, fontWeight: "600", color: Colors.AppOnBackground },
  hourItemTextActive: { color: Colors.BluePrimary, fontWeight: "800" },

  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  successModal: {
    backgroundColor: Colors.AppSurface,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "80%",
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: { fontSize: 20, fontWeight: "900", color: Colors.AppOnBackground, marginBottom: 8 },
  successMsg: { fontSize: 14, color: Colors.AppOnSurfaceVariant, textAlign: "center", lineHeight: 20 },
  doneBtn: {
    marginTop: 20,
    backgroundColor: Colors.BluePrimary,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
