/** SSE heartbeat payload: routerId (UUID string) → lastSeen (ISO-8601 string). */
export type RouterHeartbeatUpdate = Record<string, string>;

export type RouterDto = {
  id: string;
  name: string;

  /**
   * Null until the router completes onboarding — a router is created before its address is known,
   * and only gets one (its stable WireGuard overlay address, not a WAN IP) once WireGuard is
   * claimed during onboarding.
   */
  ipAddress: string | null;
  description: string | null;
  coordinates: string | null;
  nasType: string;
  status: string;
  lastSeen: string | null;

  /**
   * Onboarding lifecycle state (RouterManagementState.state, e.g. 'NEW'|'ENROLLING'|'ONBOARDED'|
   * 'SYNCED'). Only populated on list/page responses (`getPage`/`getAll`) — null on `getById`, since
   * that lookup is cached with no eviction on management-state transitions. See `combinedStatus` in
   * `router-status.util.ts` for how this is combined with the legacy `status` field for display.
   */
  managementState: string | null;
};

/**
 * There is no `ipAddress`/`username`/`password` field — a router is always created before its
 * address is known, and only ever receives one (its WireGuard overlay address) during onboarding.
 */
export type CreateRouterRequest = {
  name: string;
  secret: string;
  description?: string | null;
  coordinates?: string | null;
  nasType: string;
};

/** One pool row — a single pool-name / router pairing with its own CIDR. */
export type PoolDto = {
  id: string;
  name: string;
  localIp: string | null;
  rangeIp: string;
  routerId: string;
  createdAt: string;
  /** Addresses within rangeIp excluded from allocation/the router's pool — set by onboarding only. */
  excludedIps: string[];
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
