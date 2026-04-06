export type HotspotPurchaseRequest = {
  phoneNumber: string;
  planId: string;
  mac?: string;
  serverIp?: string;
  chapId?: string;
  chapChallenge?: string;
}

export type HotspotPurchaseResponse = {
  paymentId: string;
  username: string;
  password: string;
}

export type HotspotStatusResponse = {
  ready: boolean;
  status: string;
  username: string | null;
  password: string | null;
  loginUrl: string | null;
}

export type HotspotReconnectResponse = {
  canReconnect: boolean;
  username: string | null;
  password: string | null;
}

