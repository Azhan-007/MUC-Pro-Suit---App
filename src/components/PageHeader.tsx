import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../theme';
import { ArrowLeft } from 'lucide-react-native';

interface PageHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBackPress, rightElement }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
        <ArrowLeft size={24} color={Colors.AppOnBackground} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.AppBackground,
  },
  backBtn: {
    width: 70,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.AppOnBackground,
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    width: 70,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 70,
    height: 40,
  },
});
