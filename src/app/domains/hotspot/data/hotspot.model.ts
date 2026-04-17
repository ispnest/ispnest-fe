export type HotspotPurchaseRequest = {
  phoneNumber: string;
  planId: string;
  method: string;
  routerId?: string | null;
  macAddress?: string;
  serverIp?: string;
  clientIp?: string;
  linkOrig?: string;
  chapId?: string;
  chapChallenge?: string;
};

export type HotspotPurchaseResponse = {
  paymentId: string;
  customerId: string;
  /** Account code (DGB-XXXXX) — used as M-PESA Paybill account number. */
  accountCode: string;
  paymentStatus: string;
  message: string | null;
  serverIp: string | null;
  linkOrig: string | null;
  chapId: string | null;
  chapChallenge: string | null;
};

export type HotspotStatusResponse = {
  paymentId: string;
  customerId: string | null;
  paymentStatus: string;
  ready: boolean;
  /** Account code (DGB-XXXXX) — shown as M-PESA Paybill account number. */
  accountCode: string | null;
  planName: string | null;
  expiration: string | null;
  message: string | null;
  provider: string | null;
  amount: number | null;
};

export type HotspotReconnectResponse = {
  customerFound: boolean;
  canReconnect: boolean;
  customerId: string | null;
  /** Account code (DGB-XXXXX) — shown as M-PESA Paybill account number. */
  accountCode: string | null;
  planName: string | null;
  expiration: string | null;
  remainingMb: number | null;
  phoneNumber: string | null;
  message: string | null;
};
