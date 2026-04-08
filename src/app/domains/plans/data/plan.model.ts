export type PlanDto = {
  id: string;
  name: string;
  bandwidthId: string | null;
  price: number;
  type: string;
  limitType: string | null;
  dataLimit: number | null;
  dataUnit: string | null;
  timeLimit: number | null;
  timeUnit: string | null;
  validity: number | null;
  validityUnit: string | null;
  sharedUsers: number | null;
  routerId: string | null;
  poolId: string | null;
  sessionTimeout: number | null;
  idleTimeout: number | null;
  maxSessions: number | null;
  concurrentDevices: number | null;
  prepaid: boolean | null;
  planType: string | null;
  enabled: boolean | null;
  description: string | null;
  features: string | null;
  badge: string | null;
};

export type CreatePlanRequest = {
  name: string;
  bandwidthId?: string | null;
  price: number;
  type: string;
  limitType?: string | null;
  dataLimit?: number | null;
  dataUnit?: string | null;
  timeLimit?: number | null;
  timeUnit?: string | null;
  validity?: number | null;
  validityUnit?: string | null;
  sharedUsers?: number | null;
  routerId?: string | null;
  poolId?: string | null;
  sessionTimeout?: number | null;
  idleTimeout?: number | null;
  maxSessions?: number | null;
  concurrentDevices?: number | null;
  prepaid?: boolean | null;
  planType?: string | null;
  enabled?: boolean | null;
  description?: string | null;
  features?: string | null;
  badge?: string | null;
};

export type BandwidthDto = {
  id: string;
  name: string;
  rateDown: number;
  rateDownUnit: string;
  rateUp: number;
  rateUpUnit: string;
  burstDown: number | null;
  burstUp: number | null;
  guaranteedDown: number | null;
  guaranteedUp: number | null;
};

export type CreateBandwidthRequest = {
  name: string;
  rateDown: number;
  rateDownUnit: string;
  rateUp: number;
  rateUpUnit: string;
  burstPercent?: number | null;
  guaranteedPercent?: number | null;
};
