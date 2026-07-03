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
