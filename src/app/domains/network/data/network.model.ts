/** SSE heartbeat payload: routerId (UUID string) → lastSeen (ISO-8601 string). */
export type RouterHeartbeatUpdate = Record<string, string>;

export type RouterDto = {
  id: string;
  name: string;
  ipAddress: string;
  username: string;
  description: string | null;
  coordinates: string | null;
  nasType: string;
  status: string;
  lastSeen: string | null;
};

export type CreateRouterRequest = {
  name: string;
  ipAddress: string;
  username: string;
  password?: string;
  description?: string | null;
  coordinates?: string | null;
  nasType: string;
};

export type PoolDto = {
  id: string;
  name: string;
  routerId: string;
  ranges: string;
  description: string | null;
  createdAt: string;
};

export type CreatePoolRequest = {
  name: string;
  routerId: string;
  ranges: string;
  description?: string | null;
};
