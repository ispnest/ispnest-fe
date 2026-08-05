export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'TERMINATED';

export type BillingCycle = 'MONTHLY' | 'WEEKLY' | 'ANNUALLY';

export type LeaseDto = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  renterId: string;
  renterName: string | null;
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  billingCycle: BillingCycle;
  securityDeposit: number | null;
  linkedCustomerId: string | null;
  nextRentDueDate: string | null;
  status: LeaseStatus;
  terminationReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeaseRequest = {
  propertyId: string;
  renterId: string;
  startDate: string;
  endDate?: string | null;
  rentAmount: number;
  billingCycle?: BillingCycle;
  securityDeposit?: number | null;
  notes?: string;
};

export type UpdateLeaseRequest = Omit<CreateLeaseRequest, 'propertyId' | 'renterId'>;

export type TerminateLeaseRequest = {
  reason: string;
};
