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
};

export type CreateCustomerRequest = {
  fullName: string;
  phoneNumber: string;
  email?: string;
  coordinates?: string;
  accountType: string;
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
