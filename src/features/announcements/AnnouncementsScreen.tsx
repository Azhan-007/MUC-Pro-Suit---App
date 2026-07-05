import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, StatusChip, PageHeader } from '../../components';
import { Colors } from '../../theme';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Star,
  Archive,
  Search,
  FileText,
  Share2,
  Download,
  Eye,
  CheckSquare,
  X,
  Paperclip,
  ChevronRight,
  BadgeCheck,
  Calendar,
  Bell,
} from 'lucide-react-native';
import { AnnouncementCategory, CircularItem } from '../../types';
import { mockFacultyCirculars } from '../../data/mockFacultyData';

const CATEGORIES = [
  'All', 'Academic', 'Exams', 'Placement', 'Library', 'Administration', 
  'Events', 'HR', 'Finance', 'Scholarships', 'Research', 'Training', 'IQAC', 'NAAC', 'General'
];

const STATUS_FILTERS = [
  'All', 'Unread', 'Read', 'Bookmarked', 'Important', 'Urgent', 'Recent', 'Expired'
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'NEWEST' },
  { label: 'Oldest First', value: 'OLDEST' },
  { label: 'Priority', value: 'PRIORITY' },
  { label: 'Category', value: 'CATEGORY' },
  { label: 'Department', value: 'DEPARTMENT' },
];

const POSTER_MAP: Record<string, any> = {
  c1: require('../../../assets/campus_banner.png'),
  c2: require('../../../assets/library_banner.jpg'),
};

const FILTERS: Array<{ label: string; value: AnnouncementCategory | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Exams', value: 'EXAMS' },
  { label: 'Placements', value: 'PLACEMENTS' },
  { label: 'Scholarships', value: 'SCHOLARSHIPS' },
  { label: 'Library', value: 'LIBRARY' },
];

export const AnnouncementsScreen: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isFaculty = pathname.includes('/faculty');

  // ── STUDENT ALERTS STATE (Azhan) ──
  const { announcements } = useCampusStore();
  const [activeFilter, setActiveFilter] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [selectedAnn, setSelectedAnn] = useState<any | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const studentFilteredAnnouncements = useMemo(() => {
    return activeFilter === 'ALL'
      ? announcements
      : announcements.filter((a) => a.category === activeFilter);
  }, [announcements, activeFilter]);

  // ── FACULTY CIRCULARS STATE (Mohathashim) ──
  const [circulars, setCirculars] = useState<CircularItem[]>(mockFacultyCirculars);
  const [circularTab, setCircularTab] = useState<'ALL' | 'BOOKMARKS' | 'ARCHIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [selectedCircular, setSelectedCircular] = useState<CircularItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ── Date Utility Helpers (Mohathashim) ──
  const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = months.indexOf(parts[1].toLowerCase().slice(0, 3));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== -1 && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const isExpired = (expiryStr: string): boolean => {
    const expDate = parseDateString(expiryStr);
    if (!expDate) return false;
    const today = new Date(2026, 6, 5); // Today is 05 Jul 2026
    return expDate < today;
  };

  // ── Dynamic Statistics calculations (Mohathashim) ──
  const stats = useMemo(() => {
    const unread = circulars.filter(c => !c.isRead && !c.isArchived).length;
    const allCount = circulars.filter(c => !c.isArchived).length;
    const bookmarkedCount = circulars.filter(c => c.isBookmarked && !c.isArchived).length;
    const archivedCount = circulars.filter(c => c.isArchived).length;

    return { unread, allCount, bookmarkedCount, archivedCount };
  }, [circulars]);

  // ── Actions (Mohathashim) ──
  const handleOpenCircular = (item: CircularItem) => {
    setCirculars(prev => prev.map(c => {
      if (c.id === item.id) {
        return { ...c, isRead: true };
      }
      return c;
    }));
    
    const updatedItem = { ...item, isRead: true };
    setSelectedCircular(updatedItem);
    setShowDetailsModal(true);
  };

  const handleToggleBookmark = (id: string) => {
    setCirculars(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.isBookmarked;
        Alert.alert(
          nextState ? 'Circular Bookmarked' : 'Circular Removed',
          nextState ? 'This circular will now appear in your bookmarks tab.' : 'Removed from bookmarks.'
        );
        return { ...c, isBookmarked: nextState };
      }
      return c;
    }));

    if (selectedCircular && selectedCircular.id === id) {
      setSelectedCircular(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleToggleArchive = (id: string) => {
    setCirculars(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.isArchived;
        Alert.alert(
          nextState ? 'Circular Archived' : 'Circular Restored',
          nextState ? 'Moved to archives.' : 'Restored back to inbox.'
        );
        return { ...c, isArchived: nextState };
      }
      return c;
    }));

    if (selectedCircular && selectedCircular.id === id) {
      setSelectedCircular(prev => prev ? { ...prev, isArchived: !prev.isArchived } : null);
    }
  };

  const handleMarkAllRead = () => {
    setCirculars(prev => prev.map(c => ({ ...c, isRead: true })));
    Alert.alert('Success', 'All circulars have been marked as read.');
  };

  const handleAttachmentPreview = (fileName: string) => {
    Alert.alert('Attachment Preview', `Opening document preview for: ${fileName}`);
  };

  const handleAttachmentDownload = (fileName: string) => {
    setDownloadingFile(fileName);
    setDownloadSuccess(false);
    setTimeout(() => {
      setDownloadingFile(null);
      setDownloadSuccess(true);
    }, 2000);
  };

  const handleAttachmentShare = (fileName: string) => {
    Alert.alert('Share File', `Sharing link generated for attachment file: ${fileName}`);
  };

  const handleShareCircular = (title: string) => {
    Alert.alert('Share Circular', `Circular Link generated for: "${title}". Copied to clipboard.`);
  };

  // ── Search, Filter, Sort Memos (Mohathashim) ──
  const filteredCirculars = useMemo(() => {
    let result = circulars;

    if (circularTab === 'BOOKMARKS') {
      result = result.filter(c => c.isBookmarked && !c.isArchived);
    } else if (circularTab === 'ARCHIVE') {
      result = result.filter(c => c.isArchived);
    } else {
      result = result.filter(c => !c.isArchived);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.publisher.toLowerCase().includes(q) ||
        c.circularNo.toLowerCase().includes(q) ||
        c.referenceNo.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(c => c.category === filterCategory);
    }

    if (filterStatus !== 'All') {
      result = result.filter(c => {
        if (filterStatus === 'Unread') return !c.isRead;
        if (filterStatus === 'Read') return c.isRead;
        if (filterStatus === 'Bookmarked') return c.isBookmarked;
        if (filterStatus === 'Important') return c.priority === 'Important';
        if (filterStatus === 'Urgent') return c.priority === 'Urgent';
        if (filterStatus === 'Expired') return isExpired(c.expiryDate);
        if (filterStatus === 'Recent') {
          const date = parseDateString(c.publishedDate);
          if (!date) return false;
          const diffTime = Math.abs(new Date(2026, 6, 5).getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 5;
        }
        return true;
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'NEWEST') {
        const dateA = parseDateString(a.publishedDate) || new Date(0);
        const dateB = parseDateString(b.publishedDate) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      }
      if (sortBy === 'OLDEST') {
        const dateA = parseDateString(a.publishedDate) || new Date(0);
        const dateB = parseDateString(b.publishedDate) || new Date(0);
        return dateA.getTime() - dateB.getTime();
      }
      if (sortBy === 'PRIORITY') {
        const priorityWeight: Record<string, number> = { 'Critical': 4, 'Urgent': 3, 'Important': 2, 'Normal': 1 };
        const wA = priorityWeight[a.priority] || 0;
        const wB = priorityWeight[b.priority] || 0;
        return wB - wA;
      }
      if (sortBy === 'CATEGORY') {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === 'DEPARTMENT') {
        return a.department.localeCompare(b.department);
      }
      return 0;
    });

  }, [circulars, circularTab, searchQuery, filterCategory, filterStatus, sortBy]);

  const getPriorityLevel = (p: string) => {
    if (p === 'Critical') return 'LOW';
    if (p === 'Urgent') return 'WARNING';
    if (p === 'Important') return 'NOW';
    return 'SAFE';
  };

  const getCategoryInitials = (cat: string) => {
    return cat.slice(0, 2).toUpperCase();
  };

  if (isFaculty) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.AppOnBackground} />
          </Pressable>
          <Text style={styles.headerTitle}>Circulars</Text>
          <View style={styles.headerRight}>
            {stats.unread > 0 && (
              <Pressable onPress={handleMarkAllRead} style={styles.actionIconBtn}>
                <CheckSquare size={18} color={Colors.BluePrimary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Tabs Selector at the very top */}
        <View style={styles.subTabBar}>
          {[
            { key: 'ALL', label: `All Circulars (${stats.allCount})` },
            { key: 'BOOKMARKS', label: `Bookmarked (${stats.bookmarkedCount})` },
            { key: 'ARCHIVE', label: `Archived (${stats.archivedCount})` },
          ].map((tab) => {
            const active = circularTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.subTabItem, active && styles.subTabItemActive]}
                onPress={() => { setCircularTab(tab.key as any); setSearchQuery(''); }}
              >
                <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category Filter Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === filterCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setFilterCategory(cat)}
                style={[styles.filterChip, active && styles.activeFilterChip]}
              >
                <Text style={[styles.filterLabel, active && styles.activeFilterLabel]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.AppOnSurfaceVariant + '80'} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchField}
            placeholder="Search by title, number, ref, publisher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
          />
        </View>

        {/* Dropdown status/sort filters */}
        <View style={styles.filterDropdownsContainer}>
          <View style={styles.dropdownsGrid}>
            {/* Status Dropdown */}
            <View style={{ flex: 1, position: 'relative', zIndex: 2000 }}>
              <Pressable 
                style={styles.filterDropdownBtn} 
                onPress={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                  Status: {filterStatus}
                </Text>
                <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
              </Pressable>
              {showStatusDropdown && (
                <View style={styles.filterDropdownMenu}>
                  {STATUS_FILTERS.map((sf) => (
                    <Pressable 
                      key={sf} 
                      style={[styles.filterDropdownItem, filterStatus === sf && styles.filterDropdownItemActive]}
                      onPress={() => {
                        setFilterStatus(sf);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={[styles.filterDropdownItemTxt, filterStatus === sf && styles.filterDropdownItemTxtActive]}>
                        {sf}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Sort Dropdown */}
            <View style={{ flex: 1, position: 'relative', zIndex: 1000 }}>
              <Pressable 
                style={styles.filterDropdownBtn} 
                onPress={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
                  Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </Text>
                <ChevronDown size={14} color={Colors.AppOnSurfaceVariant} />
              </Pressable>
              {showSortDropdown && (
                <View style={styles.filterDropdownMenu}>
                  {SORT_OPTIONS.map((opt) => (
                    <Pressable 
                      key={opt.value} 
                      style={[styles.filterDropdownItem, sortBy === opt.value && styles.filterDropdownItemActive]}
                      onPress={() => {
                        setSortBy(opt.value);
                        setShowSortDropdown(false);
                      }}
                    >
                      <Text style={[styles.filterDropdownItemTxt, sortBy === opt.value && styles.filterDropdownItemTxtActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* List */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filteredCirculars.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Bell size={48} color={Colors.AppOutline} />
              <Text style={styles.emptyStateTitle}>No Circulars Found</Text>
              <Text style={styles.emptyStateSubtitle}>Try adjusting your search query or dropdown filters.</Text>
            </View>
          ) : (
            filteredCirculars.map((item) => {
              const expired = isExpired(item.expiryDate);
              const isImportant = item.priority === 'Critical' || item.priority === 'Urgent' || item.priority === 'Important';
              return (
                <CampusCard 
                  key={item.id} 
                  borderColor={isImportant ? Colors.BluePrimary : Colors.AppOutline}
                  style={styles.annCard}
                  elevation="sm"
                  onPress={() => handleOpenCircular(item)}
                >
                  {/* Header row */}
                  <View style={styles.annHeader}>
                    <View style={styles.initialsCircle}>
                      <Text style={styles.initialsText}>{getCategoryInitials(item.category)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={styles.chipRow}>
                        <StatusChip text={item.category} level={item.category} />
                        <StatusChip text={item.priority} level={getPriorityLevel(item.priority)} />
                        {expired && (
                          <Text style={styles.importantBadge}> • EXPIRED</Text>
                        )}
                        {!item.isRead && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      <Text style={styles.authorText}>{item.publisher} · {item.department}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.dateText}>{item.publishedDate}</Text>
                      <Pressable onPress={() => handleToggleBookmark(item.id)}>
                        <Star size={16} color={item.isBookmarked ? '#F59E0B' : Colors.AppOnSurfaceVariant + '40'} fill={item.isBookmarked ? '#F59E0B' : 'transparent'} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Poster Image */}
                  {POSTER_MAP[item.id] && (
                    <Image
                      source={POSTER_MAP[item.id]}
                      style={styles.posterImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* Title & summary */}
                  <Text style={styles.annTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.annSummary} numberOfLines={3}>{item.summary}</Text>

                  {/* Attachment */}
                  {item.attachments.length > 0 && (
                    <View style={styles.attachment}>
                      <Paperclip size={14} color={Colors.BluePrimary} />
                      <Text style={styles.attachmentText}>
                        {item.attachments[0].name} ({item.attachments.length} file{item.attachments.length > 1 ? 's' : ''})
                      </Text>
                    </View>
                  )}

                  {/* Read More */}
                  <View style={styles.readMoreRow}>
                    <Text style={styles.readMoreText}>Read More</Text>
                    <ChevronRight size={16} color={Colors.BluePrimary} style={{ marginLeft: 4 }} />
                  </View>
                </CampusCard>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Details Modal */}
        <Modal visible={showDetailsModal} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <Pressable style={styles.pickerDismiss} onPress={() => { setShowDetailsModal(false); setSelectedCircular(null); }} />
            <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Official Circular Details</Text>
                <Pressable onPress={() => { setShowDetailsModal(false); setSelectedCircular(null); }} style={styles.pickerCloseBtn}>
                  <X size={20} color={Colors.AppOnBackground} />
                </Pressable>
              </View>

              {selectedCircular && (
                <ScrollView 
                  contentContainerStyle={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Header Section */}
                  <View style={styles.bookDetailsSection}>
                    <View style={[styles.bookDetailsCoverPlaceholder, { backgroundColor: Colors.BluePrimaryContainer }]}>
                      <FileText size={36} color={Colors.BluePrimary} />
                    </View>
                    <Text style={styles.bookDetailsTitle}>{selectedCircular.title}</Text>
                    <Text style={styles.bookDetailsAuthor}>Publisher: {selectedCircular.publisher}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <StatusChip text={selectedCircular.category} level={selectedCircular.category} />
                      <StatusChip text={selectedCircular.priority} level={getPriorityLevel(selectedCircular.priority)} />
                      {isExpired(selectedCircular.expiryDate) && <StatusChip text="EXPIRED" level="LOW" />}
                    </View>
                  </View>

                  <View style={[styles.divider, { marginVertical: 8 }]} />

                  {/* Metadata details grid */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Circular Number:</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>{selectedCircular.circularNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reference No:</Text>
                      <Text style={styles.detailValue}>{selectedCircular.referenceNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Target Department:</Text>
                      <Text style={styles.detailValue}>{selectedCircular.department}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Designation Target:</Text>
                      <Text style={styles.detailValue}>{selectedCircular.targetDesignation}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Published Date:</Text>
                      <Text style={styles.detailValue}>{selectedCircular.publishedDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Expiry Date:</Text>
                      <Text style={[styles.detailValue, { color: Colors.RedError }]}>{selectedCircular.expiryDate}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { marginVertical: 12 }]} />

                  {/* Circular Body */}
                  <Text style={styles.relatedTitle}>Circular Announcement</Text>
                  <Text style={styles.circularDescriptionBody}>
                    {selectedCircular.description}
                  </Text>

                  <View style={[styles.divider, { marginVertical: 12 }]} />

                  {/* Attachments Section */}
                  <Text style={styles.relatedTitle}>Attachments ({selectedCircular.attachmentCount})</Text>
                  <View style={{ gap: 10, marginTop: 8 }}>
                    {selectedCircular.attachments.map((file, idx) => (
                      <View key={idx} style={styles.attachmentFileBox}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.attachmentFileNameTxt} numberOfLines={1}>{file.name}</Text>
                          <Text style={styles.attachmentFileSizeTxt}>{file.type} · {file.size}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable 
                            onPress={() => handleAttachmentPreview(file.name)} 
                            style={styles.attachmentActionBtn}
                          >
                            <Eye size={14} color={Colors.BluePrimary} />
                          </Pressable>
                          <Pressable 
                            onPress={() => handleAttachmentDownload(file.name)} 
                            style={styles.attachmentActionBtn}
                          >
                            <Download size={14} color={Colors.BluePrimary} />
                          </Pressable>
                          <Pressable 
                            onPress={() => handleAttachmentShare(file.name)} 
                            style={styles.attachmentActionBtn}
                          >
                            <Share2 size={14} color={Colors.BluePrimary} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                    {selectedCircular.attachments.length === 0 && (
                      <Text style={styles.noRelatedText}>No attachments associated with this circular.</Text>
                    )}
                  </View>

                  {/* Actions Grid */}
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                    <Pressable 
                      onPress={() => handleToggleBookmark(selectedCircular.id)} 
                      style={[styles.modalActionBtn, { flex: 1, borderColor: '#CBD5E1', borderWidth: 1 }]}
                    >
                      <Star size={16} color={selectedCircular.isBookmarked ? '#F59E0B' : Colors.AppOnSurfaceVariant} fill={selectedCircular.isBookmarked ? '#F59E0B' : 'transparent'} />
                      <Text style={[styles.modalActionBtnTxt, { color: Colors.AppOnBackground }]}>
                        {selectedCircular.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                      </Text>
                    </Pressable>

                    <Pressable 
                      onPress={() => handleToggleArchive(selectedCircular.id)} 
                      style={[styles.modalActionBtn, { flex: 1, borderColor: '#CBD5E1', borderWidth: 1 }]}
                    >
                      <Archive size={16} color={selectedCircular.isArchived ? Colors.RedError : Colors.AppOnSurfaceVariant} />
                      <Text style={[styles.modalActionBtnTxt, { color: Colors.AppOnBackground }]}>
                        {selectedCircular.isArchived ? 'Archived' : 'Archive'}
                      </Text>
                    </Pressable>

                    <Pressable 
                      onPress={() => handleShareCircular(selectedCircular.title)} 
                      style={[styles.modalActionBtn, { flex: 1, backgroundColor: Colors.BluePrimaryContainer }]}
                    >
                      <Share2 size={16} color={Colors.BluePrimary} />
                      <Text style={[styles.modalActionBtnTxt, { color: Colors.BluePrimary }]}>Share</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Student view rendering
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
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
        {studentFilteredAnnouncements.map((ann) => (
          <CampusCard
            key={ann.id}
            borderColor={ann.isImportant ? Colors.BluePrimary : Colors.AppOutline}
            style={styles.annCard}
            elevation="sm"
            onPress={() => setSelectedAnn(ann)}
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

            {/* Title & summary */}
            <Text style={styles.annTitle} numberOfLines={2}>{ann.title}</Text>
            <Text style={styles.annSummary} numberOfLines={3}>{ann.summary}</Text>

            {/* Attachment */}
            {ann.attachmentName && (
              <Pressable
                style={styles.attachment}
                onPress={() => handleAttachmentDownload(ann.attachmentName!)}
              >
                <Paperclip size={14} color={Colors.BluePrimary} />
                <Text style={styles.attachmentText}>{ann.attachmentName}</Text>
              </Pressable>
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

      {/* ── DETAIL MODAL FOR CIRCULARS ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedAnn !== null}
        onRequestClose={() => setSelectedAnn(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {selectedAnn && (
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Header info */}
                <View style={styles.modalAnnHeader}>
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{selectedAnn.initials}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.authorText}>{selectedAnn.author}</Text>
                    <Text style={styles.dateText}>{selectedAnn.dateText} • Circular ID: #{selectedAnn.id}</Text>
                  </View>
                </View>

                {/* Sub row with categories */}
                <View style={[styles.chipRow, { marginVertical: 10 }]}>
                  <StatusChip text={selectedAnn.category} level={selectedAnn.category} />
                  {selectedAnn.isImportant && (
                    <Text style={[styles.importantBadge, { marginLeft: 8 }]}>IMPORTANT NOTICE</Text>
                  )}
                </View>

                {/* Title */}
                <Text style={styles.modalTitle}>{selectedAnn.title}</Text>

                {/* Full Body Text */}
                <Text style={styles.modalBodyText}>{selectedAnn.summary}</Text>

                {/* Attachment Section */}
                {selectedAnn.attachmentName && (
                  <View style={styles.modalAttachmentBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <FileText size={18} color={Colors.BluePrimary} />
                      <Text style={styles.modalAttachmentText} numberOfLines={1}>
                        {selectedAnn.attachmentName}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.modalDownloadIconBtn}
                      onPress={() => handleAttachmentDownload(selectedAnn.attachmentName!)}
                    >
                      <Download size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}

                {/* Action button */}
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { marginTop: 16 }]}
                  onPress={() => setSelectedAnn(null)}
                >
                  <Text style={styles.portalBtnTextPrimary}>Dismiss Circular</Text>
                </Pressable>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── PDF DOWNLOAD LOADER MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={downloadingFile !== null || downloadSuccess}
        onRequestClose={() => {
          setDownloadingFile(null);
          setDownloadSuccess(false);
        }}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContentOverlay}>
            {downloadingFile !== null && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.progressTitle}>Downloading Attachment</Text>
                <Text style={styles.progressMessage}>
                  Retrieving "{downloadingFile}" from academic notice board archives...
                </Text>
              </View>
            )}
            {downloadSuccess && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <BadgeCheck size={30} color="#10B981" />
                </View>
                <Text style={styles.progressTitle}>Attachment Saved</Text>
                <Text style={styles.progressMessage}>
                  The file has been successfully downloaded and stored in your device Downloads directory.
                </Text>
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%' }]}
                  onPress={() => setDownloadSuccess(false)}
                >
                  <Text style={styles.portalBtnTextPrimary}>OK</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.AppOnBackground },
  headerRight: { width: 40, alignItems: 'center', justifyContent: 'center' },
  actionIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.BluePrimaryContainer },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  subTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabItemActive: {
    borderBottomColor: Colors.BluePrimary,
  },
  subTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  subTabLabelActive: {
    color: Colors.BluePrimary,
    fontWeight: '800',
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchField: {
    flex: 1,
    fontSize: 13,
    color: Colors.AppOnBackground,
    padding: 0,
  },
  filterDropdownsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  dropdownsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  filterDropdownBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
    flex: 1,
  },
  filterDropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    backgroundColor: Colors.AppSurface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  filterDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterDropdownItemActive: {
    backgroundColor: Colors.BluePrimaryContainer,
  },
  filterDropdownItemTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.AppOnSurfaceVariant,
  },
  filterDropdownItemTxtActive: {
    color: Colors.BluePrimary,
    fontWeight: '800',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  annCard: { marginBottom: 14, backgroundColor: '#FFFFFF', padding: 16 },
  annHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.BluePrimaryContainer, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 14, fontWeight: '700', color: Colors.BluePrimary },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 6, flexWrap: 'wrap' },
  importantBadge: { fontSize: 11, color: Colors.RedError, fontWeight: '900' },
  authorText: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '700', marginTop: 2 },
  dateText: { fontSize: 11, color: Colors.AppOnSurfaceVariant + '99', fontWeight: '500' },
  annTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground, marginBottom: 6 },
  annSummary: { fontSize: 13, color: Colors.AppOnSurfaceVariant, lineHeight: 18, fontWeight: '500' },
  posterImage: {
    width: '100%',
    height: 155,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.BluePrimaryContainer + '66', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  attachmentText: { fontSize: 12, color: Colors.BluePrimary, fontWeight: '700' },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 },
  readMoreText: { fontSize: 13, fontWeight: '700', color: Colors.BluePrimary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.BluePrimary, marginLeft: 4 },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  divider: { height: 1, backgroundColor: Colors.AppOutline },

  // Modals layouts (Azhan)
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
  portalContentOverlay: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalAnnHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.AppOutline, paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginVertical: 12 },
  modalBodyText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  modalPosterImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },

  // Modal attachments (Azhan)
  modalAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  modalAttachmentText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  modalDownloadIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.BluePrimary, alignItems: 'center', justifyContent: 'center' },

  // CTAs (Azhan)
  portalBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Progress loaders (Azhan)
  progressTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  progressMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  // Modal layouts (Mohathashim)
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  pickerDismiss: {
    flex: 1,
  },
  pickerSheet: {
    backgroundColor: Colors.AppSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '85%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  bookDetailsSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bookDetailsCoverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDetailsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    textAlign: 'center',
  },
  bookDetailsAuthor: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
  },
  detailSection: {
    gap: 10,
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRowCol: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  bookDetailsDesc: {
    fontSize: 12,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 18,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.AppOnBackground,
    marginBottom: 8,
  },
  circularDescriptionBody: {
    fontSize: 13,
    color: Colors.AppOnBackground,
    lineHeight: 20,
    marginVertical: 4,
  },
  attachmentFileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  attachmentFileNameTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  attachmentFileSizeTxt: {
    fontSize: 10,
    color: Colors.AppOnSurfaceVariant,
    marginTop: 2,
  },
  attachmentActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.BluePrimaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalActionBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  noRelatedText: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
    marginVertical: 8,
  },
});
