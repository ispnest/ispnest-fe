export interface HotspotPurchaseRequest {
  phoneNumber: string;
  planId: string;
  mac?: string;
  serverIp?: string;
  chapId?: string;
  chapChallenge?: string;
}

export interface HotspotPurchaseResponse {
  paymentId: string;
  username: string;
  password: string;
}

export interface HotspotStatusResponse {
  ready: boolean;
  status: string;
  username: string | null;
  password: string | null;
  loginUrl: string | null;
}

export interface HotspotReconnectResponse {
  canReconnect: boolean;
  username: string | null;
  password: string | null;
}

