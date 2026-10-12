import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert, Linking } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { apiClient } from '../lib/apiClient';
import { CustomButton } from '../components/CustomButton';
import { Colors } from '../theme/colors';

interface OTAResponse {
  latestVersion: string;
  otaUpdateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string;
  minRequiredVersion: string;
}

const AppUpdateContext = createContext({});

export const AppUpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mandatoryUpdate, setMandatoryUpdate] = useState<OTAResponse | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      
      // 1. Fetch OTA config from backend (short timeout so it never stalls startup)
      const appVersion = Constants.expoConfig?.version || '1.0.0';
      const res = await apiClient
        .get(`/system/ota?platform=${Platform.OS.toUpperCase()}&currentVersion=${appVersion}`, { timeout: 2000 })
        .catch(() => null);

      if (!res?.data?.success) {
        setIsChecking(false);
        return; // Silent fail
      }

      const otaInfo: OTAResponse = res.data.data;

      // 2. Check if a binary update is required
      if (appVersion < otaInfo.minRequiredVersion) {
        setMandatoryUpdate(otaInfo);
        setIsChecking(false);
        return;
      }

      // 3. Check for OTA Update via Expo
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          if (otaInfo.isMandatory) {
            setMandatoryUpdate(otaInfo);
          } else {
            // Optional update prompt
            Alert.alert(
              'Update Available',
              `A new version is available. Would you like to update now?\n\n${otaInfo.releaseNotes}`,
              [
                { text: 'Later', style: 'cancel' },
                { text: 'Update', onPress: downloadUpdate }
              ]
            );
          }
        }
      }
    } catch (error) {
      console.log('OTA Check Error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      setIsDownloading(true);
      if (!__DEV__) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Update Downloaded',
          'The app will now restart to apply the update.',
          [{ text: 'Restart', onPress: () => Updates.reloadAsync() }],
          { cancelable: false }
        );
      } else {
        // Mock behavior in dev
        setTimeout(() => {
          Alert.alert('Dev Mode', 'OTA downloaded (mock).');
          setIsDownloading(false);
        }, 1500);
      }
    } catch (error) {
      Alert.alert('Update Failed', 'Failed to download the update. Please check your internet connection.');
      setIsDownloading(false);
    }
  };

  const handleStoreUpdate = () => {
    // Open app store or play store
    const storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/' : 'market://details?id=com.mucprosuit.app';
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Could not open the store.');
    });
  };

  // If a mandatory update is required, block the UI
  if (mandatoryUpdate) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.notes}>{mandatoryUpdate.releaseNotes}</Text>
          
          {isDownloading ? (
            <View style={styles.downloading}>
              <ActivityIndicator size="small" color={Colors.BluePrimary} />
              <Text style={styles.downloadText}>Downloading update...</Text>
            </View>
          ) : (
            <CustomButton 
              text={__DEV__ || (Constants.expoConfig?.version && Constants.expoConfig.version < mandatoryUpdate.minRequiredVersion) ? "Update from Store" : "Download Update"} 
              onPress={__DEV__ || (Constants.expoConfig?.version && Constants.expoConfig.version < mandatoryUpdate.minRequiredVersion) ? handleStoreUpdate : downloadUpdate}
              style={styles.button}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <AppUpdateContext.Provider value={{ checkForUpdates }}>
      {children}
    </AppUpdateContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  notes: {
    fontSize: 15,
    color: '#4a4a4a',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
  downloading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  downloadText: {
    fontSize: 15,
    color: Colors.BluePrimary,
    fontWeight: '600',
  }
});
