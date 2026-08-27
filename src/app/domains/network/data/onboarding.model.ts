/** Router-wide activity categories — one append-only log covers every kind of router-facing change. */
export type RouterActivityCategory =
  | 'ONBOARDING'
  | 'DESIRED_CONFIG'
  | 'RECONCILIATION'
  | 'PROVISIONING_PROFILE'
  | 'POOL'
  | 'STATUS';

/** One append-only audit-log entry from a router's full activity history. */
export type RouterActivityEventDto = {
  id: string;
  category: RouterActivityCategory;
  fromState: string | null;
  toState: string;
  step: string | null;
  source: string;
  result: string;
  detail: Record<string, unknown> | null;
  errorMessage: string | null;
  actor: string | null;
  createdAt: string;
};

/**
 * A router's current management-channel lifecycle state plus recent history. Safe to fetch for any
 * router, including one that has never been enrolled — it returns `state: 'NEW'` with no events
 * rather than a 404.
 */
export type RouterManagementStateDto = {
  routerId: string;
  state: string;
  hardwareSerial: string | null;
  routerosVersion: string | null;
  boardName: string | null;
  lastHeartbeatAt: string | null;
  lastReconciledAt: string | null;
  consecutiveFailures: number;
  recentEvents: RouterActivityEventDto[];
};

/**
 * The raw enrollment token is returned exactly once, here — it is never persisted or retrievable
 * again after issuance. Hand it (and the bootstrap script) to whoever installs the router.
 */
export type IssueOnboardingTokenResponse = {
  token: string;
  expiresAt: string;
};

/** Result of an on-demand reconciliation pass triggered from the UI. */
export type ReconciliationResultDto = {
  runId: string;
  routerId: string;
  runStatus: string;
  domainsCompared: number;
  diffsFound: number;
  changesCreated: number;
  routerState: string;
};

export type DeploymentMode = 'MANAGEMENT_ONLY' | 'HOTSPOT' | 'PPPOE' | 'HOTSPOT_PPPOE';
export type TopologySplit = 'VLAN' | 'BRIDGE';
export type FirewallProfile = 'basic' | 'hardened' | 'strict';

/** A router's declared business intent — which services it provides and how they're laid out. */
export type ProvisioningProfileDto = {
  routerId: string;
  deploymentMode: DeploymentMode;
  wanMode: 'DHCP';
  topologySplit: TopologySplit;
  lanInterface: string | null;
  hotspotVlanId: number | null;
  pppoeVlanId: number | null;
  hotspotBridgeName: string | null;
  pppoeBridgeName: string | null;
  hotspotPoolId: string | null;
  pppoePoolId: string | null;
  firewallProfile: FirewallProfile;
  radiusRealm: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpsertProvisioningProfileRequest = {
  deploymentMode: DeploymentMode;
  wanMode?: 'DHCP';
  topologySplit?: TopologySplit;
  lanInterface?: string | null;
  hotspotVlanId?: number | null;
  pppoeVlanId?: number | null;
  hotspotBridgeName?: string | null;
  pppoeBridgeName?: string | null;
  hotspotPoolId?: string | null;
  pppoePoolId?: string | null;
  firewallProfile?: FirewallProfile;
  radiusRealm?: string;
};

/**
 * Resource keys the discovery endpoint accepts — a platform-defined vocabulary, not a raw RouterOS
 * REST path (see backend `RouterDiscoveryService`). Extending discovery to a new resource is a
 * backend map entry plus adding the key here, never a new endpoint/method.
 */
export type DiscoveryResource = 'INTERFACES' | 'VLANS' | 'BRIDGES' | 'IP_ADDRESSES';

/**
 * One raw item from a router's actual, live state — unmapped RouterOS REST fields (e.g. `name`,
 * `type`, `running`, `disabled` for `INTERFACES`; `name`, `vlan-id`, `interface` for `VLANS`).
 */
export type DiscoveredItem = Record<string, unknown>;

/** Result of checking a candidate pool CIDR against a router's actual current addressing. */
export type PoolOverlapResultDto = {
  overlapping: boolean;
  conflictingAddresses: string[];
};
