import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader, CampusCard, StatusChip, SectionHeader } from '../../components';
import { Colors } from '../../theme';
import {
  BookOpen,
  Calendar,
  Clock,
  Barcode,
  MapPin,
  AlertCircle,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react-native';

type LibraryTab = 'TRACKER' | 'ATTENDANCE';

interface IssuedBook {
  id: string;
  title: string;
  author: string;
  barcode: string;
  issueDate: string;
  dueDate: string;
  status: 'ISSUED' | 'OVERDUE' | 'RETURNED';
  fine: number;
  location: string;
  returnedDate?: string;
}

interface VisitLog {
  id: string;
  date: string;
  inTime: string;
  outTime: string;
  duration: string;
}

const mockIssuedBooks: IssuedBook[] = [
  {
    id: 'b1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    barcode: 'ACC-90481',
    issueDate: '15 Jun 2026',
    dueDate: '15 Jul 2026',
    status: 'ISSUED',
    fine: 0,
    location: 'CS Wing - Rack A, Shelf 2',
  },
  {
    id: 'b2',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    barcode: 'ACC-78921',
    issueDate: '10 Jun 2026',
    dueDate: '25 Jun 2026',
    status: 'OVERDUE',
    fine: 90, // ₹10 per day overdue fine
    location: 'IT Wing - Rack C, Shelf 4',
  },
  {
    id: 'b3',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    barcode: 'ACC-61023',
    issueDate: '12 May 2026',
    dueDate: '27 May 2026',
    status: 'RETURNED',
    fine: 0,
    location: 'CN Wing - Rack B, Shelf 1',
    returnedDate: '26 May 2026',
  },
];

const mockVisitLogs: VisitLog[] = [
  { id: '1', date: '03 Jul 2026', inTime: '10:15 AM', outTime: '12:30 PM', duration: '2h 15m' },
  { id: '2', date: '01 Jul 2026', inTime: '02:00 PM', outTime: '05:45 PM', duration: '3h 45m' },
  { id: '3', date: '29 Jun 2026', inTime: '09:00 AM', outTime: '11:15 AM', duration: '2h 15m' },
  { id: '4', date: '26 Jun 2026', inTime: '04:30 PM', outTime: '07:00 PM', duration: '2h 30m' },
  { id: '5', date: '24 Jun 2026', inTime: '11:00 AM', outTime: '01:30 PM', duration: '2h 30m' },
  { id: '6', date: '22 Jun 2026', inTime: '01:15 PM', outTime: '03:30 PM', duration: '2h 15m' },
];

export const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('TRACKER');
  const [selectedBook, setSelectedBook] = useState<IssuedBook | null>(null);

  // Filter book states
  const activeIssues = mockIssuedBooks.filter((b) => b.status !== 'RETURNED');
  const pastIssues = mockIssuedBooks.filter((b) => b.status === 'RETURNED');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Library Passport" />

      {/* Segmented Tab Headers */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'TRACKER' && styles.tabBtnActive]}
          onPress={() => setActiveTab('TRACKER')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'TRACKER' && styles.tabBtnTextActive]}>
            Book Tracker
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'ATTENDANCE' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ATTENDANCE')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ATTENDANCE' && styles.tabBtnTextActive]}>
            Visit Logs & Stats
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'TRACKER' ? (
          /* ── BOOK TRACKER TAB ── */
          <View>
            {/* Library Card Summary */}
            <CampusCard style={[styles.card, styles.librarySummaryCard]} borderColor={Colors.AppOutline} elevation="sm">
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />

              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.libraryLabel}>OFFLINE LIBRARY PASS</Text>
                  <Text style={styles.libraryCardId}>MUC-LIB-710</Text>
                </View>
                <View style={styles.badgeClear}>
                  <BadgeCheck size={18} color="#10B981" />
                  <Text style={styles.badgeClearText}>Active Account</Text>
                </View>
              </View>

              <View style={styles.libraryStatsGrid}>
                <View style={styles.statCol}>
                  <Text style={styles.statValue}>{activeIssues.length}</Text>
                  <Text style={styles.statLabel}>Issued Books</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    ₹{mockIssuedBooks.reduce((sum, b) => sum + b.fine, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Accumulated Fine</Text>
                </View>
              </View>
            </CampusCard>

            {/* Active Issued Books */}
            <SectionHeader title="Currently Borrowed" />
            {activeIssues.length === 0 ? (
              <View style={styles.emptyContainer}>
                <BookOpen size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>No books issued currently.</Text>
              </View>
            ) : (
              activeIssues.map((book) => {
                const isOverdue = book.status === 'OVERDUE';
                return (
                  <CampusCard key={book.id} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                    <Pressable style={styles.bookPressable} onPress={() => setSelectedBook(book)}>
                      <View style={styles.bookMainRow}>
                        <View style={[styles.bookIconContainer, { backgroundColor: isOverdue ? '#FEF2F2' : '#F0F9FF' }]}>
                          <BookOpen size={20} color={isOverdue ? '#EF4444' : Colors.BluePrimary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                          <Text style={styles.bookAuthor}>by {book.author}</Text>
                          <View style={styles.metadataRow}>
                            <Barcode size={12} color="#64748B" />
                            <Text style={styles.metadataText}>{book.barcode}</Text>
                          </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" style={{ alignSelf: 'center' }} />
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.bookBottomRow}>
                        <View style={{ gap: 2 }}>
                          <Text style={styles.dateLabelText}>Due Date</Text>
                          <Text style={[styles.dateValText, isOverdue && { color: '#EF4444' }]}>{book.dueDate}</Text>
                        </View>

                        <StatusChip
                          text={isOverdue ? `Overdue • Fine ₹${book.fine}` : 'Issued'}
                          level={isOverdue ? 'ERROR' : 'LIBRARY'}
                        />
                      </View>
                    </Pressable>
                  </CampusCard>
                );
              })
            )}

            {/* Past Issues History */}
            <SectionHeader title="Past Checkout History" />
            {pastIssues.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No checkout history records found.</Text>
              </View>
            ) : (
              pastIssues.map((book) => (
                <CampusCard key={book.id} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <Pressable style={styles.bookPressable} onPress={() => setSelectedBook(book)}>
                    <View style={styles.bookMainRow}>
                      <View style={[styles.bookIconContainer, { backgroundColor: '#F1F5F9' }]}>
                        <BookOpen size={20} color="#64748B" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.bookAuthor}>by {book.author}</Text>
                        <Text style={styles.historyReturnedText}>Returned on {book.returnedDate}</Text>
                      </View>
                      <ChevronRight size={16} color="#94A3B8" style={{ alignSelf: 'center' }} />
                    </View>
                  </Pressable>
                </CampusCard>
              ))
            )}
          </View>
        ) : (
          /* ── VISIT ATTENDANCE TAB ── */
          <View>
            {/* Visit Stats header */}
            <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
              <View style={styles.statsCardGrid}>
                <View style={styles.statsGridCol}>
                  <View style={[styles.statsIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <TrendingUp size={18} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.statsNumText}>{mockVisitLogs.length} Visits</Text>
                    <Text style={styles.statsSubText}>This Month</Text>
                  </View>
                </View>
                <View style={styles.gridVertDivider} />
                <View style={styles.statsGridCol}>
                  <View style={[styles.statsIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Clock size={18} color={Colors.BluePrimary} />
                  </View>
                  <View>
                    <Text style={styles.statsNumText}>15.5 Hours</Text>
                    <Text style={styles.statsSubText}>Cumulative Spent</Text>
                  </View>
                </View>
              </View>
            </CampusCard>

            <SectionHeader title="Gate Visit logs (Scans)" />
            {mockVisitLogs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No visit scan logs found.</Text>
              </View>
            ) : (
              mockVisitLogs.map((log) => (
                <CampusCard key={log.id} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <View style={styles.visitRow}>
                    <View style={styles.visitLeft}>
                      <View style={styles.visitIndicatorBar} />
                      <View>
                        <Text style={styles.visitDate}>{log.date}</Text>
                        <View style={styles.visitTimeRow}>
                          <Clock size={12} color="#64748B" />
                          <Text style={styles.visitTimeText}>{log.inTime} - {log.outTime}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.visitRight}>
                      <Text style={styles.durationValueText}>{log.duration}</Text>
                      <Text style={styles.durationLabelText}>Time Spent</Text>
                    </View>
                  </View>
                </CampusCard>
              ))
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── BOOK CHECKOUT DETAIL SHEET MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedBook !== null}
        onRequestClose={() => setSelectedBook(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalIconBox, { backgroundColor: selectedBook?.status === 'OVERDUE' ? '#FEF2F2' : '#F0F9FF' }]}>
                <BookOpen size={26} color={selectedBook?.status === 'OVERDUE' ? '#EF4444' : Colors.BluePrimary} />
              </View>
              
              <Text style={styles.modalTitle}>Book Checkout Details</Text>
              <Text style={styles.modalSubtitle}>{selectedBook?.title}</Text>

              <View style={styles.detailsSheet}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Book Name</Text>
                  <View style={styles.detailsValContainer}>
                    <Text style={styles.detailsVal}>{selectedBook?.title}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Book Number</Text>
                  <View style={styles.detailsValContainer}>
                    <Barcode size={13} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.detailsVal}>{selectedBook?.barcode}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Author</Text>
                  <View style={styles.detailsValContainer}>
                    <Text style={styles.detailsVal}>{selectedBook?.author}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>D.O. Issue</Text>
                  <View style={styles.detailsValContainer}>
                    <Text style={styles.detailsVal}>{selectedBook?.issueDate}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Due Date</Text>
                  <View style={styles.detailsValContainer}>
                    <Text style={[styles.detailsVal, selectedBook?.status === 'OVERDUE' && { color: '#EF4444', fontWeight: '800' }]}>{selectedBook?.dueDate}</Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary, { width: '100%', flex: 0 }]}
                onPress={() => setSelectedBook(null)}
              >
                <Text style={styles.portalBtnTextPrimary}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9', // Slate-100
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  tabBtnTextActive: {
    color: Colors.BluePrimary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  card: { marginBottom: 16 },

  // Library summary card
  librarySummaryCard: {
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  decorCircle2: {
    position: 'absolute',
    left: -50,
    bottom: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  libraryLabel: { fontSize: 10, fontWeight: '700', color: Colors.AppOnSurfaceVariant, letterSpacing: 0.8 },
  libraryCardId: { fontSize: 24, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  badgeClear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  badgeClearText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  libraryStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.AppOutline,
    paddingTop: 16,
  },
  statCol: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.AppOnBackground },
  statLabel: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.AppOutline },

  // Book card styles
  bookPressable: { padding: 14 },
  bookMainRow: { flexDirection: 'row', gap: 12 },
  bookIconContainer: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bookTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  bookAuthor: { fontSize: 12, color: Colors.AppOnSurfaceVariant, marginTop: 2, fontWeight: '500' },
  metadataRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metadataText: { fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 0.5 },
  cardDivider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  bookBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabelText: { fontSize: 10, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  dateValText: { fontSize: 12, color: Colors.AppOnBackground, fontWeight: '700', marginTop: 2 },
  historyReturnedText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 4 },

  // Attendance stats grid
  statsCardGrid: { flexDirection: 'row', paddingVertical: 14 },
  statsGridCol: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' },
  statsIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statsNumText: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground },
  statsSubText: { fontSize: 10, color: Colors.AppOnSurfaceVariant, fontWeight: '600', marginTop: 2 },
  gridVertDivider: { width: 1, backgroundColor: Colors.AppOutline },

  // Visit logs styles
  visitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  visitLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  visitIndicatorBar: { width: 4, height: 32, borderRadius: 2, backgroundColor: Colors.BluePrimary },
  visitDate: { fontSize: 14, fontWeight: '800', color: Colors.AppOnBackground },
  visitTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  visitTimeText: { fontSize: 11, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  visitRight: { alignItems: 'flex-end' },
  durationValueText: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground },
  durationLabelText: { fontSize: 10, color: Colors.AppOnSurfaceVariant, fontWeight: '600', marginTop: 2 },

  // Modals overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.BluePrimary, marginBottom: 16, textAlign: 'center' },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  // Details sheet inside Modal
  detailsSheet: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 8,
    gap: 12,
  },
  detailsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flexShrink: 0,
    width: '40%',
  },
  detailsValContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  detailsVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },
  detailsTotalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  guidelinesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginTop: 14,
  },
  guidelinesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  guidelinesTitle: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  guidelinesText: { fontSize: 10, color: '#D97706', lineHeight: 15 },
  modalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, fontWeight: '600', textAlign: 'center' },
});
