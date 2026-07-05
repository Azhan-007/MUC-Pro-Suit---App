import React, { createContext, useContext, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors } from '../theme';

export interface CampusAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CampusAlertContextType {
  showAlert: (
    title: string,
    message?: string,
    buttons?: CampusAlertButton[]
  ) => void;
  hideAlert: () => void;
}

const CampusAlertContext = createContext<CampusAlertContextType | undefined>(undefined);

export const useCampusAlert = () => {
  const context = useContext(CampusAlertContext);
  if (!context) {
    throw new Error('useCampusAlert must be used within a CampusAlertProvider');
  }
  return context;
};

export const CampusAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<CampusAlertButton[]>([]);

  const showAlert = (
    alertTitle: string,
    alertMessage?: string,
    alertButtons?: CampusAlertButton[]
  ) => {
    setTitle(alertTitle);
    setMessage(alertMessage || '');
    setButtons(alertButtons || [{ text: 'OK' }]);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  return (
    <CampusAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.alertOverlay}>
          <Pressable style={styles.alertDismiss} onPress={hideAlert} />
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{title}</Text>
            {!!message && <Text style={styles.alertMessage}>{message}</Text>}

            {/* Layout buttons column-wise if there are 3 or more; otherwise row-wise */}
            <View style={buttons.length >= 3 ? styles.alertButtonColumn : styles.alertButtonRow}>
              {buttons.map((btn, idx) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.alertButton,
                      isDestructive && styles.alertButtonDestructive,
                      isCancel && styles.alertButtonCancel,
                      !isDestructive && !isCancel && styles.alertButtonDefault,
                      buttons.length < 3 && { flex: 1 }, // Equal width side-by-side buttons
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      hideAlert();
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <Text
                      style={[
                        styles.alertButtonTxt,
                        isCancel && styles.alertButtonTxtCancel,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </CampusAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10000,
  },
  alertDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  alertBox: {
    width: '90%',
    maxWidth: 380, // Landscape rectangle shape
    backgroundColor: Colors.AppSurface || '#FFFFFF',
    borderRadius: 20, // Rounded rectangle container matching screenshot
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: Colors.AppOutline || '#E2E8F0',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.AppOnBackground || '#0F172A',
    textAlign: 'center', // Centered text matching screenshot
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.AppOnSurfaceVariant || '#475569',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 24,
    textAlign: 'center', // Centered message matching screenshot
  },
  alertButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  alertButtonColumn: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  alertButton: {
    height: 48, // Standardized button height
    borderRadius: 12, // Perfect border radius for buttons matching screenshot
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  alertButtonDefault: {
    backgroundColor: Colors.BluePrimary || '#2563EB',
  },
  alertButtonDestructive: {
    backgroundColor: Colors.RedError || '#EF4444',
  },
  alertButtonCancel: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.AppOutline || '#E2E8F0',
  },
  alertButtonTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alertButtonTxtCancel: {
    color: Colors.AppOnSurfaceVariant || '#475569',
  },
});
