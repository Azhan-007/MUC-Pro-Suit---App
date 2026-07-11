import React from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, Modal, Platform, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, X, ChevronDown, Check } from "lucide-react-native";
import { Colors } from "../../theme";
import { useCampusAlert } from "../../components";

type ActionType = "BATCH" | "DEPT" | "CAMPUS" | "CLUB" | "INDIVIDUAL" | null;

const ACADEMIC_YEARS = ["2026-27", "2025-26", "2024-25"];
const SHIFTS = ["Shift I", "Shift II", "Girls"];
const BATCHES = ["I B.Sc CS", "II B.Sc CS", "III B.Sc CS", "III BCA"];
const DEPARTMENTS = ["Computer Science", "BCA", "Mathematics", "English", "Physics"];
const CLUBS = ["Rotaract Club", "NSS", "Red Cross", "Fine Arts", "Sports Club"];

export function FacultyEventODScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  // ── State ──
  const [activeAction, setActiveAction] = React.useState<ActionType>(null);
  
  // Picker visibility states
  const [showYearPicker, setShowYearPicker] = React.useState(false);
  const [showShiftPicker, setShowShiftPicker] = React.useState(false);
  const [showBatchPicker, setShowBatchPicker] = React.useState(false);
  const [showDeptPicker, setShowDeptPicker] = React.useState(false);
  const [showClubPicker, setShowClubPicker] = React.useState(false);

  // Form input fields
  const [selectedYear, setSelectedYear] = React.useState("2026-27");
  const [selectedShift, setSelectedShift] = React.useState("Shift I");
  const [selectedBatch, setSelectedBatch] = React.useState("III B.Sc CS");
  const [selectedDept, setSelectedDept] = React.useState("Computer Science");
  const [selectedClub, setSelectedClub] = React.useState("Rotaract Club");
  
  const [eventName, setEventName] = React.useState("");
  const [regNumbers, setRegNumbers] = React.useState("");
  const [singleReg, setSingleReg] = React.useState("");

  const handleResetForm = () => {
    setEventName("");
    setRegNumbers("");
    setSingleReg("");
  };

  const handleSubmit = (type: string) => {
    if (type === "INDIVIDUAL") {
      if (!singleReg.trim()) {
        showAlert("Input Required", "Please enter the student's register number.");
        return;
      }
      if (!eventName.trim()) {
        showAlert("Input Required", "Please enter the event or activity name.");
        return;
      }
      showAlert(
        "OD Attendance Marked",
        `Successfully marked On-Duty Attendance for Student ${singleReg.trim().toUpperCase()} for event "${eventName.trim()}"`
      );
    } else {
      if (!eventName.trim()) {
        showAlert("Input Required", "Please enter the event or activity name.");
        return;
      }
      if (!regNumbers.trim()) {
        showAlert("Input Required", "Please enter the register numbers.");
        return;
      }
      const count = regNumbers.split(",").filter(r => r.trim().length > 0).length;
      showAlert(
        "Event Attendance Submitted",
        `Successfully marked On-Duty Attendance for ${count} students under event "${eventName.trim()}".`
      );
    }
    handleResetForm();
    setActiveAction(null);
  };

  const listItems = [
    { key: "BATCH" as const, title: "Batch Wise Event Attendance" },
    { key: "DEPT" as const, title: "Department Wise Event Attendance" },
    { key: "CAMPUS" as const, title: "Campus Attendance" },
    { key: "CLUB" as const, title: "Club wise Attendance" },
    { key: "INDIVIDUAL" as const, title: "Individual Attendance" },
  ];

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Event/OD</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Menu List ── */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuCard}>
          {listItems.map((item, idx) => (
            <View key={item.key}>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => { handleResetForm(); setActiveAction(item.key); }}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
                <ChevronRight size={16} color="#94A3B8" />
              </Pressable>
              {idx < listItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── 1. Batch Wise Attendance Modal ── */}
      <Modal visible={activeAction === "BATCH"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveAction(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Batch Wise Event Attendance</Text>
              <Pressable onPress={() => setActiveAction(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Academic Year</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowYearPicker(true)}>
                <Text style={styles.dropdownText}>{selectedYear}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Shift</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowShiftPicker(true)}>
                <Text style={styles.dropdownText}>{selectedShift}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Select Batch</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowBatchPicker(true)}>
                <Text style={styles.dropdownText}>{selectedBatch}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Event / Activity Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Annual Hackathon 2026"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={setEventName}
              />

              <Text style={styles.formLabel}>Student Register Numbers (comma separated)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. 23BCS01, 23BCS04, 23BCS15"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={regNumbers}
                onChangeText={setRegNumbers}
              />

              <Pressable style={styles.submitBtn} onPress={() => handleSubmit("BATCH")}>
                <Text style={styles.submitBtnTxt}>Mark Attendance</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 2. Department Wise Attendance Modal ── */}
      <Modal visible={activeAction === "DEPT"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveAction(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dept Wise Event Attendance</Text>
              <Pressable onPress={() => setActiveAction(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Academic Year</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowYearPicker(true)}>
                <Text style={styles.dropdownText}>{selectedYear}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Shift</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowShiftPicker(true)}>
                <Text style={styles.dropdownText}>{selectedShift}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Department</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowDeptPicker(true)}>
                <Text style={styles.dropdownText}>{selectedDept}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Event / Activity Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Science Day Expo"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={setEventName}
              />

              <Text style={styles.formLabel}>Student Register Numbers (comma separated)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. 23BMA02, 23BMA08"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={regNumbers}
                onChangeText={setRegNumbers}
              />

              <Pressable style={styles.submitBtn} onPress={() => handleSubmit("DEPT")}>
                <Text style={styles.submitBtnTxt}>Mark Attendance</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 3. Campus Attendance Modal ── */}
      <Modal visible={activeAction === "CAMPUS"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveAction(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Campus Event Attendance</Text>
              <Pressable onPress={() => setActiveAction(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Event / Activity Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Independence Day Parade"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={setEventName}
              />

              <Text style={styles.formLabel}>Student Register Numbers (comma separated)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. 23BCS01, 23BCA22, 23BMA45"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={regNumbers}
                onChangeText={setRegNumbers}
              />

              <Pressable style={styles.submitBtn} onPress={() => handleSubmit("CAMPUS")}>
                <Text style={styles.submitBtnTxt}>Mark Attendance</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 4. Club Wise Attendance Modal ── */}
      <Modal visible={activeAction === "CLUB"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveAction(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Club Wise Event Attendance</Text>
              <Pressable onPress={() => setActiveAction(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Select Club</Text>
              <Pressable style={styles.dropdownTrigger} onPress={() => setShowClubPicker(true)}>
                <Text style={styles.dropdownText}>{selectedClub}</Text>
                <ChevronDown size={14} color={Colors.BluePrimary} />
              </Pressable>

              <Text style={styles.formLabel}>Event / Activity Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Blood Donation Camp"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={setEventName}
              />

              <Text style={styles.formLabel}>Student Register Numbers (comma separated)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. 23BCS05, 23BCS18"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={regNumbers}
                onChangeText={setRegNumbers}
              />

              <Pressable style={styles.submitBtn} onPress={() => handleSubmit("CLUB")}>
                <Text style={styles.submitBtnTxt}>Mark Attendance</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 5. Individual Attendance Modal ── */}
      <Modal visible={activeAction === "INDIVIDUAL"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveAction(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Individual OD Attendance</Text>
              <Pressable onPress={() => setActiveAction(null)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Student Register Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 23BCS01"
                placeholderTextColor="#94A3B8"
                value={singleReg}
                onChangeText={setSingleReg}
                autoCapitalize="characters"
              />

              <Text style={styles.formLabel}>Event / Activity Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. National Symposium Presenter"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={setEventName}
              />

              <Pressable style={styles.submitBtn} onPress={() => handleSubmit("INDIVIDUAL")}>
                <Text style={styles.submitBtnTxt}>Mark Individual OD</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 6. Academic Year Bottom Sheet Picker ── */}
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
              {ACADEMIC_YEARS.map((yr) => {
                const active = selectedYear === yr;
                return (
                  <Pressable
                    key={yr}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedYear(yr); setShowYearPicker(false); }}
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

      {/* ── 7. Shift Bottom Sheet Picker ── */}
      <Modal visible={showShiftPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowShiftPicker(false)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Shift</Text>
              <Pressable onPress={() => setShowShiftPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {SHIFTS.map((sh) => {
                const active = selectedShift === sh;
                return (
                  <Pressable
                    key={sh}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedShift(sh); setShowShiftPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>{sh}</Text>
                    {active && <Check size={16} color={Colors.BluePrimary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 8. Batch Bottom Sheet Picker ── */}
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
                const active = selectedBatch === b;
                return (
                  <Pressable
                    key={b}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedBatch(b); setShowBatchPicker(false); }}
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

      {/* ── 9. Dept Bottom Sheet Picker ── */}
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
                const active = selectedDept === dept;
                return (
                  <Pressable
                    key={dept}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedDept(dept); setShowDeptPicker(false); }}
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

      {/* ── 10. Club Bottom Sheet Picker ── */}
      <Modal visible={showClubPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => setShowClubPicker(false)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Club</Text>
              <Pressable onPress={() => setShowClubPicker(false)} style={styles.pickerCloseBtn}>
                <X size={20} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {CLUBS.map((c) => {
                const active = selectedClub === c;
                return (
                  <Pressable
                    key={c}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedClub(c); setShowClubPicker(false); }}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },

  // Menu List
  scrollContent: { padding: 16 },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  menuItemPressed: { backgroundColor: "#F8FAFC" },
  menuItemText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  divider: { height: 1, backgroundColor: "#E2E8F0" },

  // Modal sheets
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
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

  // Form elements
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
  textArea: {
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 12, paddingTop: 10, fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 16,
    textAlignVertical: "top",
  },
  submitBtn: {
    width: "100%", paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.BluePrimary, alignItems: "center", marginTop: 8,
  },
  submitBtnTxt: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },

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
});
