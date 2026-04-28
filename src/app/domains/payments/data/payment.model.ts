export type PaymentDto = {
  id: string;
  customerId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: string;
  externalReference: string | null;
  status: string;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InitiatePaymentRequest = {
  customerId: string;
  planId: string;
  routerId: string | null;
  type: string;
  method: string;
  currency: string;
  metadata: Record<string, string>;
  accountCode?: string | null;
};
