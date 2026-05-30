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

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Router onboarding (wizard)
 *  ─────────────────────────────────────────────────────────────────────────
 */

/** Slim payload sent from the wizard — only operator-visible identity is required. */
export type OnboardRouterRequest = {
  name: string;
  description: string;
  /** Optional — captured on a "good to have" basis, never blocks onboarding. */
  coordinates?: string | null;

  // Optional script-render overrides — all backend-defaulted when omitted.
  wanMode?: 'dhcp' | 'static' | null;
  wanInterface?: string | null;
  wanAddressCidr?: string | null;
  wanGateway?: string | null;
  wanDnsServers?: string[] | null;
  lanInterfaces?: string[] | null;
  hotspotVlanId?: number | null;
  pppoeVlanId?: number | null;
  hotspotGatewayCidr?: string | null;
  pppoeGatewayCidr?: string | null;
  radiusRealm?: string | null;
  firewallProfile?: 'basic' | 'hardened' | 'strict' | null;
  hotspotEnabled?: boolean | null;
  pppoeEnabled?: boolean | null;
  trustedManagementCidrs?: string[] | null;
};

/** Body for {@code POST /api/routers/{id}/reonboard}. Both fields are optional. */
export type ReonboardRouterRequest = {
  /** Rotate the WireGuard private key (revokes the previous peer). Default: false. */
  rotateWireGuard?: boolean;
  /** Override the firewall profile baked into the new script. Default: backend default. */
  firewallProfile?: 'basic' | 'hardened' | 'strict' | null;
};

export type OnboardingScriptDto = {
  id: string;
  routerId: string;
  version: number;
  checksum: string;
  firewallProfile: string;
  createdAt: string;
  /** Pre-signed URL the router can use with /tool fetch. */
  downloadUrl: string;
  /** Ready-to-paste MikroTik one-liner. */
  fetchCommand: string;
};

export type WireGuardSummary = {
  clientName: string;
  address: string;
  publicKey: string;
  endpoint: string;
  allowedIps: string;
};

export type OnboardRouterResponse = {
  router: RouterDto;
  script: OnboardingScriptDto;
  wireGuard: WireGuardSummary;
};

/** Snapshot of the 4 verification checks shown in the wizard's Verify step. */
export type RouterOnboardingStatus = {
  routerId: string;
  scriptGenerated: boolean;
  latestScriptVersion: number | null;
  latestScriptCreatedAt: string | null;
  wireGuardReady: boolean;
  wireGuardClientName: string | null;
  wireGuardAddress: string | null;
  poolsSynced: boolean;
  poolsTotal: number;
  poolsSyncedCount: number;
  heartbeatReceived: boolean;
  lastSeen: string | null;
};
