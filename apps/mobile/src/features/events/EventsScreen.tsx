import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader, CampusCard, StatusChip, SectionHeader } from '../../components';
import { Colors } from '../../theme';
import { mockCollegeEvents } from '../../data/mockData';
import { CollegeEvent } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Ticket,
  ChevronRight,
  Sparkles,
  BadgeCheck,
} from 'lucide-react-native';

const CATEGORIES: Array<{ label: string; value: CollegeEvent['category'] | 'ALL' }> = [
  { label: 'All Events', value: 'ALL' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Sports', value: 'SPORTS' },
];

export const EventsScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CollegeEvent['category'] | 'ALL'>('ALL');
  const [events, setEvents] = useState<CollegeEvent[]>(mockCollegeEvents);
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  
  // Ticket booking process loader
  const [bookingState, setBookingState] = useState<'IDLE' | 'CHECKING_SEATS' | 'GENERATING_PASS' | 'SENDING_EMAIL' | 'SUCCESS'>('IDLE');

  const filteredEvents = activeCategory === 'ALL'
    ? events
    : events.filter((e) => e.category === activeCategory);

  const handleBookingProcess = (id: string) => {
    setBookingState('CHECKING_SEATS');
    
    setTimeout(() => {
      setBookingState('GENERATING_PASS');
      setTimeout(() => {
        setBookingState('SENDING_EMAIL');
        setTimeout(() => {
          setEvents((prev) =>
            prev.map((e) => (e.id === id ? { ...e, isRegistered: true } : e))
          );
          
          // Update selectedEvent inside active modal
          setSelectedEvent((prev) => prev && prev.id === id ? { ...prev, isRegistered: true } : prev);
          
          setBookingState('SUCCESS');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const getCategoryColor = (category: CollegeEvent['category']) => {
    switch (category) {
      case 'TECHNICAL':
        return 'ACADEMIC';
      case 'CULTURAL':
        return 'WARNING';
      case 'SPORTS':
      default:
        return 'LIBRARY';
    }
  };

  const getCategoryLabel = (category: CollegeEvent['category']) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="College Events" />

      {/* Categories chips selector */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((c) => {
            const active = activeCategory === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => setActiveCategory(c.value)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main lists */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* LIGHT FEATURED EVENT BANNER */}
        {activeCategory === 'ALL' && (
          <CampusCard style={[styles.card, styles.featuredCard]} borderColor={Colors.AppOutline} elevation="sm">
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.featuredHeader}>
              <View style={styles.featuredBadge}>
                <Sparkles size={11} color={Colors.BluePrimary} style={{ marginRight: 4 }} />
                <Text style={styles.featuredBadgeText}>FEATURED EVENT</Text>
              </View>
              <Ticket size={22} color={Colors.BluePrimary} />
            </View>

            <Text style={styles.featuredTitle}>MUC FEST '26</Text>
            <Text style={styles.featuredDesc}>
              Mazharul Uloom Annual Inter-Collegiate Cultural Festival. Host to multiple design workshops, gaming arenas, and live music.
            </Text>

            <View style={styles.dashDivider}>
              <View style={styles.dashLine} />
            </View>

            <View style={styles.featuredFooterRow}>
              <View style={styles.featuredMetaCol}>
                <Text style={styles.featuredMetaTitle}>Date & Venue</Text>
                <Text style={styles.featuredMetaValue}>Nov 12 • Main Grounds</Text>
              </View>
              
              <Pressable
                style={[styles.featuredActionBtn, { backgroundColor: Colors.BluePrimary }]}
                onPress={() => setSelectedEvent(events.find(e => e.id === 'EVT-102') || null)}
              >
                <Text style={styles.featuredActionBtnText}>View Details</Text>
              </Pressable>
            </View>
          </CampusCard>
        )}

        {/* Regular Events Section */}
        <SectionHeader title="Upcoming Activities" />

        {filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={36} color="#94A3B8" />
            <Text style={styles.emptyText}>No events found in this category.</Text>
          </View>
        ) : (
          filteredEvents.map((evt) => {
            const isRegistered = evt.isRegistered;
            return (
              <CampusCard key={evt.id} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                <Pressable style={styles.eventPressable} onPress={() => setSelectedEvent(evt)}>
                  <View style={styles.cardHeader}>
                    <StatusChip text={getCategoryLabel(evt.category)} level={getCategoryColor(evt.category)} />
                    {isRegistered && (
                      <View style={styles.registeredBadge}>
                        <BadgeCheck size={12} color="#10B981" />
                        <Text style={styles.registeredBadgeText}>Registered</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.eventTitle}>{evt.title}</Text>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaRow}>
                      <Calendar size={13} color="#64748B" />
                      <Text style={styles.metaText}>{evt.dateText} • {evt.timeText}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <MapPin size={13} color="#64748B" />
                      <Text style={styles.metaText}>Venue: {evt.venue}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.actionRow}>
                    <Text style={styles.ticketAvailabilityText}>
                      {isRegistered ? 'Seat Reserved' : 'Seats Available'}
                    </Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                </Pressable>
              </CampusCard>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── DIGITAL TICKET DETAILS SHEET MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedEvent !== null}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedEvent && (
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.modalIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Calendar size={26} color={Colors.BluePrimary} />
                </View>

                <Text style={styles.portalTitle}>Event Details</Text>
                <Text style={styles.portalSubtitle}>{selectedEvent.title}</Text>

                {/* Event Details info box */}
                <View style={styles.detailsSheet}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Event Title</Text>
                    <Text style={styles.detailsVal}>{selectedEvent.title}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Category</Text>
                    <Text style={styles.detailsVal}>{getCategoryLabel(selectedEvent.category)}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Date & Time</Text>
                    <Text style={styles.detailsVal}>{selectedEvent.dateText} at {selectedEvent.timeText}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Venue Location</Text>
                    <Text style={styles.detailsVal}>{selectedEvent.venue}</Text>
                  </View>
                </View>

                {/* Description block */}
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionTitle}>About Event</Text>
                  <Text style={styles.descriptionText}>
                    Join us for {selectedEvent.title}, a premier {selectedEvent.category.toLowerCase()} campus activity organized by Mazharul Uloom College. Secure your seat by registering today.
                  </Text>
                </View>

                {/* CTAs */}
                <View style={{ gap: 10, width: '100%', marginTop: 14 }}>
                  {!selectedEvent.isRegistered ? (
                    <Pressable
                      style={[styles.portalBtn, styles.portalBtnPrimary]}
                      onPress={() => handleBookingProcess(selectedEvent.id)}
                    >
                      <Text style={styles.portalBtnTextPrimary}>Register for Event</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.registeredConfirmationBox}>
                      <BadgeCheck size={16} color="#10B981" />
                      <Text style={styles.registeredConfirmationText}>
                        You are successfully registered for this event.
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={[styles.portalBtn, { backgroundColor: '#F1F5F9' }]}
                    onPress={() => setSelectedEvent(null)}
                  >
                    <Text style={[styles.portalBtnTextPrimary, { color: '#475569' }]}>Close Details</Text>
                  </Pressable>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── REGISTRATION BOOKING PROGRESS LOADER ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={bookingState !== 'IDLE'}
        onRequestClose={() => setBookingState('IDLE')}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {bookingState !== 'SUCCESS' ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.progressTitle}>Processing Registration</Text>
                <Text style={styles.progressMessage}>Securing your slot and updating college event records...</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <CheckCircle size={30} color="#10B981" />
                </View>
                <Text style={styles.progressTitle}>Registration Successful!</Text>
                <Text style={styles.progressMessage}>
                  Your slot has been reserved. We look forward to seeing you at the event.
                </Text>
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                  onPress={() => {
                    setBookingState('IDLE');
                    setSelectedEvent(null); // Close the detail sheet too
                  }}
                >
                  <Text style={styles.portalBtnTextPrimary}>Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  categoryContainer: { borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingVertical: 10 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
  categoryChipActive: { backgroundColor: Colors.BluePrimary, borderColor: Colors.BluePrimary },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  categoryLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  card: { marginBottom: 16 },

  // Light-themed Featured Card
  featuredCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
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
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.BluePrimary, letterSpacing: 0.5 },
  featuredTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 4 },
  featuredDesc: { fontSize: 13, color: '#64748B', marginTop: 8, lineHeight: 18, fontWeight: '500' },
  dashDivider: { height: 10, justifyContent: 'center', marginVertical: 12 },
  dashLine: { height: 1, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' },
  featuredFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredMetaCol: { gap: 2 },
  featuredMetaTitle: { fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  featuredMetaValue: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  featuredActionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  featuredActionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Regular items styles
  eventPressable: { padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  registeredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  registeredBadgeText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  eventTitle: { fontSize: 15, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 10 },
  metaGrid: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketAvailabilityText: { fontSize: 12, fontWeight: '600', color: Colors.AppOnSurfaceVariant },

  // Modals overlays
  portalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  portalContent: {
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
  portalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  portalSubtitle: { fontSize: 13, fontWeight: '600', color: Colors.BluePrimary, marginBottom: 16, textAlign: 'center' },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  // Description card inside details
  descriptionBox: {
    width: '100%',
    backgroundColor: '#F1F5F9', // Slate-100
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  registeredConfirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    marginVertical: 4,
  },
  registeredConfirmationText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },

  // Details sheet inside Modal
  detailsSheet: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 5,
    gap: 12,
  },
  detailsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flexShrink: 0,
    width: '35%',
  },
  detailsVal: {
    flex: 1,
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },

  // CTAs
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Progress loader
  progressTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  progressMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, fontWeight: '600', textAlign: 'center' },
});
