export type HotspotPurchaseRequest = {
  phoneNumber: string;
  planId: string;
  /** Payment method — e.g. 'mpesa', 'cash'. Required by backend (@NotBlank). */
  method: string;
  routerId?: string | null;
  /** Device MAC address from MikroTik $(mac). Backend field name is macAddress. */
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
  username: string;
  password: string;
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
  /** Payment status string — e.g. 'PENDING', 'COMPLETED', 'FAILED'. */
  paymentStatus: string;
  ready: boolean;
  username: string | null;
  password: string | null;
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
  username: string | null;
  password: string | null;
  planName: string | null;
  expiration: string | null;
  remainingMb: number | null;
  phoneNumber: string | null;
  message: string | null;
};

