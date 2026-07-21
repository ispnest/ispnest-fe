export type ContactDto = {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  email: string | null;
};

export type CustomerDto = {
  id: string;
  accountCode: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  status: string;
  balance: number;
  riskScore: number | null;
  riskLastUpdated: string | null;
  serviceType: string;
  accountType: string;
  pppoeUsername: string | null;
  pppoePassword: string | null;
  coordinates: string | null;
  createdAt: string;
  /** Person-level identity shared across multiple service accounts. */
  contact: ContactDto | null;
  defaultPlanRouterId: string | null;
  connected: boolean;
  hasActiveRecharge: boolean;
};

export type CreateCustomerRequest = {
  fullName: string;
  phoneNumber: string;
  email?: string;
  coordinates?: string;
  accountType: string;
  connectionFeeOverride?: number | null;
};

export type CustomerChargeDto = {
  id: string;
  customerId: string;
  type: 'CONNECTION_FEE' | 'ADDITIONAL';
  description: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CLEARED';
  createdAt: string;
  clearedAt: string | null;
  parentChargeId: string | null;
  originalAmount: number | null;
  adjustmentReason: string | null;
  adjustedBy: string | null;
  adjustedAt: string | null;
};

export type CreateChargeRequest = {
  type: 'CONNECTION_FEE' | 'ADDITIONAL';
  description?: string;
  amount: number;
};

export type AdjustChargeRequest = {
  /** New amount for the charge; 0 waives it entirely. */
  amount: number;
  reason: string;
};

export type ExtendServiceRequest = {
  days: number;
  reason: string;
  /** Scopes the extension to a specific active recharge / assigned plan; omit both if neither exists. */
  planId?: string;
  type?: string;
};

export type ServiceExtensionDto = {
  id: string;
  customerId: string;
  rechargeId: string | null;
  days: number;
  reason: string;
  grantedBy: string | null;
  mode: 'extended' | 'created';
  previousExpiration: string | null;
  newExpiration: string;
  createdAt: string;
};

export type UpdateCustomerRequest = {
  username?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  serviceType?: string;
  accountType?: string;
  status?: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  coordinates?: string;
};

export type RechargeDto = {
  id: string;
  customerId: string;
  planId: string | null;
  rechargedOn: string;
  expiration: string | null;
  status: string;
  method: string;
  remainingMb: number | null;
  usedMb: number | null;
  quotaState: string | null;
  paymentId: string | null;
  type: string;
};

export type CreateRechargeRequest = {
  planId: string;
  method: string;
  type?: string;
};

export type MacBindingDto = {
  id: string;
  customerId: string;
  macAddress: string;
  routerId: string | null;
  label: string | null;
  firstSeen: string | null;
  lastSeen: string | null;
  trusted: boolean;
  createdAt?: string;
};

export type HotspotGuestArchiveDto = {
  id: string;
  originalId: string;
  username: string;
  phoneNumber: string | null;
  fullName: string | null;
  totalRecharges: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastMacAddress: string | null;
  archivedReason: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
};

export type HotspotStatsDto = {
  totalGuests: number;
  sessionsToday: number;
  totalArchived: number;
};

export type PppoeStatsDto = {
  total: number;
  active: number;
  suspended: number;
  terminated: number;
  notConnected: number;
  connected: number;
  noActiveRecharge: number;
};

export type AssignedPlanDto = {
  planRouterId: string;
  plan: {
    planRouterId: string;
    planId: string;
    planName: string;
    price: number;
    validity: number | null;
    validityUnit: string | null;
    dataLimit: number | null;
    dataUnit: string | null;
    bandwidthId: string | null;
    bandwidthName: string | null;
    rateDown: number | null;
    rateDownUnit: string | null;
    rateUp: number | null;
    rateUpUnit: string | null;
  };
};

export type CustomerSessionSummaryDto = {
  username: string;
  /** "online" | "offline" | "unknown" */
  sessionStatus: string;
  lastSeen: string | null;
  disconnectCount: number;
  lastDisconnectReason: string | null;
  currentRechargeInputMb: number | null;
  currentRechargeOutputMb: number | null;
  framedIpAddress: string | null;
  acctStatusType: string;
};
