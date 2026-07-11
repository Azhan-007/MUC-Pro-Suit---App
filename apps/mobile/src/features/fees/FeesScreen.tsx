import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, SectionHeader, StatusChip, CustomButton, PageHeader } from '../../components';
import { Colors } from '../../theme';
import {
  CheckCircle,
  Clock,
  Download,
  Sparkles,
  Receipt,
  CreditCard,
  Smartphone,
  Globe,
  ArrowLeft,
  Lock,
  BadgeCheck,
  ChevronRight,
  GraduationCap,
  AlertCircle,
} from 'lucide-react-native';

type FeeTab = 'DUES' | 'HISTORY';
type PaymentStep =
  | 'CLOSED'
  | 'METHODS'
  | 'CARD_FORM'
  | 'UPI_SELECT'
  | 'NETBANKING_SELECT'
  | 'OTP_VERIFY'
  | 'UPI_PIN'
  | 'PROCESSING'
  | 'SUCCESS';

export const FeesScreen: React.FC = () => {
  const { feeSummary, feeDetails, paymentTransactions, payOutstandingFees } = useCampusStore();
  const [activeTab, setActiveTab] = useState<FeeTab>('DUES');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('CLOSED');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [upiPin, setUpiPin] = useState('');

  // Interactive receipts states
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [selectedFeeComponent, setSelectedFeeComponent] = useState<any | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Custom Alert States
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  
  const totalAmount = feeSummary.outstandingAmount + feeSummary.paidAmount;

  // Filter breakdown items
  const unpaidBreakdown = feeDetails.filter((fee) => !fee.isPaid);
  const paidBreakdown = feeDetails.filter((fee) => fee.isPaid);

  const getFeeCategory = (title: string) => {
    if (!title) return 'Academic Tuition';
    const lower = title.toLowerCase();
    if (lower.includes('hostel') || lower.includes('mess') || lower.includes('dining')) return 'Hostel & Dining';
    if (lower.includes('exam') || lower.includes('test') || lower.includes('registration')) return 'Examination';
    if (lower.includes('library') || lower.includes('book') || lower.includes('resources')) return 'Resources';
    return 'Academic Tuition';
  };

  const startCheckout = () => {
    // Reset payment states
    setSelectedMethod(null);
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setUpiApp(null);
    setUpiId('');
    setSelectedBank(null);
    setOtp('');
    setUpiPin('');
    setPaymentStep('METHODS');
  };

  const handleReceiptDownload = () => {
    setDownloadingReceipt(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setDownloadingReceipt(false);
      setDownloadSuccess(true);
    }, 2000);
  };

  const handleMethodSelect = () => {
    if (selectedMethod === 'Credit/Debit Card') {
      setPaymentStep('CARD_FORM');
    } else if (selectedMethod === 'UPI') {
      const universalUpi = `upi://pay?pa=mucampus@paytm&pn=MU%20Campus%20Portal&am=${feeSummary.outstandingAmount}&cu=INR&tn=Fees%20Payment`;
      openPaymentApp(universalUpi, 'UPI');
    } else if (selectedMethod === 'Net Banking') {
      setPaymentStep('NETBANKING_SELECT');
    }
  };

  const openPaymentApp = async (schemeUrl: string, appName: string) => {
    try {
      await Linking.openURL(schemeUrl);
      
      setPaymentStep('PROCESSING');
      setTimeout(() => {
        payOutstandingFees(appName);
        setPaymentStep('SUCCESS');
      }, 2500);
    } catch (e) {
      // Catch failure (e.g. no UPI apps installed) and fall back to built-in PIN keypad
      setAlertConfig({
        visible: true,
        title: 'UPI Apps Not Found',
        message: 'We could not detect any installed UPI payment apps on this device. Would you like to use our built-in secure UPI PIN screen instead to complete the payment?',
        cancelText: 'Cancel',
        confirmText: 'Use Simulator',
        onCancel: () => setPaymentStep('METHODS'),
        onConfirm: () => setPaymentStep('UPI_PIN'),
      });
    }
  };

  const openBankWebsite = async (bankName: string) => {
    const urls: Record<string, string> = {
      'HDFC Bank': 'https://netbanking.hdfcbank.com/netbanking/',
      'ICICI Bank': 'https://www.icicibank.com/',
      'SBI': 'https://www.onlinesbi.sbi/',
      'Axis Bank': 'https://www.axisbank.com/',
    };
    const url = urls[bankName || ''] || 'https://www.google.com';
    try {
      await Linking.openURL(url);
      setPaymentStep('OTP_VERIFY');
    } catch (e) {
      setPaymentStep('OTP_VERIFY');
    }
  };

  const handleCardSubmit = () => {
    // Proceed to Bank OTP Verification
    setPaymentStep('OTP_VERIFY');
  };

  const handleUpiSubmit = () => {
    if (upiApp) {
      let schemeUrl = 'upi://pay?pa=mucampus@paytm&pn=MU%20Campus%20Portal&am=45000&cu=INR&tn=Fees%20Payment';
      if (upiApp === 'GPay') {
        schemeUrl = 'tez://pay?pa=mucampus@paytm&pn=MU%20Campus%20Portal&am=45000&cu=INR&tn=Fees%20Payment';
      } else if (upiApp === 'PhonePe') {
        schemeUrl = 'phonepe://pay?pa=mucampus@paytm&pn=MU%20Campus%20Portal&am=45000&cu=INR&tn=Fees%20Payment';
      } else if (upiApp === 'Paytm') {
        schemeUrl = 'paytmmp://pay?pa=mucampus@paytm&pn=MU%20Campus%20Portal&am=45000&cu=INR&tn=Fees%20Payment';
      }
      openPaymentApp(schemeUrl, upiApp);
    } else {
      // Custom UPI ID check
      setPaymentStep('PROCESSING');
      setTimeout(() => {
        payOutstandingFees('UPI (' + (upiId || 'Custom ID') + ')');
        setPaymentStep('SUCCESS');
      }, 1500);
    }
  };

  const handleNetbankingSubmit = () => {
    if (selectedBank) {
      openBankWebsite(selectedBank);
    } else {
      setPaymentStep('OTP_VERIFY');
    }
  };

  const handleOtpVerify = () => {
    setPaymentStep('PROCESSING');
    setTimeout(() => {
      payOutstandingFees(selectedMethod || 'Online Bank Transfer');
      setPaymentStep('SUCCESS');
    }, 1500);
  };

  const handleUpiPinVerify = () => {
    setPaymentStep('PROCESSING');
    setTimeout(() => {
      payOutstandingFees(`UPI (${upiApp || 'UPI App'})`);
      setPaymentStep('SUCCESS');
    }, 1500);
  };

  // Formatting helpers
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleKeyPress = (num: string) => {
    if (upiPin.length < 6) {
      setUpiPin((prev) => prev + num);
    }
  };

  const handleKeyDelete = () => {
    setUpiPin((prev) => prev.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Fees & Finances" />

      {/* Segmented Tab Headers */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'DUES' && styles.tabBtnActive]}
          onPress={() => setActiveTab('DUES')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'DUES' && styles.tabBtnTextActive]}>
            Dues & Summary
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'HISTORY' && styles.tabBtnActive]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'HISTORY' && styles.tabBtnTextActive]}>
            Receipts & History
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'DUES' ? (
          /* ── DUES & SUMMARY TAB ── */
          <View>
            {/* Fee Summary Card */}
            <CampusCard style={[styles.card, styles.outstandingCard]} borderColor={Colors.AppOutline} elevation="sm">
              {/* Background circular decorations */}
              <View style={styles.cardDecor1} />
              <View style={styles.cardDecor2} />

              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.outstandingLabel}>OUTSTANDING AMOUNT</Text>
                  <Text style={styles.outstandingAmount}>
                    ₹{feeSummary.outstandingAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                {/* Golden card chip with detailed inner electronic grid */}
                <View style={styles.cardChip}>
                  <View style={styles.chipInnerLineHoriz} />
                  <View style={styles.chipInnerLineVertLeft} />
                  <View style={styles.chipInnerLineVertRight} />
                  <View style={styles.chipCenterCore} />
                </View>
              </View>

              <View style={styles.dueRow}>
                <Clock size={14} color="#E11D48" />
                <Text style={[styles.dueText, { color: '#E11D48' }]}> Due by {feeSummary.dueDateText}</Text>
              </View>

              <View style={{ height: 20 }} />

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${feeSummary.progressPercent * 100}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Paid: ₹{feeSummary.paidAmount.toLocaleString('en-IN')}</Text>
                <Text style={styles.progressLabel}>Total: ₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>

              <View style={{ height: 16 }} />
              {feeSummary.outstandingAmount > 0 ? (
                <CustomButton text="Pay Outstanding Fees" onPress={startCheckout} fullWidth />
              ) : (
                <View style={styles.allPaidContainer}>
                  <View style={styles.allPaidHeader}>
                    <BadgeCheck size={20} color="#10B981" />
                    <Text style={styles.allPaidTitle}>No Dues Outstanding</Text>
                  </View>
                  <Text style={styles.allPaidSub}>All fees for the current semester have been fully settled. Thank you!</Text>
                </View>
              )}
            </CampusCard>

            {/* Unpaid breakdowns */}
            <SectionHeader title="Breakdown of Dues" />
            {unpaidBreakdown.length === 0 ? (
              <View style={styles.emptyContainer}>
                <BadgeCheck size={36} color="#10B981" />
                <Text style={styles.emptyText}>No pending dues. All payments are up to date!</Text>
              </View>
            ) : (
              unpaidBreakdown.map((fee, idx) => (
                <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <View style={styles.feeRow}>
                    <View style={styles.feeLeft}>
                      <View style={[styles.feeStatusDot, { backgroundColor: Colors.ColorPending }]} />
                      <View>
                        <Text style={styles.feeTitle}>{fee.title}</Text>
                        <Text style={styles.feeDate}>Due: {fee.dueDateText}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString('en-IN')}</Text>
                      <StatusChip text="Pending" level="WARNING" />
                    </View>
                  </View>
                </CampusCard>
              ))
            )}
          </View>
        ) : (
          <View>
            {/* Payment Details summary */}
            <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Payment Date</Text>
                <Text style={styles.detailValue}>{feeSummary.lastPaymentDate}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Due Date</Text>
                <Text style={[styles.detailValue, { color: '#E11D48' }]}>{feeSummary.nextDueDate}</Text>
              </View>
            </CampusCard>

            {/* Download receipt card */}
            <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
              <Pressable style={styles.downloadRow} onPress={handleReceiptDownload}>
                <View style={[styles.downloadIcon, { backgroundColor: Colors.RedErrorContainer }]}>
                  <Download size={20} color={Colors.RedError} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.downloadTitle}>Fee Receipt (PDF)</Text>
                  <Text style={styles.downloadSub}>Download latest receipt</Text>
                </View>
                <Download size={22} color={Colors.BluePrimary} />
              </Pressable>
            </CampusCard>

            {/* Paid breakdowns */}
            <SectionHeader title="Settled Payments" />
            {paidBreakdown.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No settled payments found.</Text>
              </View>
            ) : (
              paidBreakdown.map((fee, idx) => (
                <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <Pressable style={styles.feeComponentRow} onPress={() => setSelectedFeeComponent(fee)}>
                    <View style={styles.feeLeft}>
                      <View style={[styles.academicIconBox, { backgroundColor: '#ECFDF5' }]}>
                        <GraduationCap size={20} color="#10B981" />
                      </View>
                      <View>
                        <Text style={styles.feeTitle}>{fee.title}</Text>
                        <Text style={styles.feeCategoryText}>{getFeeCategory(fee.title)} Component</Text>
                        <Text style={styles.feeDate}>Cleared: {fee.settledDateText}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString('en-IN')}</Text>
                        <View style={styles.componentClearedBadge}>
                          <Text style={styles.componentClearedText}>Cleared</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94A3B8" />
                    </View>
                  </Pressable>
                </CampusCard>
              ))
            )}

            {/* Payment Transactions List */}
            <SectionHeader title="Transaction Logs" />
            {paymentTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transaction records available.</Text>
              </View>
            ) : (
              paymentTransactions.map((txn, idx) => (
                <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
                  <Pressable style={styles.txnRow} onPress={() => setSelectedTransaction(txn)}>
                    <View style={styles.txnLeft}>
                      <View style={[styles.txnIconBox, { backgroundColor: '#F1F5F9' }]}>
                        <CreditCard size={18} color="#475569" />
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.txnReceipt} numberOfLines={1}>TXN ID: #{txn.receiptNumber}</Text>
                        <Text style={styles.txnDate}>{txn.date}</Text>
                        <View style={styles.methodBadge}>
                          <Text style={styles.methodBadgeText}>via {txn.method}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={styles.txnAmount}>₹{txn.amount.toLocaleString('en-IN')}</Text>
                      <ChevronRight size={16} color="#94A3B8" />
                    </View>
                  </Pressable>
                </CampusCard>
              ))
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── HIGH FIDELITY MOCK PAYMENT PORTAL MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentStep !== 'CLOSED'}
        onRequestClose={() => setPaymentStep('CLOSED')}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.portalOverlay}
        >
          <View style={styles.portalContent}>
            
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* STEP 1: PAYMENT METHOD SELECTION */}
              {paymentStep === 'METHODS' && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.portalTitle}>Select Payment Option</Text>
                  <Text style={styles.portalSubtitle}>Amount to Pay: ₹{feeSummary.outstandingAmount.toLocaleString('en-IN')}</Text>

                  <View style={styles.optionsList}>
                    <Pressable
                      style={[styles.optionItem, selectedMethod === 'UPI' && styles.optionItemActive]}
                      onPress={() => setSelectedMethod('UPI')}
                    >
                      <View style={[styles.optionIconBox, { backgroundColor: '#E0F2FE' }]}>
                        <Smartphone size={20} color="#0284C7" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>UPI (GPay, PhonePe, Paytm)</Text>
                        <Text style={styles.optionSub}>Pay instantly using any UPI app</Text>
                      </View>
                      <View style={[styles.optionRadio, selectedMethod === 'UPI' && styles.optionRadioActive]}>
                        {selectedMethod === 'UPI' && <View style={styles.optionRadioInner} />}
                      </View>
                    </Pressable>

                    <Pressable
                      style={[styles.optionItem, selectedMethod === 'Credit/Debit Card' && styles.optionItemActive]}
                      onPress={() => setSelectedMethod('Credit/Debit Card')}
                    >
                      <View style={[styles.optionIconBox, { backgroundColor: '#FEE2E2' }]}>
                        <CreditCard size={20} color="#EF4444" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Credit / Debit Card</Text>
                        <Text style={styles.optionSub}>Visa, Mastercard, RuPay, etc.</Text>
                      </View>
                      <View style={[styles.optionRadio, selectedMethod === 'Credit/Debit Card' && styles.optionRadioActive]}>
                        {selectedMethod === 'Credit/Debit Card' && <View style={styles.optionRadioInner} />}
                      </View>
                    </Pressable>

                    <Pressable
                      style={[styles.optionItem, selectedMethod === 'Net Banking' && styles.optionItemActive]}
                      onPress={() => setSelectedMethod('Net Banking')}
                    >
                      <View style={[styles.optionIconBox, { backgroundColor: '#F5F3FF' }]}>
                        <Globe size={20} color="#8B5CF6" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Net Banking</Text>
                        <Text style={styles.optionSub}>Select from all major Indian banks</Text>
                      </View>
                      <View style={[styles.optionRadio, selectedMethod === 'Net Banking' && styles.optionRadioActive]}>
                        {selectedMethod === 'Net Banking' && <View style={styles.optionRadioInner} />}
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.portalActionRow}>
                    <Pressable style={[styles.portalBtn, styles.portalBtnSecondary]} onPress={() => setPaymentStep('CLOSED')}>
                      <Text style={styles.portalBtnTextSecondary}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      disabled={!selectedMethod}
                      style={[styles.portalBtn, styles.portalBtnPrimary, !selectedMethod && styles.portalBtnDisabled]}
                      onPress={handleMethodSelect}
                    >
                      <Text style={styles.portalBtnTextPrimary}>Next</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* STEP 2: CREDIT/DEBIT CARD FORM */}
              {paymentStep === 'CARD_FORM' && (
                <View style={{ width: '100%' }}>
                  <View style={styles.stepHeader}>
                    <Pressable onPress={() => setPaymentStep('METHODS')} style={styles.backBtn}>
                      <ArrowLeft size={20} color="#1E293B" />
                    </Pressable>
                    <Text style={styles.stepTitle}>Enter Card Details</Text>
                  </View>

                  {/* Visa/Mastercard Card Preview */}
                  <View style={styles.cardPreview}>
                    <View style={styles.cardPreviewDecor} />
                    <View style={styles.cardPreviewTop}>
                      <View style={styles.cardPreviewChip} />
                      <Text style={styles.cardPreviewLogo}>
                        {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'Mastercard' : 'CARD'}
                      </Text>
                    </View>
                    <Text style={styles.cardPreviewNumber}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </Text>
                    <View style={styles.cardPreviewBottom}>
                      <View>
                        <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                        <Text style={styles.cardPreviewName}>{cardName.toUpperCase() || 'YOUR NAME'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                        <Text style={styles.cardPreviewExpiry}>{cardExpiry || 'MM/YY'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Form Fields */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Card Number</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="4111 2222 3333 4444"
                      keyboardType="numeric"
                      maxLength={19}
                      value={cardNumber}
                      onChangeText={(val) => setCardNumber(formatCardNumber(val))}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Cardholder Name</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="John Doe"
                      autoCapitalize="words"
                      value={cardName}
                      onChangeText={setCardName}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Expiry Date</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="MM/YY"
                        keyboardType="numeric"
                        maxLength={5}
                        value={cardExpiry}
                        onChangeText={(val) => setCardExpiry(formatExpiry(val))}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>CVV</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="123"
                        keyboardType="numeric"
                        maxLength={3}
                        secureTextEntry
                        value={cardCvv}
                        onChangeText={setCardCvv}
                      />
                    </View>
                  </View>

                  <Pressable
                    disabled={cardNumber.length < 19 || cardName.length < 3 || cardExpiry.length < 5 || cardCvv.length < 3}
                    style={[
                      styles.portalBtn,
                      styles.portalBtnPrimary,
                      { marginTop: 12 },
                      (cardNumber.length < 19 || cardName.length < 3 || cardExpiry.length < 5 || cardCvv.length < 3) && styles.portalBtnDisabled
                    ]}
                    onPress={handleCardSubmit}
                  >
                    <Text style={styles.portalBtnTextPrimary}>Pay ₹{feeSummary.outstandingAmount.toLocaleString('en-IN')}</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 4: NETBANKING SELECT */}
              {paymentStep === 'NETBANKING_SELECT' && (
                <View style={{ width: '100%' }}>
                  <View style={styles.stepHeader}>
                    <Pressable onPress={() => setPaymentStep('METHODS')} style={styles.backBtn}>
                      <ArrowLeft size={20} color="#1E293B" />
                    </Pressable>
                    <Text style={styles.stepTitle}>Select Bank</Text>
                  </View>

                  <Text style={styles.sectionLabel}>Popular Banks</Text>
                  <View style={styles.bankGrid}>
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => {
                      const isSelected = selectedBank === bank;
                      return (
                        <Pressable
                          key={bank}
                          style={[styles.bankGridItem, isSelected && styles.bankGridItemActive]}
                          onPress={() => setSelectedBank(bank)}
                        >
                          <Text style={[styles.bankGridText, isSelected && styles.bankGridTextActive]}>{bank}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    disabled={!selectedBank}
                    style={[
                      styles.portalBtn,
                      styles.portalBtnPrimary,
                      { marginTop: 32 },
                      !selectedBank && styles.portalBtnDisabled
                    ]}
                    onPress={handleNetbankingSubmit}
                  >
                    <Text style={styles.portalBtnTextPrimary}>Pay via Net Banking</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 5: BANK OTP VERIFICATION */}
              {paymentStep === 'OTP_VERIFY' && (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <View style={[styles.modalIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Lock size={26} color="#D97706" />
                  </View>
                  <Text style={styles.portalTitle}>OTP Verification</Text>
                  <Text style={styles.otpMessage}>
                    A secure 6-digit One Time Password (OTP) has been sent to your registered mobile number ending with ******89.
                  </Text>

                  <View style={[styles.formGroup, { width: '80%', alignItems: 'center' }]}>
                    <TextInput
                      style={[styles.formInput, styles.otpInput]}
                      placeholder="000 000"
                      keyboardType="numeric"
                      maxLength={6}
                      textAlign="center"
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>

                  <View style={styles.portalActionRow}>
                    <Pressable style={[styles.portalBtn, styles.portalBtnSecondary]} onPress={() => setPaymentStep('CLOSED')}>
                      <Text style={styles.portalBtnTextSecondary}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      disabled={otp.length < 6}
                      style={[styles.portalBtn, styles.portalBtnPrimary, otp.length < 6 && styles.portalBtnDisabled]}
                      onPress={handleOtpVerify}
                    >
                      <Text style={styles.portalBtnTextPrimary}>Verify & Pay</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* STEP 6: SECURE UPI PIN KEYPAD */}
              {paymentStep === 'UPI_PIN' && (
                <View style={styles.upiPinOverlay}>
                  <View style={styles.upiPinHeader}>
                    <Text style={styles.upiPinTitle}>ENTER UPI PIN</Text>
                    <Text style={styles.upiPinAmount}>₹{feeSummary.outstandingAmount.toLocaleString('en-IN')}</Text>
                  </View>

                  {/* PIN Dots indicators */}
                  <View style={styles.pinDotsRow}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.pinDot,
                          upiPin.length > idx && styles.pinDotFilled,
                        ]}
                      />
                    ))}
                  </View>

                  <Text style={styles.upiPinMessage}>Sending money securely via UPI gateway</Text>

                  {/* Custom Keypad Grid */}
                  <View style={styles.keypad}>
                    {[
                      ['1', '2', '3'],
                      ['4', '5', '6'],
                      ['7', '8', '9'],
                      ['clear', '0', 'confirm'],
                    ].map((row, rowIdx) => (
                      <View key={rowIdx} style={styles.keypadRow}>
                        {row.map((key) => {
                          if (key === 'clear') {
                            return (
                              <Pressable key={key} style={styles.keypadBtn} onPress={handleKeyDelete}>
                                <ArrowLeft size={20} color="#1E293B" />
                              </Pressable>
                            );
                          }
                          if (key === 'confirm') {
                            return (
                              <Pressable
                                key={key}
                                disabled={upiPin.length < 4}
                                style={[styles.keypadBtn, styles.keypadBtnConfirm]}
                                onPress={handleUpiPinVerify}
                              >
                                <CheckCircle size={22} color={upiPin.length >= 4 ? '#FFFFFF' : '#94A3B8'} />
                              </Pressable>
                            );
                          }
                          return (
                            <Pressable key={key} style={styles.keypadBtn} onPress={() => handleKeyPress(key)}>
                              <Text style={styles.keypadBtnText}>{key}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* STEP 7: PROCESSING TRANSACTION LOADER */}
              {paymentStep === 'PROCESSING' && (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                  <Text style={styles.portalTitle}>Authorizing Transaction</Text>
                  <Text style={styles.portalMessage}>
                    Connecting securely to the banking gateway. Please do not close this window or hit back.
                  </Text>
                </View>
              )}

              {/* STEP 8: PAYMENT SUCCESS CARD */}
              {paymentStep === 'SUCCESS' && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  {/* Visual success check */}
                  <View style={styles.successIconWrapper}>
                    <View style={styles.successIconOuter}>
                      <View style={styles.successIconInner}>
                        <CheckCircle size={36} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.successHeading}>Payment Successful!</Text>
                  <Text style={styles.successMessage}>
                    Your outstanding fee dues have been fully cleared and updated in our system database.
                  </Text>

                  {/* Receipt Card Mockup */}
                  <View style={styles.receiptMock}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptUniText}>MUC CAMPUS PORTAL</Text>
                      <Text style={styles.receiptTitle}>OFFICIAL TRANSACTION RECEIPT</Text>
                    </View>
                    
                    {/* Tear separator */}
                    <View style={styles.tearSeparator}>
                      <View style={styles.tearLine} />
                    </View>

                    <View style={styles.receiptBody}>
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Transaction Date</Text>
                        <Text style={styles.receiptVal}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                      </View>
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Reference No.</Text>
                        <Text style={styles.receiptVal}>TXN-{Math.floor(100000 + Math.random() * 900000)}</Text>
                      </View>
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Payment Method</Text>
                        <Text style={styles.receiptVal}>{selectedMethod || 'UPI Transfer'}</Text>
                      </View>
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Status</Text>
                        <Text style={[styles.receiptVal, { color: '#10B981', fontWeight: '800' }]}>SUCCESS</Text>
                      </View>

                      <View style={styles.receiptTotalDivider} />

                      <View style={styles.receiptRow}>
                        <Text style={[styles.receiptLabel, { fontWeight: '700', color: '#1E293B' }]}>Amount Paid</Text>
                        <Text style={styles.receiptTotalVal}>₹{feeSummary.paidAmount.toLocaleString('en-IN')}</Text>
                      </View>
                    </View>

                    {/* Tear separator */}
                    <View style={styles.tearSeparator}>
                      <View style={styles.tearLine} />
                    </View>
                    
                    <Text style={styles.receiptFooter}>A copy of this invoice has been logged in your Receipts tab.</Text>
                  </View>

                  <Pressable
                    style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                    onPress={() => setPaymentStep('CLOSED')}
                  >
                    <Text style={styles.portalBtnTextPrimary}>Done & Close</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── TRANSACTION DETAIL RECEIPT MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedTransaction !== null}
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Receipt size={26} color={Colors.BluePrimary} />
              </View>
              
              <Text style={styles.portalTitle}>Transaction Details</Text>
              <Text style={styles.portalSubtitle}>Receipt #{selectedTransaction?.receiptNumber}</Text>

              {/* Receipt Card Mockup */}
              <View style={styles.receiptMock}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptUniText}>MUC CAMPUS PORTAL</Text>
                  <Text style={styles.receiptTitle}>OFFICIAL TRANSACTION RECEIPT</Text>
                </View>
                
                {/* Tear separator */}
                <View style={styles.tearSeparator}>
                  <View style={styles.tearLine} />
                </View>

                <View style={styles.receiptBody}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Transaction Date</Text>
                    <Text style={styles.receiptVal}>{selectedTransaction?.date}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Reference No.</Text>
                    <Text style={styles.receiptVal}>TXN-{selectedTransaction?.receiptNumber || '000000'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment Method</Text>
                    <Text style={styles.receiptVal}>{selectedTransaction?.method || 'Online Transfer'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Status</Text>
                    <Text style={[styles.receiptVal, { color: '#10B981', fontWeight: '800' }]}>SUCCESS</Text>
                  </View>

                  <View style={styles.receiptTotalDivider} />

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { fontWeight: '700', color: '#1E293B' }]}>Amount Paid</Text>
                    <Text style={styles.receiptTotalVal}>₹{selectedTransaction?.amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Tear separator */}
                <View style={styles.tearSeparator}>
                  <View style={styles.tearLine} />
                </View>
                
                <Text style={styles.receiptFooter}>This is a secure system generated copy.</Text>
              </View>

              <Pressable
                style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                onPress={() => setSelectedTransaction(null)}
              >
                <Text style={styles.portalBtnTextPrimary}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── PDF DOWNLOAD LOADER MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={downloadingReceipt || downloadSuccess}
        onRequestClose={() => {
          setDownloadingReceipt(false);
          setDownloadSuccess(false);
        }}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            {downloadingReceipt && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator size="large" color={Colors.BluePrimary} style={{ marginBottom: 16 }} />
                <Text style={styles.portalTitle}>Generating Receipt PDF</Text>
                <Text style={styles.portalMessage}>
                  Compiling transaction logs and formatting invoice tables...
                </Text>
              </View>
            )}
            {downloadSuccess && (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#E6FBF3' }]}>
                  <BadgeCheck size={30} color="#10B981" />
                </View>
                <Text style={styles.portalTitle}>Receipt Downloaded</Text>
                <Text style={styles.portalMessage}>
                  Fee statement receipt PDF has been successfully saved to your device Downloads folder.
                </Text>
                <Pressable
                  style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                  onPress={() => setDownloadSuccess(false)}
                >
                  <Text style={styles.portalBtnTextPrimary}>OK</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── ACADEMIC FEE COMPONENT DETAIL MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedFeeComponent !== null}
        onRequestClose={() => setSelectedFeeComponent(null)}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#ECFDF5' }]}>
                <GraduationCap size={26} color="#10B981" />
              </View>
              
              <Text style={styles.portalTitle}>Fee Component Cleared</Text>
              <Text style={styles.portalSubtitle}>{selectedFeeComponent?.title}</Text>

              {/* Component Info Box */}
              <View style={styles.componentDetailBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Component Name</Text>
                  <Text style={styles.receiptVal}>{selectedFeeComponent?.title}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Academic Category</Text>
                  <Text style={styles.receiptVal}>{getFeeCategory(selectedFeeComponent?.title || '')}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Settlement Date</Text>
                  <Text style={styles.receiptVal}>{selectedFeeComponent?.settledDateText || 'Current Semester'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={[styles.receiptVal, { color: '#10B981', fontWeight: '800' }]}>FULLY SETTLED</Text>
                </View>
                
                <View style={styles.receiptTotalDivider} />
                
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { fontWeight: '700', color: '#1E293B' }]}>Cleared Amount</Text>
                  <Text style={styles.receiptTotalVal}>₹{selectedFeeComponent?.amount.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.componentDescriptionCard}>
                  <Text style={styles.componentDescriptionTitle}>Description</Text>
                  <Text style={styles.componentDescriptionText}>
                    This fee component covers the standard {selectedFeeComponent?.title.toLowerCase()} dues allocated for the academic term, officially processed and updated in the student portal database.
                  </Text>
                </View>
              </View>

              <Pressable
                style={[styles.portalBtn, styles.portalBtnPrimary, { width: '100%', flex: 0 }]}
                onPress={() => setSelectedFeeComponent(null)}
              >
                <Text style={styles.portalBtnTextPrimary}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── CUSTOM DUAL ACTION ALERT MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertConfig.visible}
        onRequestClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.portalOverlay}>
          <View style={styles.portalContent}>
            <View style={[styles.modalIconBox, { backgroundColor: '#FEF2F2' }]}>
              <AlertCircle size={30} color="#EF4444" />
            </View>
            <Text style={styles.portalTitle}>{alertConfig.title}</Text>
            <Text style={[styles.portalTitle, { fontSize: 13, color: '#64748B', fontWeight: '500', lineHeight: 18, marginBottom: 20 }]}>
              {alertConfig.message}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              {alertConfig.cancelText && (
                <Pressable
                  style={[
                    styles.portalBtn,
                    styles.portalBtnCancel,
                    { flex: 1 },
                  ]}
                  onPress={() => {
                    setAlertConfig((prev) => ({ ...prev, visible: false }));
                    if (alertConfig.onCancel) alertConfig.onCancel();
                  }}
                >
                  <Text style={styles.portalBtnTextCancel}>{alertConfig.cancelText}</Text>
                </Pressable>
              )}
              {alertConfig.confirmText && (
                <Pressable
                  style={[
                    styles.portalBtn,
                    styles.portalBtnPrimary,
                    { flex: 1 },
                  ]}
                  onPress={() => {
                    setAlertConfig((prev) => ({ ...prev, visible: false }));
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                  }}
                >
                  <Text style={styles.portalBtnTextPrimary}>{alertConfig.confirmText}</Text>
                </Pressable>
              )}
            </View>
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
  outstandingCard: {
    overflow: 'hidden',
    position: 'relative',
  },
  cardDecor1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.05)', // Very soft blue decal
  },
  cardDecor2: {
    position: 'absolute',
    left: -50,
    bottom: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.03)', // Very soft purple decal
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardChip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FEF08A', // Light gold background
    borderWidth: 1,
    borderColor: '#D97706', // Gold border
    position: 'relative',
    overflow: 'hidden',
    marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInnerLineHoriz: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D97706',
  },
  chipInnerLineVertLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 11,
    width: 1,
    backgroundColor: '#D97706',
  },
  chipInnerLineVertRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 11,
    width: 1,
    backgroundColor: '#D97706',
  },
  chipCenterCore: {
    width: 12,
    height: 9,
    borderRadius: 1.5,
    backgroundColor: '#FEF08A',
    borderWidth: 1,
    borderColor: '#D97706',
    zIndex: 1,
  },
  outstandingLabel: { fontSize: 10, fontWeight: '700', color: Colors.AppOnSurfaceVariant, letterSpacing: 0.8 },
  outstandingAmount: { fontSize: 34, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dueText: { fontSize: 12, color: '#E11D48', fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.AppOutline, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.BluePrimary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 12, color: Colors.AppOnSurfaceVariant, fontWeight: '500' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feeStatusDot: { width: 8, height: 8, borderRadius: 4 },
  feeTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  feeDate: { fontSize: 11, color: Colors.AppOnSurfaceVariant, marginTop: 2 },
  feeAmount: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground, marginBottom: 4 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.ColorPresent + '1A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  paidText: { fontSize: 11, fontWeight: '600', color: Colors.ColorPresent },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txnIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txnReceipt: { fontSize: 14, fontWeight: '700', color: Colors.AppOnBackground },
  txnDate: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  txnAmount: { fontSize: 16, fontWeight: '700', color: Colors.AppOnBackground },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: Colors.AppOnSurfaceVariant },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.AppOnBackground },
  downloadRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  downloadIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  downloadTitle: { fontSize: 15, fontWeight: '700', color: Colors.AppOnBackground },
  downloadSub: { fontSize: 11, color: Colors.AppOnSurfaceVariant },
  allPaidMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 8 },
  allPaidText: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.AppOnSurfaceVariant, fontWeight: '600', textAlign: 'center' },

  // Portal overlay & checkout dialog
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
  optionsList: { width: '100%', marginBottom: 20, gap: 12 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  optionItemActive: { borderColor: Colors.BluePrimary, backgroundColor: '#F0F9FF' },
  optionIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  optionSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
  optionRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#94A3B8', alignItems: 'center', justifyContent: 'center' },
  optionRadioActive: { borderColor: Colors.BluePrimary },
  optionRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.BluePrimary },
  portalActionRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 12 },
  portalBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBtnPrimary: { backgroundColor: Colors.BluePrimary },
  portalBtnSecondary: { backgroundColor: '#F1F5F9' },
  portalBtnDisabled: { backgroundColor: '#CBD5E1' },
  portalBtnTextPrimary: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  portalBtnTextSecondary: { color: '#64748B', fontSize: 13, fontWeight: '700' },

  // Card form step
  stepHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 16 },
  backBtn: { padding: 4, marginRight: 8 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  cardPreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPreviewDecor: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPreviewChip: { width: 34, height: 24, borderRadius: 4, backgroundColor: '#E2E8F0', opacity: 0.7 },
  cardPreviewLogo: { fontSize: 12, fontWeight: '900', color: '#FFFFFF', opacity: 0.9 },
  cardPreviewNumber: { fontSize: 18, color: '#FFFFFF', letterSpacing: 2, textAlign: 'center', marginVertical: 14, fontWeight: '600' },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardPreviewLabel: { fontSize: 8, color: '#94A3B8', fontWeight: '600' },
  cardPreviewName: { fontSize: 11, color: '#FFFFFF', marginTop: 2, fontWeight: '700', letterSpacing: 0.5 },
  cardPreviewExpiry: { fontSize: 11, color: '#FFFFFF', marginTop: 2, fontWeight: '700' },
  formGroup: { marginBottom: 12, width: '100%' },
  formLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  formInput: { height: 40, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, fontSize: 13, color: '#1E293B' },
  formRow: { flexDirection: 'row', gap: 12 },

  // UPI select step
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 10, width: '100%' },
  upiAppsContainer: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' },
  upiAppBtn: { flex: 1, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, alignItems: 'center' },
  upiAppBtnActive: { borderColor: Colors.BluePrimary, backgroundColor: '#F0F9FF' },
  upiAppText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  upiAppTextActive: { color: Colors.BluePrimary, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 10, color: '#94A3B8', marginHorizontal: 10, fontWeight: '700' },

  // Netbanking step
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  bankGridItem: { width: '48%', paddingVertical: 12, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bankGridItemActive: { borderColor: Colors.BluePrimary, backgroundColor: '#F0F9FF' },
  bankGridText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  bankGridTextActive: { color: Colors.BluePrimary },

  // OTP Verification Step
  otpMessage: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  otpInput: { fontSize: 20, letterSpacing: 4, height: 48, fontWeight: '700', borderColor: '#94A3B8' },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  portalMessage: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20, fontWeight: '500' },

  // Secure UPI PIN Keyboard styles
  upiPinOverlay: { width: '100%', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12 },
  upiPinHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 10, marginBottom: 14 },
  upiPinTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  upiPinAmount: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  pinDotsRow: { flexDirection: 'row', gap: 14, marginVertical: 16 },
  pinDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#94A3B8' },
  pinDotFilled: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  upiPinMessage: { fontSize: 10, color: '#64748B', marginBottom: 16, fontWeight: '600' },
  keypad: { width: '100%', gap: 10 },
  keypadRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  keypadBtn: { width: 70, height: 46, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  keypadBtnConfirm: { backgroundColor: '#10B981' },
  keypadBtnText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 16 },

  // Cleared dues layout
  allPaidContainer: {
    backgroundColor: '#ECFDF5', // Emerald-50
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0', // Emerald-200
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  allPaidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  allPaidTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46', // Emerald-800
  },
  allPaidSub: {
    fontSize: 12,
    color: '#047857', // Emerald-700
    textAlign: 'center',
    lineHeight: 18,
  },

  // Success state styles
  successIconWrapper: {
    marginVertical: 12,
  },
  successIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D1FAE5', // Emerald 100
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981', // Emerald 500
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  receiptMock: {
    width: '100%',
    backgroundColor: '#F8FAFC', // Slate 50
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptUniText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.5,
  },
  receiptTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tearSeparator: {
    height: 10,
    justifyContent: 'center',
    marginVertical: 6,
  },
  tearLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  receiptBody: {
    paddingVertical: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  receiptVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  receiptTotalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  receiptTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
  },
  receiptFooter: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },

  // Differentiated receipts styles
  academicIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeComponentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeCategoryText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  componentClearedBadge: {
    backgroundColor: '#E6FBF3', // Soft green-50
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  componentClearedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  methodBadge: {
    backgroundColor: '#F1F5F9', // Slate-100
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  methodBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  componentDetailBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  componentDescriptionCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  componentDescriptionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  componentDescriptionText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  portalBtnCancel: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  portalBtnTextCancel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
