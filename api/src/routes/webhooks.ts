import { Request, Response, Router } from 'express';
import { BlockchainEvent } from '../services/blockchainEvents';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface WebhookPayload {
  programId: string;
  eventName: string;
  data: Record<string, unknown>;
  slot: number;
  timestamp: number;
  signature: string;
}

router.post('/webhook/blockchain', async (req: Request, res: Response) => {
  try {
    const payload: WebhookPayload = req.body;

    console.log(`Received blockchain webhook: ${payload.eventName}`);

    switch (payload.eventName) {
      case 'LoanCreatedEvent':
        await handleLoanCreated(payload.data);
        break;
      case 'LoanApprovedEvent':
        await handleLoanApproved(payload.data);
        break;
      case 'LoanFundedEvent':
        await handleLoanFunded(payload.data);
        break;
      case 'PaymentProcessedEvent':
        await handlePaymentProcessed(payload.data);
        break;
      case 'LoanDelinquentEvent':
        await handleLoanDelinquent(payload.data);
        break;
      case 'LoanDefaultedEvent':
        await handleLoanDefaulted(payload.data);
        break;
      default:
        console.log(`Unhandled event type: ${payload.eventName}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleLoanCreated(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const borrower = data.borrower as string;
  const principalAmount = Number(data.principal_amount);
  const createdAt = new Date(Number(data.created_at) * 1000);

  await prisma.loans.create({
    data: {
      loan_id: loanId,
      borrower_wallet: borrower,
      principal_amount: principalAmount,
      status: 'pending',
      created_at: createdAt,
    },
  });

  console.log(`Loan created: ${loanId}`);
}

async function handleLoanApproved(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const approvedAt = new Date(Number(data.approved_at) * 1000);

  await prisma.loans.update({
    where: { loan_id: loanId },
    data: {
      status: 'approved',
      approved_at: approvedAt,
    },
  });

  console.log(`Loan approved: ${loanId}`);
}

async function handleLoanFunded(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const fundedAt = new Date(Number(data.funded_at) * 1000);
  const disbursementAmount = Number(data.disbursement_amount);

  await prisma.loans.update({
    where: { loan_id: loanId },
    data: {
      status: 'active',
      funded_at: fundedAt,
      funded_amount: disbursementAmount,
    },
  });

  console.log(`Loan funded: ${loanId}`);
}

async function handlePaymentProcessed(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const paymentAmount = Number(data.payment_amount);
  const principalPortion = Number(data.principal_portion);
  const interestPortion = Number(data.interest_portion);
  const remainingPrincipal = Number(data.remaining_principal);
  const paymentDate = new Date(Number(data.payment_date) * 1000);

  await prisma.loans.update({
    where: { loan_id: loanId },
    data: {
      remaining_principal: remainingPrincipal,
      total_paid: { increment: paymentAmount },
    },
  });

  await prisma.payments.create({
    data: {
      loan_id: loanId,
      amount: paymentAmount,
      principal_portion: principalPortion,
      interest_portion: interestPortion,
      status: 'completed',
      paid_date: paymentDate,
    },
  });

  console.log(`Payment processed for loan: ${loanId}`);
}

async function handleLoanDelinquent(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const delinquentAt = new Date(Number(data.delinquent_at) * 1000);

  await prisma.loans.update({
    where: { loan_id: loanId },
    data: {
      status: 'delinquent',
      delinquent_at: delinquentAt,
    },
  });

  console.log(`Loan marked delinquent: ${loanId}`);
}

async function handleLoanDefaulted(data: Record<string, unknown>) {
  const loanId = data.loan_id as string;
  const defaultedAt = new Date(Number(data.defaulted_at) * 1000);
  const remainingPrincipal = Number(data.remaining_principal);

  await prisma.loans.update({
    where: { loan_id: loanId },
    data: {
      status: 'defaulted',
      defaulted_at: defaultedAt,
      remaining_principal: remainingPrincipal,
    },
  });

  console.log(`Loan marked defaulted: ${loanId}`);
}

export default router;
