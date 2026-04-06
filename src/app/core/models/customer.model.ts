export interface CustomerDto {
  id: string;
  username: string;
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
}

export interface CreateCustomerRequest {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  serviceType: string;
  accountType: string;
  status: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  coordinates?: string;
  planId?: string | null;
  type?: string;
}

export interface UpdateCustomerRequest {
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
}

export interface RechargeDto {
  id: string;
  customerId: string;
  planId: string | null;
  rechargedOn: string;
  expiration: string | null;
  status: string;
  method: string;
  remainingMb: number | null;
  quotaState: string | null;
  paymentId: string | null;
  type: string;
}

export interface CreateRechargeRequest {
  planId: string;
  method: string;
  type?: string;
}

export interface MacBindingDto {
  id: string;
  customerId: string;
  macAddress: string;
  label: string | null;
  createdAt: string;
}

