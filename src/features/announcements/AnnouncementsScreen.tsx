import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, StatusChip, PageHeader } from '../../components';
import { Colors } from '../../theme';
import { Paperclip, ChevronRight } from 'lucide-react-native';
import { AnnouncementCategory } from '../../types';

const FILTERS: Array<{ label: string; value: AnnouncementCategory | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Exams', value: 'EXAMS' },
  { label: 'Placements', value: 'PLACEMENTS' },
  { label: 'Scholarships', value: 'SCHOLARSHIPS' },
  { label: 'Library', value: 'LIBRARY' },
];

const POSTER_MAP: Record<string, any> = {
  exams_poster: require('../../../assets/campus_banner.png'),
  placements_poster: require('../../../assets/library_banner.jpg'),
};

export const AnnouncementsScreen: React.FC = () => {
  const router = useRouter();
  const { announcements } = useCampusStore();
  const [activeFilter, setActiveFilter] = useState<AnnouncementCategory | 'ALL'>('ALL');

  const filtered =
    activeFilter === 'ALL'
      ? announcements
      : announcements.filter((a) => a.category === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PageHeader title="Circulars" />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => {
          const active = f.value === activeFilter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={[styles.filterChip, active && styles.activeFilterChip]}
            >
              <Text style={[styles.filterLabel, active && styles.activeFilterLabel]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((ann) => (
          <CampusCard
            key={ann.id}
            borderColor={ann.isImportant ? Colors.BluePrimary : Colors.AppOutline}
            style={styles.annCard}
            elevation="sm"
            onPress={() => {}}
          >
            {/* Header row */}
            <View style={styles.annHeader}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{ann.initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.chipRow}>
                  <StatusChip text={ann.category} level={ann.category} />
                  {ann.isImportant && (
                    <Text style={styles.importantBadge}> • IMPORTANT</Text>
                  )}
                </View>
                <Text style={styles.authorText}>{ann.author}</Text>
              </View>
              <Text style={styles.dateText}>{ann.dateText}</Text>
            </View>

            {/* Poster Image */}
            {ann.imageKey && POSTER_MAP[ann.imageKey] && (
              <Image
                source={POSTER_MAP[ann.imageKey]}
                style={styles.posterImage}
                resizeMode="cover"
              />
            )}

            {/* Title & summary */}
            <Text style={styles.annTitle} numberOfLines={2}>{ann.title}</Text>
            <Text style={styles.annSummary} numberOfLines={3}>{ann.summary}</Text>

            {/* Attachment */}
            {ann.attachmentName && (
              <View style={styles.attachment}>
                <Paperclip size={14} color={Colors.BluePrimary} />
                <Text style={styles.attachmentText}>{ann.attachmentName}</Text>
              </View>
            )}

            {/* Read More */}
            <View style={styles.readMoreRow}>
              <Text style={styles.readMoreText}>Read More</Text>
              <ChevronRight size={16} color={Colors.BluePrimary} />
            </View>
          </CampusCard>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: Colors.BluePrimary,
    borderColor: Colors.BluePrimary,
    shadowColor: Colors.BluePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterLabel: { fontSize: 13, fontWeight: '600', color: Colors.AppOnSurfaceVariant },
  activeFilterLabel: { color: '#FFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  annCard: { marginBottom: 14, backgroundColor: '#FFFFFF' },
  annHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 14, fontWeight: '700', color: Colors.BluePrimary },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  importantBadge: { fontSize: 11, color: Colors.RedError, fontWeight: '900' },
  authorText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  dateText: { fontSize: 11, color: Colors.AppOnSurfaceVariant + '99' },
  annTitle: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground, marginBottom: 6 },
  annSummary: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 18 },
  posterImage: {
    width: '100%',
    height: 155,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.BluePrimaryContainer + '66', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  attachmentText: { fontSize: 12, color: Colors.BluePrimary, fontWeight: '500' },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 },
  readMoreText: { fontSize: 13, fontWeight: '600', color: Colors.BluePrimary },
});
