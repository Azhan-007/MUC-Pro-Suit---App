import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  Calendar,
  X,
  Plus,
  CheckCircle,
} from "lucide-react-native";
import { Colors } from "../../theme";
import { useCampusAlert } from "../../components";

interface SubSectionItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  actionKey: "SUBSTITUTION" | "ENGAGE" | "OD" | "LETOFF";
  route?: string;
}

export const FacultyOtherAttendanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useCampusAlert();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : (insets.top || 44);

  // Modal controls
  const [activeModal, setActiveModal] = React.useState<SubSectionItem["actionKey"] | null>(null);

  // --- Modal Form States ---



  // 3. Event / OD Attendance
  const [odEvent, setOdEvent] = React.useState("Inter-Collegiate Hackathon");
  const [odClass, setOdClass] = React.useState("III B.Sc CS");
  const [odRegNumbers, setOdRegNumbers] = React.useState("");

  const handleMarkOdAttendance = () => {
    if (!odRegNumbers.trim()) {
      showAlert("Error", "Please provide student register numbers.");
      return;
    }
    showAlert("Success", `On-Duty Attendance marked for selected students in ${odClass} for ${odEvent}.`);
    setOdRegNumbers("");
    setActiveModal(null);
  };

  const listItems: SubSectionItem[] = [
    {
      title: "Event / OD Attendance",
      subtitle: "Mark Batch, Department, Campus Attendance",
      icon: <Calendar size={20} color={Colors.BluePrimary} />,
      route: "/faculty/event-od",
      actionKey: "OD",
    },
    {
      title: "Substitution",
      subtitle: "Manage Attendance Substitutions",
      icon: <Users size={20} color={Colors.BluePrimary} />,
      route: "/faculty/substitution",
      actionKey: "SUBSTITUTION",
    },
    {
      title: "Engage Attendance",
      subtitle: "Mark Engage Attendance",
      icon: <User size={20} color={Colors.BluePrimary} />,
      route: "/faculty/engage-attendance",
      actionKey: "ENGAGE",
    },
    {
      title: "Let off / Class cancel",
      subtitle: "Manage Let off/Class cancellation",
      icon: <User size={20} color={Colors.BluePrimary} />,
      route: "/faculty/class-cancel",
      actionKey: "LETOFF",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Other Attendance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Attendance Services</Text>
        
        <View style={styles.cardContainer}>
          {listItems.map((item, idx) => (
            <View key={idx}>
              <Pressable
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.listItemPressed,
                ]}
                onPress={() => item.route ? router.push(item.route as any) : setActiveModal(item.actionKey)}
              >
                <View style={styles.iconBox}>
                  {item.icon}
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </Pressable>
              {idx < listItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>







      {/* ──── 4. LET OFF / CLASS CANCEL MODAL ──── */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  listItemPressed: {
    backgroundColor: "#F1F5F9",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 68,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    gap: 16,
  },
  helperText: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 4,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#1E293B",
  },
  textInputArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    color: "#1E293B",
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: Colors.BluePrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Modal History
  historyHeading: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTextBold: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  historySub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
});
