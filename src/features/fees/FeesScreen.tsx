import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCampusStore } from '../../store/campusStore';
import { CampusCard, SectionHeader, StatusChip, CustomButton, PageHeader } from '../../components';
import { Colors } from '../../theme';
import { CheckCircle, Clock, Download, Sparkles } from 'lucide-react-native';

export const FeesScreen: React.FC = () => {
  const { feeSummary, feeDetails, paymentTransactions } = useCampusStore();
  const totalAmount = feeSummary.outstandingAmount + feeSummary.paidAmount;

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <PageHeader title="Fees" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Fee Summary Card ── */}
        <CampusCard style={styles.card}>
          <Text style={styles.outstandingLabel}>Outstanding Amount</Text>
          <Text style={styles.outstandingAmount}>
            ₹{feeSummary.outstandingAmount.toLocaleString('en-IN')}
          </Text>
          <View style={styles.dueRow}>
            <Clock size={14} color={Colors.ColorPending} />
            <Text style={styles.dueText}> {feeSummary.dueDateText}</Text>
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

          <View style={styles.divider} />

          {/* Scholarship row */}
          <View style={styles.scholarshipRow}>
            <View style={[styles.scholarshipBadge]}>
              <Sparkles size={14} color={Colors.TealTertiary} />
              <Text style={styles.scholarshipText}>{feeSummary.scholarshipApplied}</Text>
            </View>
            <Text style={styles.scholarshipDiscount}>{feeSummary.scholarshipDiscount}</Text>
          </View>

          <View style={{ height: 16 }} />
          <CustomButton text="Pay Now" onPress={() => {}} fullWidth />
        </CampusCard>

        {/* ── 2. Fee Details ── */}
        <SectionHeader title="Fee Breakdown" />
        {feeDetails.map((fee, idx) => (
          <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
            <View style={styles.feeRow}>
              <View style={styles.feeLeft}>
                <View style={[styles.feeStatusDot, { backgroundColor: fee.isPaid ? Colors.ColorPresent : Colors.ColorPending }]} />
                <View>
                  <Text style={styles.feeTitle}>{fee.title}</Text>
                  <Text style={styles.feeDate}>
                    {fee.isPaid ? fee.settledDateText : fee.dueDateText}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString('en-IN')}</Text>
                {fee.isPaid ? (
                  <View style={styles.paidBadge}>
                    <CheckCircle size={12} color={Colors.ColorPresent} />
                    <Text style={styles.paidText}>Paid</Text>
                  </View>
                ) : (
                  <StatusChip text="Pending" level="WARNING" />
                )}
              </View>
            </View>
          </CampusCard>
        ))}

        {/* ── 3. Payment History ── */}
        <SectionHeader title="Payment History" />
        {paymentTransactions.map((txn, idx) => (
          <CampusCard key={idx} borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
            <View style={styles.txnRow}>
              <View style={styles.txnLeft}>
                <View style={[styles.txnIcon, { backgroundColor: Colors.ColorPresent + '1A' }]}>
                  <CheckCircle size={18} color={Colors.ColorPresent} />
                </View>
                <View>
                  <Text style={styles.txnReceipt}>Receipt #{txn.receiptNumber}</Text>
                  <Text style={styles.txnDate}>{txn.date} • {txn.method}</Text>
                </View>
              </View>
              <Text style={styles.txnAmount}>₹{txn.amount.toLocaleString('en-IN')}</Text>
            </View>
          </CampusCard>
        ))}

        {/* ── 4. Payment Details Summary ── */}
        <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Payment</Text>
            <Text style={styles.detailValue}>{feeSummary.lastPaymentDate}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Due</Text>
            <Text style={[styles.detailValue, { color: Colors.ColorPending }]}>{feeSummary.nextDueDate}</Text>
          </View>
        </CampusCard>

        {/* Download receipt */}
        <CampusCard borderColor={Colors.AppOutline} style={styles.card} elevation="sm">
          <Pressable style={styles.downloadRow}>
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

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  card: { marginBottom: 16 },
  outstandingLabel: { fontSize: 11, fontWeight: '700', color: Colors.AppOnSurfaceVariant },
  outstandingAmount: { fontSize: 36, fontWeight: '900', color: Colors.AppOnBackground, marginTop: 4 },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dueText: { fontSize: 13, color: Colors.ColorPending, fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.AppOutline, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.BluePrimary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  divider: { height: 1, backgroundColor: Colors.AppOutline, marginVertical: 16 },
  scholarshipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scholarshipBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.TealTertiaryContainer, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  scholarshipText: { fontSize: 12, fontWeight: '600', color: Colors.TealTertiary },
  scholarshipDiscount: { fontSize: 13, fontWeight: '700', color: Colors.TealTertiary },
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
});
