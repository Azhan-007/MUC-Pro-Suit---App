import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  CheckSquare, 
  Pin, 
  Archive, 
  ExternalLink, 
  Search, 
  ChevronDown, 
  X, 
  BookOpen, 
  Landmark, 
  Briefcase, 
  Megaphone,
} from 'lucide-react-native';
import { Colors } from '../../theme';
import { CampusCard, StatusChip, useCampusAlert } from '../../components';
import { mockFacultyNotifications } from '../../data/mockFacultyData';
import { ERPNotification } from '../../types';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Read', value: 'READ' },
  { label: 'Pinned', value: 'PINNED' },
  { label: 'Important', value: 'IMPORTANT' },
  { label: 'Urgent', value: 'URGENT' },
  { label: 'Today', value: 'TODAY' },
  { label: 'Yesterday', value: 'YESTERDAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'NEWEST' },
  { label: 'Oldest First', value: 'OLDEST' },
  { label: 'Priority', value: 'PRIORITY' },
  { label: 'Module', value: 'MODULE' },
];

// Helper to resolve priority style
const getPriorityLevel = (p: string) => {
  if (p === 'Critical') return 'LOW';
  if (p === 'Urgent') return 'WARNING';
  if (p === 'Important') return 'NOW';
  return 'SAFE';
};

// Formatted date string helper for time texts
const formatNotificationTime = (isoStr: string) => {
  const date = new Date(isoStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

// Icon provider based on ERP module
const getCategoryIconInfo = (moduleName: string) => {
  switch (moduleName.toUpperCase()) {
    case 'ACADEMIC':
    case 'TIMETABLE':
    case 'EXAMINATION':
      return {
        icon: <BookOpen size={18} color="#2563EB" />,
        bg: '#DBEAFE',
      };
    case 'ADMINISTRATION':
    case 'LEAVE':
    case 'HR':
    case 'FINANCE':
      return {
        icon: <Landmark size={18} color="#10B981" />,
        bg: '#DCFCE7',
      };
    case 'LIBRARY':
      return {
        icon: <BookOpen size={18} color="#0D9488" />,
        bg: '#CCFBF1',
      };
    case 'EVENTS':
      return {
        icon: <Megaphone size={18} color="#F59E0B" />,
        bg: '#FEF3C7',
      };
    case 'PLACEMENT':
      return {
        icon: <Briefcase size={18} color="#8B5CF6" />,
        bg: '#EDE9FE',
      };
    default:
      return {
        icon: <Bell size={18} color="#475569" />,
        bg: '#F1F5F9',
      };
  }
};

// ── Swipeable Notification Card Wrapper Component ──
const SwipeableNotificationCard: React.FC<{
  item: ERPNotification;
  openCardId: string | null;
  setOpenCardId: (id: string | null) => void;
  onPress: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleRead: (id: string) => void;
  onLongPress: () => void;
}> = ({ item, openCardId, setOpenCardId, onPress, onDelete, onArchive, onTogglePin, onToggleRead, onLongPress }) => {
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Sync openCardId: close this card when another card opens
  useEffect(() => {
    if (openCardId !== item.id) {
      Animated.spring(swipeAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    }
  }, [openCardId]);

  const ACTION_WIDTH = 180; // total width of right-action tray (3 buttons × 60)
  const DISMISS_THRESHOLD = 120; // px to the right to dismiss

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dy) < 10,

      onPanResponderGrant: () => {
        setOpenCardId(item.id);
      },

      onPanResponderMove: (_, gs) => {
        let dx = gs.dx;

        if (dx < 0) {
          // Swipe LEFT → reveal right-side action tray
          // Rubber-band past the tray width
          if (dx < -ACTION_WIDTH) {
            dx = -ACTION_WIDTH + (dx + ACTION_WIDTH) * 0.25;
          }
        } else {
          // Swipe RIGHT → dismiss (with rubber-band beyond threshold)
          if (dx > DISMISS_THRESHOLD * 1.5) {
            dx = DISMISS_THRESHOLD * 1.5 + (dx - DISMISS_THRESHOLD * 1.5) * 0.2;
          }
        }
        swipeAnim.setValue(dx);
      },

      onPanResponderRelease: (_, gs) => {
        if (gs.dx > DISMISS_THRESHOLD) {
          // ── Swipe RIGHT past threshold → dismiss (delete)
          Animated.timing(swipeAnim, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete(item.id);
          });
        } else if (gs.dx < -ACTION_WIDTH * 0.5) {
          // ── Swipe LEFT past half tray → snap open the tray
          Animated.spring(swipeAnim, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
            bounciness: 3,
          }).start();
        } else {
          // ── Not enough → snap back
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },

      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Right-action tray fade/scale in as card slides left
  const trayOpacity = swipeAnim.interpolate({
    inputRange: [-ACTION_WIDTH, -40, 0],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });
  const trayScale = swipeAnim.interpolate({
    inputRange: [-ACTION_WIDTH, -40, 0],
    outputRange: [1, 0.85, 0.7],
    extrapolate: 'clamp',
  });

  // Dismiss indicator (green) fades in on right swipe
  const dismissOpacity = swipeAnim.interpolate({
    inputRange: [0, 60, DISMISS_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // Card scale lift on drag
  const cardScale = swipeAnim.interpolate({
    inputRange: [-ACTION_WIDTH, 0, DISMISS_THRESHOLD],
    outputRange: [1.005, 1, 1.01],
    extrapolate: 'clamp',
  });

  const iconInfo = getCategoryIconInfo(item.module);

  return (
    <View style={styles.swipeRowWrapper}>
      {/* ── Background: Right dismiss indicator ── */}
      <Animated.View style={[styles.dismissBg, { opacity: dismissOpacity }]}>
        <X size={22} color="#FFFFFF" />
        <Text style={styles.dismissBgText}>Dismiss</Text>
      </Animated.View>

      {/* ── Background: Left action tray (Pin, Archive, Read) ── */}
      <Animated.View style={[styles.swipeRightActions, { opacity: trayOpacity, transform: [{ scale: trayScale }] }]}>
        <Pressable
          onPress={() => { onToggleRead(item.id); setOpenCardId(null); }}
          style={[styles.swipeActionItem, { backgroundColor: Colors.BluePrimary }]}
        >
          <CheckSquare size={16} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>{item.isRead ? 'Unread' : 'Read'}</Text>
        </Pressable>
        <Pressable
          onPress={() => { onTogglePin(item.id); setOpenCardId(null); }}
          style={[styles.swipeActionItem, { backgroundColor: '#F59E0B' }]}
        >
          <Pin size={16} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
        </Pressable>
        <Pressable
          onPress={() => { onArchive(item.id); setOpenCardId(null); }}
          style={[styles.swipeActionItem, { backgroundColor: '#64748B' }]}
        >
          <Archive size={16} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Archive</Text>
        </Pressable>
      </Animated.View>

      {/* ── Foreground Card ── */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: swipeAnim }, { scale: cardScale }] }}
      >
        <Pressable
          style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
              {iconInfo.icon}
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, marginRight: 8 }}>
                  <Text style={[styles.cardTitle, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.isPinned && <Pin size={10} color={Colors.BluePrimary} />}
                  <StatusChip text={item.priority} level={getPriorityLevel(item.priority)} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!item.isRead && <View style={styles.unreadDot} />}
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    style={styles.cardCloseBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={13} color={Colors.AppOnSurfaceVariant + 'AA'} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.cardMsg}>{item.description}</Text>
              <Text style={styles.cardTime}>
                {formatNotificationTime(item.createdTime)} · {item.module} · {item.category}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export const FacultyNotificationsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { showAlert } = useCampusAlert();

  // Local state
  const [notifications, setNotifications] = useState<ERPNotification[]>(mockFacultyNotifications);
  
  // Tab-based navigation: INBOX, PINNED, ARCHIVED
  const [activeTab, setActiveTab] = useState<'INBOX' | 'PINNED' | 'ARCHIVED'>('INBOX');

  // Track open row id for single open limit
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Modal State
  const [selectedNotification, setSelectedNotification] = useState<ERPNotification | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Dropdown state – type tracks which dropdown is open ('FILTER' | 'SORT' | null)
  const [openDropdown, setOpenDropdown] = useState<'FILTER' | 'SORT' | null>(null);
  const [dropdownY, setDropdownY] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);
  const [dropdownW, setDropdownW] = useState(0);

  const filterBtnRef = useRef<View>(null);
  const sortBtnRef = useRef<View>(null);

  const openFilterDropdown = () => {
    filterBtnRef.current?.measureInWindow((x, y, w, h) => {
      setDropdownX(x);
      setDropdownY(y + h + 4);
      setDropdownW(w);
      setOpenDropdown('FILTER');
    });
  };

  const openSortDropdown = () => {
    sortBtnRef.current?.measureInWindow((x, y, w, h) => {
      setDropdownX(x);
      setDropdownY(y + h + 4);
      setDropdownW(w);
      setOpenDropdown('SORT');
    });
  };

  // Snackbar Undo State
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    text: string;
    action: () => void;
  } | null>(null);

  // Auto-dismiss undo snackbar after 5 seconds
  useEffect(() => {
    if (snackbar && snackbar.visible) {
      const timer = setTimeout(() => {
        setSnackbar(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  // ── Date Utility Helpers ──
  const parseDateString = (isoStr: string): Date => {
    return new Date(isoStr);
  };

  const getGroupTitle = (isoStr: string): 'Today' | 'Yesterday' | 'This Week' | 'Earlier' => {
    const date = parseDateString(isoStr);
    const today = new Date(2026, 6, 5); // Today's local date is 05 Jul 2026
    
    const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = dToday.getTime() - dDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'This Week';
    return 'Earlier';
  };

  // Stats and unread counts
  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead && !n.isArchived).length;
    const inboxCount = notifications.filter(n => !n.isArchived).length;
    const pinnedCount = notifications.filter(n => n.isPinned && !n.isArchived).length;
    const archivedCount = notifications.filter(n => n.isArchived).length;

    return { unread, inboxCount, pinnedCount, archivedCount };
  }, [notifications]);

  const unreadCount = stats.unread;

  // ── Actions ──
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    mockFacultyNotifications.forEach(n => { n.isRead = true; });
    showAlert('Notifications', 'All notifications marked as read.');
  };

  const handleClearAll = () => {
    showAlert(
      'Clear Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => {
            setNotifications([]);
            mockFacultyNotifications.length = 0;
          } 
        },
      ]
    );
  };

  const handleOpenNotification = (item: ERPNotification) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === item.id) {
        return { ...n, isRead: true, readTime: new Date().toISOString() };
      }
      return n;
    }));
    const target = mockFacultyNotifications.find(n => n.id === item.id);
    if (target) {
      target.isRead = true;
      target.readTime = new Date().toISOString();
    }

    const updated = { ...item, isRead: true, readTime: new Date().toISOString() };
    setSelectedNotification(updated);
    setShowDetailsModal(true);
  };

  const handleTogglePin = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    }));
    const target = mockFacultyNotifications.find(n => n.id === id);
    if (target) {
      target.isPinned = !target.isPinned;
    }
    
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    }
  };

  const handleToggleArchive = (id: string) => {
    const targetItem = notifications.find(n => n.id === id);
    if (!targetItem) return;

    // Toggle archive state
    const nextArchived = !targetItem.isArchived;

    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isArchived: nextArchived };
      }
      return n;
    }));
    const globalTarget = mockFacultyNotifications.find(n => n.id === id);
    if (globalTarget) {
      globalTarget.isArchived = nextArchived;
    }

    // Show Undo Snackbar
    setSnackbar({
      visible: true,
      text: nextArchived ? 'Notification archived.' : 'Notification restored to Inbox.',
      action: () => {
        // Restore archive status
        setNotifications(prev => prev.map(n => {
          if (n.id === id) {
            return { ...n, isArchived: !nextArchived };
          }
          return n;
        }));
        if (globalTarget) {
          globalTarget.isArchived = !nextArchived;
        }
        setSnackbar(null);
      }
    });

    // Close details modal if open, auto-navigate to relevant tab
    setShowDetailsModal(false);
    setSelectedNotification(null);

    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, isArchived: nextArchived } : null);
    }
  };

  const handleDeleteNotification = (id: string) => {
    const targetItem = notifications.find(n => n.id === id);
    if (!targetItem) return;

    // Filter out item
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Save to global list sync
    const globalIdx = mockFacultyNotifications.findIndex(n => n.id === id);
    let originalGlobalItem: ERPNotification | null = null;
    if (globalIdx !== -1) {
      originalGlobalItem = mockFacultyNotifications[globalIdx];
      mockFacultyNotifications.splice(globalIdx, 1);
    }

    // Show Undo Snackbar
    setSnackbar({
      visible: true,
      text: 'Notification deleted.',
      action: () => {
        // Animate/Restore back
        setNotifications(prev => [...prev, targetItem]);
        if (originalGlobalItem) {
          mockFacultyNotifications.push(originalGlobalItem);
        }
        setSnackbar(null);
      }
    });

    setShowDetailsModal(false);
    setSelectedNotification(null);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isRead: !n.isRead };
      }
      return n;
    }));
    const target = mockFacultyNotifications.find(n => n.id === id);
    if (target) {
      target.isRead = !target.isRead;
    }

    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, isRead: !prev.isRead } : null);
    }
  };

  // Accessibility: Long press opens Actions Dialog
  const handleLongPress = (item: ERPNotification) => {
    showAlert(
      'Notification Actions',
      `Choose action for: "${item.title}"`,
      [
        { text: item.isRead ? 'Mark as Unread' : 'Mark as Read', onPress: () => handleToggleRead(item.id) },
        { text: item.isPinned ? 'Unpin' : 'Pin', onPress: () => handleTogglePin(item.id) },
        { text: item.isArchived ? 'Restore from Archive' : 'Archive', onPress: () => handleToggleArchive(item.id) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteNotification(item.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDeepLinkNavigate = (link: string) => {
    setShowDetailsModal(false);
    setSelectedNotification(null);
    router.push(link as any);
  };

  const handleTriggerAction = (action: string) => {
    showAlert('ERP Actions', `Mock action: "${action}" triggered successfully!`);
  };

  // ── Search & Filter Memos ──
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeTab === 'ARCHIVED') {
      result = result.filter(n => n.isArchived);
    } else if (activeTab === 'PINNED') {
      result = result.filter(n => n.isPinned && !n.isArchived);
    } else {
      result = result.filter(n => !n.isArchived);
    }

    if (activeFilter === 'UNREAD') {
      result = result.filter(n => !n.isRead);
    } else if (activeFilter === 'READ') {
      result = result.filter(n => n.isRead);
    } else if (activeFilter === 'PINNED') {
      result = result.filter(n => n.isPinned);
    } else if (activeFilter === 'IMPORTANT') {
      result = result.filter(n => n.priority === 'Important');
    } else if (activeFilter === 'URGENT') {
      result = result.filter(n => n.priority === 'Urgent');
    } else if (activeFilter === 'TODAY') {
      result = result.filter(n => getGroupTitle(n.createdTime) === 'Today');
    } else if (activeFilter === 'YESTERDAY') {
      result = result.filter(n => getGroupTitle(n.createdTime) === 'Yesterday');
    } else if (activeFilter === 'THIS_WEEK') {
      result = result.filter(n => getGroupTitle(n.createdTime) === 'This Week');
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.module.toLowerCase().includes(q)
      );
    }

    // Sort: Pinned items float at the top in their group, then sorted by selection
    return [...result].sort((a, b) => {
      if (activeTab !== 'PINNED') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'NEWEST') {
        return parseDateString(b.createdTime).getTime() - parseDateString(a.createdTime).getTime();
      }
      if (sortBy === 'OLDEST') {
        return parseDateString(a.createdTime).getTime() - parseDateString(b.createdTime).getTime();
      }
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { 'Critical': 5, 'Urgent': 4, 'Important': 3, 'Normal': 2, 'Low': 1 };
        const wA = priorityWeight[a.priority as any] || 0;
        const wB = priorityWeight[b.priority as any] || 0;
        return wB - wA;
      }
      if (sortBy === 'MODULE') {
        return a.module.localeCompare(b.module);
      }
      return 0;
    });

  }, [notifications, searchQuery, activeFilter, sortBy, activeTab]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<'Today' | 'Yesterday' | 'This Week' | 'Earlier', ERPNotification[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': [],
    };

    filteredNotifications.forEach(n => {
      const grp = getGroupTitle(n.createdTime);
      groups[grp].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.AppOnBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications ({unreadCount} unread)</Text>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <Pressable onPress={handleClearAll} style={styles.actionIconBtn}>
              <Trash2 size={18} color={Colors.RedError} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sub-tab selector */}
      <View style={styles.subTabBar}>
        {[
          { key: 'INBOX', label: `Inbox (${stats.inboxCount})` },
          { key: 'PINNED', label: `Pinned (${stats.pinnedCount})` },
          { key: 'ARCHIVED', label: `Archived (${stats.archivedCount})` },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.subTabItem, active && styles.subTabItemActive]}
              onPress={() => {
                setActiveTab(tab.key as any);
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
            >
              <Text style={[styles.subTabLabel, active && styles.subTabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Option Actions Strip */}
      {notifications.length > 0 && (
        <View style={styles.actionStrip}>
          <Pressable style={styles.actionStripBtn} onPress={handleMarkAllRead}>
            <CheckSquare size={14} color={Colors.BluePrimary} />
            <Text style={styles.actionStripText}>Mark all as read</Text>
          </Pressable>
        </View>
      )}

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.AppOnSurfaceVariant + '80'} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchField}
          placeholder="Search by title, description, module..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.AppOnSurfaceVariant + '80'}
        />
      </View>

      {/* Filter and Sort Dropdowns Grid */}
      <View style={styles.filterDropdownsContainer}>
        <View style={styles.dropdownsGrid}>
          {/* Status/Category Filter Button */}
          <Pressable
            ref={filterBtnRef}
            style={[styles.filterDropdownBtn, { flex: 1 }, openDropdown === 'FILTER' && styles.filterDropdownBtnActive]}
            onPress={openFilterDropdown}
          >
            <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
              {STATUS_FILTERS.find(f => f.value === activeFilter)?.label ?? 'Filter'}
            </Text>
            <ChevronDown size={14} color={openDropdown === 'FILTER' ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} style={{ transform: [{ rotate: openDropdown === 'FILTER' ? '180deg' : '0deg' }] }} />
          </Pressable>

          {/* Sort Button */}
          <Pressable
            ref={sortBtnRef}
            style={[styles.filterDropdownBtn, { flex: 1 }, openDropdown === 'SORT' && styles.filterDropdownBtnActive]}
            onPress={openSortDropdown}
          >
            <Text style={styles.filterDropdownBtnTxt} numberOfLines={1}>
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort'}
            </Text>
            <ChevronDown size={14} color={openDropdown === 'SORT' ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} style={{ transform: [{ rotate: openDropdown === 'SORT' ? '180deg' : '0deg' }] }} />
          </Pressable>
        </View>
      </View>

      {/* Root-level Dropdown Modal */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="none"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <Pressable style={styles.dropdownModalOverlay} onPress={() => setOpenDropdown(null)}>
          <View
            style={[
              styles.dropdownModalMenu,
              { top: dropdownY, left: dropdownX, width: dropdownW }
            ]}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              {openDropdown === 'FILTER'
                ? STATUS_FILTERS.map((sf) => (
                    <Pressable
                      key={sf.value}
                      style={[styles.filterDropdownItem, activeFilter === sf.value && styles.filterDropdownItemActive]}
                      onPress={() => {
                        setActiveFilter(sf.value);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[styles.filterDropdownItemTxt, activeFilter === sf.value && styles.filterDropdownItemTxtActive]}>
                        {sf.label}
                      </Text>
                    </Pressable>
                  ))
                : SORT_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.filterDropdownItem, sortBy === opt.value && styles.filterDropdownItemActive]}
                      onPress={() => {
                        setSortBy(opt.value);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[styles.filterDropdownItemTxt, sortBy === opt.value && styles.filterDropdownItemTxtActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))
              }
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Grouped Notifications List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <CampusCard borderColor={Colors.AppOutline} style={styles.emptyCard} elevation="sm">
            <View style={styles.emptyContent}>
              <Bell size={40} color={Colors.AppOnSurfaceVariant + '40'} />
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySub}>You have no matching notifications.</Text>
            </View>
          </CampusCard>
        ) : (
          (['Today', 'Yesterday', 'This Week', 'Earlier'] as const).map(grp => {
            const list = groupedNotifications[grp];
            if (list.length === 0) return null;
            return (
              <View key={grp} style={{ gap: 4 }}>
                <Text style={styles.groupHeaderTitle}>{grp}</Text>
                {list.map((item) => (
                  <SwipeableNotificationCard
                    key={item.id}
                    item={item}
                    openCardId={openCardId}
                    setOpenCardId={setOpenCardId}
                    onPress={() => handleOpenNotification(item)}
                    onDelete={handleDeleteNotification}
                    onArchive={handleToggleArchive}
                    onTogglePin={handleTogglePin}
                    onToggleRead={handleToggleRead}
                    onLongPress={() => handleLongPress(item)}
                  />
                ))}
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Undo Action Snackbar */}
      {snackbar && snackbar.visible && (
        <View style={[styles.snackbarContainer, { bottom: 20 + Math.max(insets.bottom, 12) }]}>
          <Text style={styles.snackbarText}>{snackbar.text}</Text>
          <Pressable onPress={snackbar.action} style={styles.snackbarBtn}>
            <Text style={styles.snackbarBtnText}>UNDO</Text>
          </Pressable>
        </View>
      )}

      {/* Notification Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerDismiss} onPress={() => { setShowDetailsModal(false); setSelectedNotification(null); }} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Notification Details</Text>
              <Pressable onPress={() => { setShowDetailsModal(false); setSelectedNotification(null); }} style={styles.pickerCloseBtn}>
                <X size={20} color={Colors.AppOnBackground} />
              </Pressable>
            </View>

            {selectedNotification && (
              <ScrollView 
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header Section */}
                <View style={styles.modalBodyHeader}>
                  <Text style={styles.modalNotificationTitle}>{selectedNotification.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <StatusChip text={selectedNotification.module} level={selectedNotification.module} />
                    <StatusChip text={selectedNotification.category} level={selectedNotification.category} />
                    <StatusChip text={selectedNotification.priority} level={getPriorityLevel(selectedNotification.priority)} />
                    {selectedNotification.isPinned && <StatusChip text="PINNED" level="NOW" />}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Metadata Grid */}
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Received Time:</Text>
                    <Text style={styles.detailValue}>{formatNotificationTime(selectedNotification.createdTime)}</Text>
                  </View>
                  {selectedNotification.readTime && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Read Time:</Text>
                      <Text style={styles.detailValue}>{formatNotificationTime(selectedNotification.readTime)}</Text>
                    </View>
                  )}
                  {selectedNotification.referenceId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reference ID:</Text>
                      <Text style={styles.detailValue}>{selectedNotification.referenceId}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Description Body */}
                <Text style={styles.descriptionLabel}>Message Description</Text>
                <Text style={styles.descriptionBody}>{selectedNotification.description}</Text>

                <View style={styles.divider} />

                {/* Quick actions triggers */}
                {selectedNotification.actionRequired && (
                  <View style={{ gap: 8 }}>
                    <Text style={styles.descriptionLabel}>Required Action: {selectedNotification.actionRequired}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable 
                        onPress={() => handleTriggerAction(selectedNotification.actionRequired || 'Acknowledge')}
                        style={[styles.actionCtaBtn, { flex: 1, backgroundColor: Colors.BluePrimary }]}
                      >
                        <Text style={styles.actionCtaBtnTxt}>{selectedNotification.actionRequired}</Text>
                      </Pressable>
                      {['Approve', 'Reject'].includes(selectedNotification.actionRequired) && (
                        <Pressable 
                          onPress={() => handleTriggerAction('Dismiss')}
                          style={[styles.actionCtaBtn, { flex: 1, backgroundColor: Colors.AppSurface, borderWidth: 1.5, borderColor: Colors.AppOutline }]}
                        >
                          <Text style={[styles.actionCtaBtnTxt, { color: Colors.AppOnBackground }]}>Dismiss</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}

                {/* Deep Link Action 
                <Pressable
                  onPress={() => handleDeepLinkNavigate(selectedNotification.deepLink)}
                  style={styles.deepLinkBtn}
                >
                  <ExternalLink size={16} color="#FFFFFF" />
                  <Text style={styles.deepLinkBtnTxt}>Go to Related ERP Module</Text>
                </Pressable>
                */}

                {/* Local Actions Strip (Pin/Archive/Delete) */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <Pressable 
                    onPress={() => handleTogglePin(selectedNotification.id)}
                    style={[styles.localActionBtn, selectedNotification.isPinned && { backgroundColor: Colors.BluePrimaryContainer }]}
                  >
                    <Pin size={14} color={selectedNotification.isPinned ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} />
                    <Text style={[styles.localActionBtnTxt, selectedNotification.isPinned && { color: Colors.BluePrimary }]}>
                      {selectedNotification.isPinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </Pressable>

                  <Pressable 
                    onPress={() => handleToggleArchive(selectedNotification.id)}
                    style={[styles.localActionBtn, selectedNotification.isArchived && { backgroundColor: Colors.BluePrimaryContainer }]}
                  >
                    <Archive size={14} color={selectedNotification.isArchived ? Colors.BluePrimary : Colors.AppOnSurfaceVariant} />
                    <Text style={[styles.localActionBtnTxt, selectedNotification.isArchived && { color: Colors.BluePrimary }]}>
                      {selectedNotification.isArchived ? 'Restore' : 'Archive'}
                    </Text>
                  </Pressable>

                  <Pressable 
                    onPress={() => handleDeleteNotification(selectedNotification.id)}
                    style={[styles.localActionBtn, { borderColor: Colors.RedErrorContainer, borderWidth: 1 }]}
                  >
                    <Trash2 size={14} color={Colors.RedError} />
                    <Text style={[styles.localActionBtnTxt, { color: Colors.RedError }]}>Delete</Text>
                  </Pressable>
                </View>

              </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground },
  headerRight: { width: 40, alignItems: 'center', justifyContent: 'center' },
  actionIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.RedErrorContainer + '30' },
  actionStrip: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.AppSurface, borderBottomWidth: 0.5, borderBottomColor: Colors.AppOutline },
  actionStripBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionStripText: { fontSize: 12, fontWeight: '700', color: Colors.BluePrimary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    marginHorizontal: 16,
    marginTop: 14,
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
    paddingTop: 10,
    paddingBottom: 4,
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
  filterDropdownBtnActive: {
    borderColor: Colors.BluePrimary,
    backgroundColor: Colors.BluePrimaryContainer + '18',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownModalMenu: {
    position: 'absolute',
    backgroundColor: Colors.AppSurface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
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
  content: { padding: 16, gap: 12 },
  groupHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 2,
  },
  emptyCard: { padding: 32 },
  emptyContent: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  emptyText: { fontSize: 16, fontWeight: '800', color: Colors.AppOnBackground },
  emptySub: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  
  // Gmail style notification row
  swipeRowWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  // Dismiss background (shows on right-swipe)
  dismissBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.RedError,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 8,
  },
  dismissBgText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // Action tray (shows on left-swipe, pinned to right edge)
  swipeRightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeActionItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    paddingHorizontal: 4,
  },
  swipeActionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  notificationCard: { 
    padding: 14, 
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderRadius: 0,
  },
  unreadCard: { 
    backgroundColor: Colors.BluePrimaryContainer + '0F', 
    borderLeftWidth: 4,
    borderLeftColor: Colors.BluePrimary,
  },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, gap: 4 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground, flex: 1 },
  unreadTitle: { fontWeight: '950', color: Colors.BlueOnPrimaryContainer },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.BluePrimary },
  cardCloseBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cardMsg: { fontSize: 12, color: Colors.AppOnSurfaceVariant, lineHeight: 17 },
  cardTime: { fontSize: 10, color: Colors.AppOnSurfaceVariant + '80', marginTop: 2 },
  
  // Snackbar
  snackbarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 9999,
  },
  snackbarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  snackbarBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  snackbarBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },

  // Modal Details
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
    gap: 12,
  },
  modalBodyHeader: {
    gap: 4,
  },
  modalNotificationTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: Colors.AppOnBackground,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.AppOutline,
    marginVertical: 4,
  },
  detailSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.AppOnBackground,
  },
  descriptionBody: {
    fontSize: 13,
    color: Colors.AppOnBackground,
    lineHeight: 20,
  },
  actionCtaBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCtaBtnTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deepLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BluePrimary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
  },
  deepLinkBtnTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  localActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.AppOutline,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  localActionBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.AppOnSurfaceVariant,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.AppSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppOutline,
    paddingHorizontal: 16,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabItemActive: {
    borderBottomColor: Colors.BluePrimary,
  },
  subTabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.AppOnSurfaceVariant,
  },
  subTabLabelActive: {
    color: Colors.BluePrimary,
    fontWeight: '800',
  },
});
