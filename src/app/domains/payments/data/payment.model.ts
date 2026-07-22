export type PaymentDto = {
  id: string;
  customerId: string;
  planId: string;
  planRouterId: string | null;
  amount: number;
  currency: string;
  provider: string;
  externalReference: string | null;
  status: string;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  accountCode: string | null;
};

export type PaymentSummaryPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/** One bucket of the payments graph: total amount and count of payments in that period. */
export type PaymentSummaryPoint = {
  periodStart: string;
  totalAmount: number;
  count: number;
};

/** Payments graph/summary for a date range: overall totals plus one point per period bucket. */
export type PaymentSummary = {
  from: string;
  to: string;
  period: PaymentSummaryPeriod;
  totalAmount: number;
  totalCount: number;
  points: PaymentSummaryPoint[];
};

export type InitiatePaymentRequest = {
  customerId: string;
  planId: string;
  planRouterId: string | null;
  amount?: number;
  type: string;
  method: string;
  currency: string;
  accountCode?: string | null;
  metadata: Record<string, unknown>;
};
