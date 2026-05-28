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

/** One pool row — a single pool-name / router pairing with its own CIDR and sync state. */
export type PoolDto = {
  id: string;
  name: string;
  localIp: string | null;
  rangeIp: string;
  routerId: string;
  mikrotikId: string | null;
  syncQueued: boolean;
  createdAt: string;
};

/**
 * Grouped view: one entry per unique pool name containing all router rows that share that name.
 * Returned by GET /pools/all and GET /pools/grouped.
 */
export type PoolGroupDto = {
  name: string;
  routers: PoolDto[];
};

export type CreatePoolRequest = {
  name: string;
  localIp?: string | null;
  rangeIp: string;
  routerId: string;
};
