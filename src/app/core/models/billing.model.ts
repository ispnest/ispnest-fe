export type InvoiceDto = {
  id: string;
  customerId: string;
  planId: string | null;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  creditApplied: number;
  outstandingAmount: number;
  currency: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreditLedgerEntryDto = {
  id: string;
  customerId: string;
  entryType: string;
  amount: number;
  runningBalance: number;
  currency: string;
  reason: string | null;
  description: string | null;
  paymentId: string | null;
  invoiceId: string | null;
  createdAt: string;
}

export type CreditBalanceResponse = {
  customerId: string;
  balance: number;
}

export type ManualCreditRequest = {
  customerId: string;
  amount: number;
  description?: string;
}

export type BillingCycleDto = {
  id: string;
  customerId: string;
  planId: string | null;
  cycleStart: string;
  cycleEnd: string | null;
  status: string;
  createdAt: string;
}

