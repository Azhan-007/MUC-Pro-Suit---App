import { AuditService } from '../../services/audit.service';
import { AuditOutcome } from '@prisma/client';
import { prisma } from '@muc/database';
import { Decimal } from '@prisma/client/runtime/library';

export class FinanceService {
  /**
   * Allocate payment to charges securely.
   */
  static async allocatePayment(paymentId: string, allocations: { financialChargeId: string; amount: number }[], actorId?: string) {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
      
      const existingPaymentAllocations = await tx.paymentAllocation.aggregate({
        where: { paymentId },
        _sum: { allocatedAmount: true }
      });
      const alreadyAllocatedFromPayment = existingPaymentAllocations._sum.allocatedAmount || new Decimal(0);

      let totalAllocated = new Decimal(0);
      
      for (const alloc of allocations) {
        const chargeAmount = new Decimal(alloc.amount);
        totalAllocated = totalAllocated.add(chargeAmount);

        // Fetch charge with exclusive row lock to prevent concurrent double allocation
        const charge = (await tx.$queryRaw`SELECT id, amount, status FROM financial_charges WHERE id = ${alloc.financialChargeId}::uuid FOR UPDATE`) as any[];
        if (!charge.length) throw new Error('Charge not found');
        
        const existingAllocations = await tx.paymentAllocation.aggregate({
          where: { financialChargeId: alloc.financialChargeId },
          _sum: { allocatedAmount: true }
        });
        
        const alreadyAllocated = existingAllocations._sum.allocatedAmount || new Decimal(0);
        const remainingCharge = new Decimal(charge[0].amount).minus(alreadyAllocated);

        if (chargeAmount.greaterThan(remainingCharge)) {
          throw new Error('Allocation exceeds remaining charge amount.');
        }

        const allocResult = await tx.paymentAllocation.create({
          data: {
            paymentId,
            financialChargeId: alloc.financialChargeId,
            allocatedAmount: chargeAmount
          }
        });
        if (actorId) {
          await AuditService.log({
            actorId,
            action: 'PAYMENT_ALLOCATION',
            resourceType: 'PaymentAllocation',
            resourceId: allocResult.id,
            outcome: AuditOutcome.SUCCESS,
            afterState: { paymentId, chargeId: alloc.financialChargeId, amount: alloc.amount }
          }, tx);
        }

        // Update charge status
        const newTotalAllocated = alreadyAllocated.add(chargeAmount);
        const newStatus = newTotalAllocated.equals(new Decimal(charge[0].amount)) ? 'SETTLED' : 'PARTIALLY_SETTLED';
        
        await tx.financialCharge.update({
          where: { id: alloc.financialChargeId },
          data: { status: newStatus }
        });
      }

      if (alreadyAllocatedFromPayment.add(totalAllocated).greaterThan(payment.amount)) {
        throw new Error('Total allocations exceed payment amount.');
      }

      return { success: true };
    });
  }

  static async getAllFeeStructures() {
    return await prisma.feeStructure.findMany();
  }

  static async getAllFeeAccounts() {
    return await prisma.financialAccount.findMany();
  }

  static async getAllFeePayments() {
    return await prisma.payment.findMany();
  }

  static async getAllScholarships() {
    return await prisma.scholarshipConcession.findMany();
  }

  static async getAllFines() {
    return await prisma.financialCharge.findMany();
  }
}
